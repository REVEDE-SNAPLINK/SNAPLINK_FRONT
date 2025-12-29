import { useState, useCallback, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigation} from '@react-navigation/native';
import PortfolioOnboardingView, {
  PortfolioOnboardingFormData, Tag,
} from '@/screens/photographer/PortfolioOnboarding/PortfolioOnboardingView.tsx';
import { MainNavigationProp } from '@/types/navigation.ts';
import { useConceptsQuery, useRegionsQuery } from '@/queries/meta.ts';
import {
  useCreatePortfolioMutation,
  usePatchPhotographerProfileImageMutation,
  useSignPhotographerMutation,
} from '@/mutations/photographers.ts';
import { Alert, requestPermission } from '@/components/theme';
import {
  CameraOptions,
  ImageLibraryOptions,
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import { Image as ImageCompressor } from 'react-native-compressor';
import { generateImageFilename } from '@/utils/format.ts';
import { UploadImageParams } from '@/types/image.ts';
import { DayOfWeek, PhotographerScheduleItem, UploadImageFile } from '@/api/photographers.ts';

// TODO: API 연결 후 삭제
const dummyTags: Tag[] = [
  { id: 1, keyword: '프로필' },
  { id: 2, keyword: '스튜디오' },
  { id: 3, keyword: '인물스냅' },
  { id: 4, keyword: '패션' },
  { id: 5, keyword: '헤어' },
  { id: 6, keyword: '광고/협찬' },
  { id: 7, keyword: '컨셉' },
  { id: 8, keyword: '일상' },
  { id: 9, keyword: '여행' },
  { id: 10, keyword: '커플' },
  { id: 11, keyword: '우정' },
  { id: 12, keyword: '웨딩' },
  { id: 13, keyword: '이벤트' },
  { id: 14, keyword: '한복' },
  { id: 15, keyword: '반려동물' },
  { id: 16, keyword: '풍경' },
  { id: 17, keyword: '자연광' },
  { id: 18, keyword: '야간' },
  { id: 19, keyword: '코스프레' },
  { id: 20, keyword: '특수분장' },
  { id: 21, keyword: '음식' },
  { id: 22, keyword: '제품' },
  { id: 23, keyword: '영상' },
  { id: 24, keyword: '기타' },
];

const TOTAL_STEPS = 9;

const DAY_KO_TO_ENUM = {
  '월요일': 'MONDAY',
  '화요일': 'TUESDAY',
  '수요일': 'WEDNESDAY',
  '목요일': 'THURSDAY',
  '금요일': 'FRIDAY',
  '토요일': 'SATURDAY',
  '일요일': 'SUNDAY',
} as const satisfies Record<string, DayOfWeek>;

type DayKo = keyof typeof DAY_KO_TO_ENUM;

const formatToHHmm = (date: Date): string => {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}:00`;
};

const buildSchedulesFromForm = (
  availableDays: string[],
  daySchedules: { [day: string]: { startTime: Date | null; endTime: Date | null } },
): PhotographerScheduleItem[] => {
  return availableDays
    .filter((day): day is DayKo => day in DAY_KO_TO_ENUM && day !== '공휴일')
    .filter((day) => {
      const schedule = daySchedules[day];
      return schedule && schedule.startTime && schedule.endTime;
    })
    .map((day) => {
      const schedule = daySchedules[day];
      return {
        dayOfWeek: DAY_KO_TO_ENUM[day],
        startTime: formatToHHmm(schedule.startTime!),
        endTime: formatToHHmm(schedule.endTime!),
      };
    });
};

export default function PortfolioOnboardingContainer() {
  const { data: regions, isLoading: isLoadingRegions } = useRegionsQuery();
  const { data: concepts, isLoading: isLoadingConcepts } = useConceptsQuery();

  const navigation = useNavigation<MainNavigationProp>();

  const { mutate: uploadProfile } = usePatchPhotographerProfileImageMutation();
  const { mutate: uploadPortfolio } = useCreatePortfolioMutation();
  const { mutate: signPhotographer } = useSignPhotographerMutation();

  const [currentStep, setCurrentStep] = useState(0);
  const [profileImageURI, setProfileImageURI] = useState<UploadImageFile | undefined>(undefined);
  const [photoURIs, setPhotoURIs] = useState<UploadImageFile[]>([]);
  const [checkedImages, setCheckedImages] = useState<boolean[]>([]);
  const [pendingNextStep, setPendingNextStep] = useState<null | 2 | 3 | 4>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PortfolioOnboardingFormData>({
    defaultValues: {
      description: '',
      regionIds: [],
      conceptIds: [],
      tagIds: [],
      shootingProductName: '',
      shootingProductBasePrice: '',
      shootingProductPhotoTime: null,
      shootingProductPersonnel: null,
      shootingProductDescription: '',
      shootingProductEditingType: null,
      shootingProductProvidesRawFile: false,
      shootingProductEditingDeadline: null,
      shootingProductSelectionAuthority: null,
      shootingProductProvidedEditCount: '',
      availableDays: [],
      daySchedules: {},
      unavailableDateDescription: '',
      shootingProductOptions: [],
    },
    mode: 'onChange',
  });

  const watchedDescription = watch('description');
  const watchedRegionIds = watch('regionIds');
  const watchedTagIds = watch('tagIds');
  const watchedConceptIds = watch('conceptIds');
  const watchedShootingProductName = watch('shootingProductName');
  const watchedShootingProductBasePrice = watch('shootingProductBasePrice');
  const watchedShootingProductPhotoTime = watch('shootingProductPhotoTime');
  const watchedShootingProductPersonnel = watch('shootingProductPersonnel');
  const watchedShootingProductOptions = watch('shootingProductOptions');
  const watchedShootingProductEditingType = watch('shootingProductEditingType');
  const watchedShootingProductEditingDeadline = watch('shootingProductEditingDeadline');
  const watchedShootingProductSelectionAuthority = watch('shootingProductSelectionAuthority');
  const watchedAvailableDays = watch('availableDays');
  const watchedDaySchedules = watch('daySchedules');
  const watchedUnavailableDateDescription = watch('unavailableDateDescription');

  const validateStep = useCallback(
    async (step: number): Promise<boolean> => {
      switch (step) {
        case 0:
          // Step1: 프로필 사진과 한 줄 소개
          return profileImageURI !== undefined && watchedDescription.trim() !== '';
        case 1:
          // Step2: 포트폴리오 사진 (최소 1장)
          return photoURIs.length >= 1;
        case 2:
          // Step3: 활동 지역 (최소 1개)
          return watchedRegionIds.length >= 1;
        case 3:
          // Step4: 활동 키워드 (최소 1개)
          return watchedTagIds.length >= 1;
        case 4:
          // Step5: 활동 컨셉 (최소 1개)
          return watchedConceptIds.length >= 1;
        case 5:
          // Step6: 촬영 정보
          return (
            watchedShootingProductName.trim() !== '' &&
            watchedShootingProductBasePrice.trim() !== '' &&
            watchedShootingProductPhotoTime !== null &&
            watchedShootingProductPersonnel !== null
          );
        case 6: {
          // Step7: 추가 옵션
          // 추가 옵션 자체는 필수가 아님
          if (watchedShootingProductOptions.length === 0) return true;

          // 각 옵션에서 하나라도 값이 입력되면, time을 제외한 모든 필드가 필수
          return watchedShootingProductOptions.every(option => {
            const hasAnyValue = option.name.trim() !== '' ||
                                option.description.trim() !== '' ||
                                option.price.trim() !== '';

            if (!hasAnyValue) {
              // 모든 필드가 비어있으면 유효 (입력하지 않음)
              return true;
            }

            // 하나라도 입력했으면 time을 제외한 모든 필드가 필수
            return (
              option.name.trim() !== '' &&
              option.description.trim() !== '' &&
              option.price.trim() !== ''
            );
          });
        }
        case 7:
          // Step8: 보정 정보
          if (watchedShootingProductEditingType === '제공하지 않음') {
            return true;
          }
          return (
            watchedShootingProductEditingType !== null &&
            watchedShootingProductEditingDeadline !== null &&
            watchedShootingProductSelectionAuthority !== null
          );
        case 8:
          // Step9: 촬영 가능 일정
          if (watchedAvailableDays.length < 1) return false;

          // Check if all selected weekdays (except 공휴일) have time schedules
          const selectedWeekdays = watchedAvailableDays.filter(day => day !== '공휴일');
          if (selectedWeekdays.length === 0 && watchedAvailableDays.includes('공휴일')) {
            return true; // Only 공휴일 is selected, which doesn't need time
          }

          return selectedWeekdays.every(day => {
            const schedule = watchedDaySchedules[day];
            return schedule && schedule.startTime !== null && schedule.endTime !== null;
          });
        default:
          return false;
      }
    },
    [
      profileImageURI,
      photoURIs,
      watchedDescription,
      watchedRegionIds,
      watchedTagIds,
      watchedConceptIds,
      watchedShootingProductName,
      watchedShootingProductBasePrice,
      watchedShootingProductPhotoTime,
      watchedShootingProductPersonnel,
      watchedShootingProductOptions,
      watchedShootingProductEditingType,
      watchedShootingProductEditingDeadline,
      watchedShootingProductSelectionAuthority,
      watchedAvailableDays,
      watchedDaySchedules,
    ]
  );

  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 0:
        return profileImageURI !== undefined && watchedDescription.trim() !== '';
      case 1:
        return photoURIs.length >= 1;
      case 2:
        return watchedRegionIds.length >= 1;
      case 3:
        return watchedTagIds.length >= 1;
      case 4:
        return watchedConceptIds.length >= 1;
      case 5:
        return (
          watchedShootingProductName.trim() !== '' &&
          watchedShootingProductBasePrice.trim() !== '' &&
          watchedShootingProductPhotoTime !== null &&
          watchedShootingProductPersonnel !== null
        );
      case 6: {
        // 추가 옵션 자체는 필수가 아님
        if (watchedShootingProductOptions.length === 0) return true;

        // 각 옵션에서 하나라도 값이 입력되면, time을 제외한 모든 필드가 필수
        return watchedShootingProductOptions.every(option => {
          const hasAnyValue = option.name.trim() !== '' ||
                              option.description.trim() !== '' ||
                              option.price.trim() !== '';

          if (!hasAnyValue) {
            // 모든 필드가 비어있으면 유효 (입력하지 않음)
            return true;
          }

          // 하나라도 입력했으면 time을 제외한 모든 필드가 필수
          return (
            option.name.trim() !== '' &&
            option.description.trim() !== '' &&
            option.price.trim() !== ''
          );
        });
      }
      case 7:
        if (watchedShootingProductEditingType === '제공하지 않음') {
          return true;
        }
        return (
          watchedShootingProductEditingType !== null &&
          watchedShootingProductEditingDeadline !== null &&
          watchedShootingProductSelectionAuthority !== null
        );
      case 8: {
        if (watchedAvailableDays.length < 1) return false;

        // Check if all selected weekdays (except 공휴일) have time schedules
        const selectedWeekdays = watchedAvailableDays.filter(day => day !== '공휴일');
        if (selectedWeekdays.length === 0 && watchedAvailableDays.includes('공휴일')) {
          return true; // Only 공휴일 is selected, which doesn't need time
        }

        return selectedWeekdays.every(day => {
          const schedule = watchedDaySchedules[day];
          return schedule && schedule.startTime !== null && schedule.endTime !== null;
        });
      }
      default:
        return false;
    }
  }, [
    currentStep,
    profileImageURI,
    photoURIs,
    watchedDescription,
    watchedRegionIds,
    watchedTagIds,
    watchedConceptIds,
    watchedShootingProductName,
    watchedShootingProductBasePrice,
    watchedShootingProductPhotoTime,
    watchedShootingProductPersonnel,
    watchedShootingProductOptions,
    watchedShootingProductEditingType,
    watchedShootingProductEditingDeadline,
    watchedShootingProductSelectionAuthority,
    watchedAvailableDays,
    watchedDaySchedules,
  ]);

  // 진행률 계산
  const progress = useMemo(() => {
    if (currentStep === 0) return 0;
    if (currentStep === 1) return 10;
    if (currentStep === 2) return 20;
    if (currentStep === 3) return 30;
    if (currentStep === 4) return 40;
    if (currentStep === 5) return 50;
    if (currentStep === 6) return 60;
    if (currentStep === 7) return 75;
    if (currentStep === 8 && !isStepValid) return 90;
    return 100;
  }, [currentStep, isStepValid]);

  const handlePressBack = () => {
    if (currentStep === 0) {
      navigation.goBack();
    } else {
      setCurrentStep(currentStep - 1);
    }
  }

  const handlePressSubmit = async () => {
    if (!isStepValid) return;

    const isValid = await validateStep(currentStep);
    if (!isValid) return;

    if (currentStep < TOTAL_STEPS - 1) {
      if (currentStep === 0 && profileImageURI !== undefined) {
        uploadProfile({
          image: {
            uri: profileImageURI.uri,
            name: generateImageFilename(profileImageURI.type, 'photographer_profile'),
            type: profileImageURI.type,
          }
        });
      }

      if (currentStep === 1 && photoURIs.length >= 1) {
        uploadPortfolio({
          request: { content: "" },
          images: photoURIs
        });
      }

      if (currentStep === 2) {
        setPendingNextStep(2);
        return;
      }
      // TODO: API 연결 후 추가
      // if (currentStep === 3) {
      //   setPendingNextStep(3);
      //   return;
      // }
      if (currentStep === 4) {
        setPendingNextStep(4);
        return;
      }
      setCurrentStep((prev) => prev + 1);

    } else {
      await handleSubmit(onSubmit)();
    }
  };

  useEffect(() => {
    if (pendingNextStep === 2) {
      if (!isLoadingRegions && regions) {
        setPendingNextStep(null);
        setCurrentStep(3);
      }
    }
  }, [pendingNextStep, isLoadingRegions, regions]);

  // TODO: API 연결 후 추가 (tags)
  // useEffect(() => {
  //   if (pendingNextStep === 3) {
  //     if (!isLoadingRegions && regions) {
  //       setPendingNextStep(null);
  //       setCurrentStep(4);
  //     }
  //   }
  // }, [pendingNextStep, isLoadingRegions, regions]);

  useEffect(() => {
    if (pendingNextStep === 4) {
      if (!isLoadingConcepts && concepts) {
        setPendingNextStep(null);
        setCurrentStep(5);
      }
    }
  }, [pendingNextStep, isLoadingConcepts, concepts]);

  const onSubmit = useCallback(
    async (data: PortfolioOnboardingFormData) => {
      // Helper function to convert time duration to minutes
      const parsePhotoTime = (timeStr: string | null): number => {
        if (!timeStr || timeStr.trim() === '') return 60; // default 1 hour
        if (timeStr === '6시간 이상') return 360;

        // Check if it's a numeric string (from dropdown: "1.5", "2", "6")
        const numericValue = parseFloat(timeStr);
        if (!isNaN(numericValue)) {
          // It's a number in hours (e.g., 1.5 hours = 90 minutes)
          return Math.round(numericValue * 60);
        }

        // Parse Korean format "X시간 Y분" or "X시간" or "X분"
        const hourMatch = timeStr.match(/(\d+)시간/);
        const minuteMatch = timeStr.match(/(\d+)분/);

        const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
        const minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 0;

        return hours * 60 + minutes;
      };

      // Helper function to parse personnel
      const parsePersonnel = (personnelStr: string | null): number => {
        if (!personnelStr) return 1;
        if (personnelStr === '6명 이상') return 6;

        const match = personnelStr.match(/(\d+)명/);
        return match ? parseInt(match[1]) : 1;
      };

      // Map editing type
      const mapEditingType = (type: string | null): "FACIAL" | "COLOR" | "BOTH" | "NONE" => {
        switch (type) {
          case '얼굴 보정': return 'FACIAL';
          case '색감 보정': return 'COLOR';
          case '얼굴, 색감 보정': return 'BOTH';
          case '제공하지 않음': return 'NONE';
          default: return 'NONE';
        }
      };

      // Map editing deadline
      const mapEditingDeadline = (deadline: string | null): "SAME_DAY" | "WITHIN_2_DAYS" | "WITHIN_3_DAYS" | "WITHIN_4_DAYS" | "WITHIN_5_DAYS" | "WITHIN_7_DAYS" => {
        switch (deadline) {
          case '당일 보정': return 'SAME_DAY';
          case '2일 이내': return 'WITHIN_2_DAYS';
          case '3일 이내': return 'WITHIN_3_DAYS';
          case '4일 이내': return 'WITHIN_4_DAYS';
          case '5일 이내': return 'WITHIN_5_DAYS';
          case '7일 이내': return 'WITHIN_7_DAYS';
          default: return 'WITHIN_7_DAYS';
        }
      };

      // Map selection authority
      const mapSelectionAuthority = (authority: string | null): "PHOTOGRAPHER" | "CUSTOMER" | "BOTH" => {
        switch (authority) {
          case '작가 선택': return 'PHOTOGRAPHER';
          case '고객 선택': return 'CUSTOMER';
          case '작가와 고객 함께 선택': return 'BOTH';
          default: return 'BOTH';
        }
      };

      // Build shooting product
      const shootingProduct = {
        name: data.shootingProductName,
        basePrice: parseInt(data.shootingProductBasePrice),
        description: data.shootingProductDescription,
        photoTime: parsePhotoTime(data.shootingProductPhotoTime),
        personnel: parsePersonnel(data.shootingProductPersonnel),
        providesRawFile: data.shootingProductProvidesRawFile,
        editingType: mapEditingType(data.shootingProductEditingType),
        editingDeadline: mapEditingDeadline(data.shootingProductEditingDeadline),
        providedEditCount: parseInt(data.shootingProductProvidedEditCount) || 0,
        selectionAuthority: mapSelectionAuthority(data.shootingProductSelectionAuthority),
        options: data.shootingProductOptions
          .filter(opt => opt.name.trim() !== '' && opt.description.trim() !== '' && opt.price.trim() !== '')
          .map(opt => ({
            name: opt.name,
            description: opt.description,
            price: parseInt(opt.price),
            additionalTime: opt.time && opt.time.trim() !== '' ? parsePhotoTime(opt.time) : 0,
          })),
      };

      const params = {
        description: data.description,
        regionIds: data.regionIds,
        conceptIds: data.conceptIds,
        schedules: buildSchedulesFromForm(data.availableDays, data.daySchedules),
        isPublicHolidays: data.availableDays.includes("공휴일"),
        tag: data.tagIds, // Array of tag IDs
        shootingProduct,
      };

      console.log('=== PortfolioOnboarding API Request ===');
      console.log(JSON.stringify(params, null, 2));
      console.log('=======================================');

      signPhotographer(params, {
        onSuccess: () => {
          Alert.show({
            title: '🎉프로필과 포트폴리오 등록이 완료되었어요!',
            message: '프로필과 포트폴리오에 등록한 내용은 더보기-마이페이지에서 언제든지 추가,수정,변경이 가능해요.',
            buttons: [
              {
                text: '확인',
                onPress: () => {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Home' }],
                  });
                },
              },
            ],
          });
        },
        onError: (e) => {
          console.error(e);
          Alert.show({
            title: '오류',
            message: '등록에 실패했습니다.',
            buttons: [
              {
                text: '확인',
                onPress: () => {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Home' }],
                  });
                },
              },
            ],
          });
        },
      });
    },
    [navigation, signPhotographer]
  );

  const handleCamera = useCallback(async () => {
    requestPermission(
      'camera',
      async () => {
        // 권한 허용됨 - 카메라 열기
        const options: CameraOptions = {
          mediaType: 'photo',
          saveToPhotos: true,
        };

        const response: ImagePickerResponse = await launchCamera(options);

        console.log('Camera response:', {
          didCancel: response.didCancel,
          errorCode: response.errorCode,
          errorMessage: response.errorMessage,
          assetsLength: response.assets?.length,
          firstAssetUri: response.assets?.[0]?.uri,
        });

        if (response.didCancel) {
          console.log('User cancelled camera');
          return;
        }
        if (response.errorCode) {
          console.log('Camera error:', response.errorCode, response.errorMessage);
          Alert.show({
            title: '카메라 오류',
            message: response.errorMessage || '알 수 없는 오류',
          });
          return;
        }
        if (response.assets && response.assets[0] &&  response.assets[0].uri && response.assets[0].fileName && response.assets[0].type) {
          try {
            const compressedUri = await ImageCompressor.compress(response.assets[0].uri, {
              compressionMethod: 'auto',
              maxWidth: 400,
              maxHeight: 400,
              quality: 0.6,
            });

            setProfileImageURI({
              uri: compressedUri,
              name: response.assets[0].fileName,
              type: response.assets[0].type,
            });
          } catch (error) {
            console.error('Camera image compression failed:', error);
            Alert.show({
              title: '이미지 압축 실패',
              message: '이미지 압축 중 오류가 발생했습니다.',
            });
          }
        } else {
          console.log('No image URI found in response');
        }
      }
    );
  }, []);

  const handleGalleryForProfile = useCallback(async () => {
    requestPermission(
      'photo',
      async () => {
        // 권한 허용됨 - 갤러리 열기
        const options: ImageLibraryOptions = {
          mediaType: 'photo',
          selectionLimit: 1,
        };

        const response: ImagePickerResponse = await launchImageLibrary(options);

        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.show({
            title: '갤러리 오류',
            message: response.errorMessage || '알 수 없는 오류',
          });
          return;
        }
        if (response.assets && response.assets[0] &&  response.assets[0].uri && response.assets[0].fileName && response.assets[0].type) {
          try {
            const compressedUri = await ImageCompressor.compress(response.assets[0].uri, {
              compressionMethod: 'auto',
              maxWidth: 400,
              maxHeight: 400,
              quality: 0.6,
            });

            setProfileImageURI({
              uri: compressedUri,
              name: response.assets[0].fileName,
              type: response.assets[0].type,
            });
          } catch (error) {
            console.error('Image compression failed:', error);
            Alert.show({
              title: '이미지 압축 실패',
              message: '이미지 압축 중 오류가 발생했습니다.',
            });
          }
        }
      }
    );
  }, []);

  const handleProfileImageUpload = useCallback(() => {
    Alert.show({
      title: '프로필 사진 변경',
      message: '프로필 사진을 어떻게 업로드하시겠습니까?',
      buttons: [
        {
          text: '카메라',
          onPress: handleCamera,
          type: 'destructive',
        },
        {
          text: '갤러리',
          onPress: handleGalleryForProfile,
          type: 'destructive',
        },
        {
          text: '취소',
          onPress: () => console.log('취소됨'),
          type: 'cancel',
        },
      ],
    });
  }, [handleCamera, handleGalleryForProfile]);

  const handlePhotoUpload = useCallback(async () => {
    requestPermission(
      'photo',
      async () => {
        // 권한 허용됨 - 갤러리 열기
        const options: ImageLibraryOptions = {
          mediaType: 'photo',
          selectionLimit: 0,
        };

        const response: ImagePickerResponse = await launchImageLibrary(options);

        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.show({
            title: '갤러리 오류',
            message: response.errorMessage || '알 수 없는 오류',
          });
          return;
        }
        if (response.assets && response.assets.length > 0) {
          try {
            const compressedImages = await Promise.all(
              response.assets
                .filter(
                  (asset): asset is UploadImageParams =>
                    !!asset.uri && !!asset.fileName && !!asset.type,
                )
                .map(async (asset) => {
                  const compressedUri = await ImageCompressor.compress(asset.uri!, {
                    compressionMethod: 'auto',
                    maxWidth: 1000,
                    maxHeight: 1000,
                    quality: 0.7,
                  });

                  return {
                    uri: compressedUri,
                    name: generateImageFilename(asset.type, 'photographer_portfolio'),
                    type: asset.type!,
                  };
                })
            );

            setPhotoURIs([...photoURIs, ...compressedImages]);
            setCheckedImages([...checkedImages, ...Array(compressedImages.length).fill(false)]);
          } catch (error) {
            console.error('Portfolio image compression failed:', error);
            Alert.show({
              title: '이미지 압축 실패',
              message: '이미지 압축 중 오류가 발생했습니다.',
            });
          }
        }
      }
    );
  }, [photoURIs, checkedImages]);

  const handleCheckedImages = (index: number) => {
    setCheckedImages([...checkedImages.slice(0, index), !checkedImages[index], ...checkedImages.slice(index + 1)]);
  }

  const handleDeletePhotos = () => {
    const newPhotoURIs = [];
    if (checkedImages.length > 0) {
      for (let i = 0; i < checkedImages.length; i++) {
        if (!checkedImages[i]) newPhotoURIs.push(photoURIs[i]);
      }
    }
    setPhotoURIs(newPhotoURIs);
    setCheckedImages([...Array(newPhotoURIs.length).fill(false)]);
  }

  const handleToggleRegion = useCallback((id: number) => {
    setValue(
      'regionIds',
      watchedRegionIds.includes(id)
        ? watchedRegionIds.filter((l) => l !== id)
        : [...watchedRegionIds, id]
    );
  }, [setValue, watchedRegionIds]);

  const handleToggleTag = useCallback((id: number) => {
    setValue(
      'tagIds',
      watchedTagIds.includes(id)
        ? watchedTagIds.filter((l) => l !== id)
        : [...watchedTagIds, id]
    );
  }, [setValue, watchedTagIds]);

  const handleToggleConcept = useCallback((id: number) => {
    setValue(
      'conceptIds',
      watchedConceptIds.includes(id)
        ? watchedConceptIds.filter((c) => c !== id)
        : [...watchedConceptIds, id]
    );
  }, [setValue, watchedConceptIds]);

  const handleDeleteOption = useCallback((index: number) => {
    setValue(
      'shootingProductOptions',
      [...watchedShootingProductOptions.filter((_, i) => i !== index)]
    );
  }, [watchedShootingProductOptions, setValue]);

  const handleToggleDay = useCallback((day: string) => {
    setValue(
      'availableDays',
      watchedAvailableDays.includes(day)
        ? watchedAvailableDays.filter((d) => d !== day)
        : [...watchedAvailableDays, day]
    );
  }, [setValue, watchedAvailableDays]);

  const submitButtonText = currentStep === TOTAL_STEPS - 1 ? '완료하기' : '다음';

  return (
    <PortfolioOnboardingView
      currentStep={currentStep}
      control={control}
      errors={errors}
      onPressBack={handlePressBack}
      onPressSubmit={handlePressSubmit}
      isSubmitDisabled={!isStepValid}
      submitButtonText={submitButtonText}
      progress={progress}
      profileImageURI={profileImageURI?.uri || ''}
      onProfileImageUpload={handleProfileImageUpload}
      photoURIs={photoURIs.length ? photoURIs.map((v) => v.uri) : []}
      onPhotoUpload={handlePhotoUpload}
      checkedPhotos={checkedImages}
      setCheckedPhotos={handleCheckedImages}
      onDeletePhotos={handleDeletePhotos}
      regions={regions ?? []}
      tags={dummyTags ?? []}
      concepts={concepts ?? []}
      onToggleRegion={handleToggleRegion}
      onToggleTag={handleToggleTag}
      onToggleConcept={handleToggleConcept}
      onDeleteOption={handleDeleteOption}
      onToggleDay={handleToggleDay}
    />
  );
}