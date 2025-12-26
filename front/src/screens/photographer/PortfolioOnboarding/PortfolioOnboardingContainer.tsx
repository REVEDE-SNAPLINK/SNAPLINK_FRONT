import { useState, useCallback, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigation} from '@react-navigation/native';
import PortfolioOnboardingView, {
  PortfolioOnboardingFormData,
} from '@/screens/photographer/PortfolioOnboarding/PortfolioOnboardingView.tsx';
import { MainNavigationProp } from '@/types/navigation.ts';
import { useAuthStore } from '@/store/authStore.ts';
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
import { generateImageFilename } from '@/utils/format.ts';
import { UploadImageParams } from '@/types/image.ts';
import { DayOfWeek, PhotographerScheduleItem } from '@/api/photographers.ts';

const TOTAL_STEPS = 7;

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
  startTime: Date | null,
  endTime: Date | null,
): PhotographerScheduleItem[] => {
  if (!startTime || !endTime) return [];

  return availableDays
    .filter((day): day is DayKo => day in DAY_KO_TO_ENUM)
    .map((day) => ({
      dayOfWeek: DAY_KO_TO_ENUM[day],
      startTime: formatToHHmm(startTime),
      endTime: formatToHHmm(endTime),
    }));
};

export default function PortfolioOnboardingContainer() {
  const { userId } = useAuthStore();
  const { data: regions, isLoading: isLoadingRegions } = useRegionsQuery();
  const { data: concepts, isLoading: isLoadingConcepts } = useConceptsQuery();

  const navigation = useNavigation<MainNavigationProp>();

  const { mutate: uploadProfile } = usePatchPhotographerProfileImageMutation();
  const { mutate: uploadPortfolio } = useCreatePortfolioMutation();
  const { mutate: signPhotographer } = useSignPhotographerMutation();

  const [currentStep, setCurrentStep] = useState(0);
  const [profileImageURI, setProfileImageURI] = useState<string | undefined>(undefined);
  const [photoURIs, setPhotoURIs] = useState<string[]>([]);
  const [pendingNextStep, setPendingNextStep] = useState<null | 2 | 3>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PortfolioOnboardingFormData>({
    defaultValues: {
      description: '',
      shootingRegions: [],
      shootingConcepts: [],
      basePrice: '',
      shootingDuration: null,
      shootingPeople: null,
      shootingDescription: '',
      retouchingType: null,
      provideRawFiles: false,
      retouchingDuration: null,
      retouchingSelectionRight: null,
      availableDays: [],
      startTime: null,
      endTime: null,
      additionalOptions: [],
    },
    mode: 'onChange',
  });

  const watchedDescription = watch('description');
  const watchedShootingRegions = watch('shootingRegions');
  const watchedShootingConcepts = watch('shootingConcepts');
  const watchedBasePrice = watch('basePrice');
  const watchedShootingDuration = watch('shootingDuration');
  const watchedShootingPeople = watch('shootingPeople');
  const watchedRetouchingType = watch('retouchingType');
  const watchedRetouchingDuration = watch('retouchingDuration');
  const watchedRetouchingSelectionRight = watch('retouchingSelectionRight');
  const watchedAvailableDays = watch('availableDays');
  const watchedStartTime = watch('startTime');
  const watchedEndTime = watch('endTime');

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
          return watchedShootingRegions.length >= 1;
        case 3:
          // Step4: 활동 컨셉 (최소 1개)
          return watchedShootingConcepts.length >= 1;
        case 4:
          // Step5: 촬영 정보
          return (
            watchedBasePrice.trim() !== '' &&
            watchedShootingDuration !== null &&
            watchedShootingPeople !== null
          );
        case 5:
          // Step6: 보정 정보
          if (watchedRetouchingType === '제공하지 않음') {
            return true;
          }
          return (
            watchedRetouchingType !== null &&
            watchedRetouchingDuration !== null &&
            watchedRetouchingSelectionRight !== null
          );
        case 6:
          // Step7: 촬영 가능 일정
          return (
            watchedAvailableDays.length >= 1 &&
            watchedStartTime !== null &&
            watchedEndTime !== null
          );
        default:
          return false;
      }
    },
    [
      profileImageURI,
      photoURIs,
      watchedDescription,
      watchedShootingRegions,
      watchedShootingConcepts,
      watchedBasePrice,
      watchedShootingDuration,
      watchedShootingPeople,
      watchedRetouchingType,
      watchedRetouchingDuration,
      watchedRetouchingSelectionRight,
      watchedAvailableDays,
      watchedStartTime,
      watchedEndTime,
    ]
  );

  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 0:
        return profileImageURI !== undefined && watchedDescription.trim() !== '';
      case 1:
        return photoURIs.length >= 1;
      case 2:
        return watchedShootingRegions.length >= 1;
      case 3:
        return watchedShootingConcepts.length >= 1;
      case 4:
        return (
          watchedBasePrice.trim() !== '' &&
          watchedShootingDuration !== null &&
          watchedShootingPeople !== null
        );
      case 5:
        if (watchedRetouchingType === '제공하지 않음') {
          return true;
        }
        return (
          watchedRetouchingType !== null &&
          watchedRetouchingDuration !== null &&
          watchedRetouchingSelectionRight !== null
        );
      case 6:
        return (
          watchedAvailableDays.length >= 1 &&
          watchedStartTime !== null &&
          watchedEndTime !== null
        );
      default:
        return false;
    }
  }, [
    currentStep,
    profileImageURI,
    photoURIs,
    watchedDescription,
    watchedShootingRegions,
    watchedShootingConcepts,
    watchedBasePrice,
    watchedShootingDuration,
    watchedShootingPeople,
    watchedRetouchingType,
    watchedRetouchingDuration,
    watchedRetouchingSelectionRight,
    watchedAvailableDays,
    watchedStartTime,
    watchedEndTime,
  ]);

  // 진행률 계산
  const progress = useMemo(() => {
    if (currentStep === 0) return 0;
    if (currentStep === 1) return 10;
    if (currentStep === 2) return 20;
    if (currentStep === 3) return 30;
    if (currentStep === 4) return 40;
    if (currentStep === 5) return 60;
    if (currentStep === 6) return 80;
    return 100;
  }, [currentStep]);

  const handlePressSubmit = async () => {
    if (!isStepValid) return;

    const isValid = await validateStep(currentStep);
    if (!isValid) return;

    if (currentStep < TOTAL_STEPS - 1) {
      if (currentStep === 2) {
        setPendingNextStep(2);
        return;
      }
      if (currentStep === 3) {
        setPendingNextStep(3);
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

  useEffect(() => {
    if (pendingNextStep === 3) {
      if (!isLoadingConcepts && concepts) {
        setPendingNextStep(null);
        setCurrentStep(4);
      }
    }
  }, [pendingNextStep, isLoadingConcepts, concepts]);

  const onSubmit = useCallback(
    async (data: PortfolioOnboardingFormData) => {
      const portfolioData = {
        ...data,
        profileImageURI,
        photoURIs,
        userId,
      };

      const enhancedTime = (() => {
        switch (portfolioData.retouchingDuration) {
          case '당일 보정':
            return '1일';
          case '2일 이내':
            return '2일';
          case '3일 이내':
            return '3일';
          case '4일 이내':
            return '4일';
          case '5일 이내':
            return '5일';
          case '7일 이내':
            return '7일';
          default:
            return '14일';
        }
      })();

      const params = {
        description: portfolioData.description,
        basePrice: parseInt(portfolioData.basePrice),
        baseTime: portfolioData.shootingDuration !== null ? parseInt(portfolioData.shootingDuration.slice(0)) : 1,
        basePeople: portfolioData.shootingPeople !== undefined && portfolioData.shootingPeople !== null ? parseInt(portfolioData.shootingPeople.slice(0)) : 1,
        regionId: portfolioData.shootingRegions,
        conceptId: portfolioData.shootingConcepts,
        schedules: buildSchedulesFromForm(portfolioData.availableDays, portfolioData.startTime, portfolioData.endTime),
        isPublicHolidays: portfolioData.availableDays.includes("공휴일"),
        isOriginal: portfolioData.provideRawFiles,
        isEnhanced: portfolioData.retouchingType !== null ? portfolioData.retouchingType : '제공하지 않음',
        enhancedTime,
        enhancedPermission: portfolioData.retouchingSelectionRight !== null ? portfolioData.retouchingSelectionRight : '작가와 고객 함께 선택',
      }

      signPhotographer(params, {
        onSuccess: () => {
          Alert.show({
            title: '완료',
            message: '등록이 완료되었습니다.',
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
          Alert.show({ title: '오류', message: '등록에 실패했습니다.' });
          console.error(e);
        },
      });
    },
    [profileImageURI, photoURIs, userId, navigation, signPhotographer]
  );

  const handleCamera = useCallback(async () => {
    requestPermission(
      'camera',
      async () => {
        // 권한 허용됨 - 카메라 열기
        const options: CameraOptions = {
          mediaType: 'photo',
          saveToPhotos: true,
          quality: 0.8,
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
          uploadProfile({
            image: {
              uri: response.assets[0].uri,
              name: generateImageFilename(response.assets[0].type, 'photographer_profile'),
              type: response.assets[0].type || 'image/jpeg',
            }
          }, {
            onSuccess: () => {
              Alert.show({
                title: '성공',
                message: '프로필 사진이 업데이트되었습니다.',
              });
            },
            onError: (e) => {
              Alert.show({
                title: '오류',
                message: '프로필 사진 업데이트에 실패했습니다.',
              });
              console.error(e);
            },
          });
          setProfileImageURI(response.assets[0].uri);
        } else {
          console.log('No image URI found in response');
        }
      }
    );
  }, [uploadProfile]);

  const handleGalleryForProfile = useCallback(async () => {
    requestPermission(
      'photo',
      async () => {
        // 권한 허용됨 - 갤러리 열기
        const options: ImageLibraryOptions = {
          mediaType: 'photo',
          selectionLimit: 1,
          quality: 0.8,
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
          uploadProfile({
            image: {
              uri: response.assets[0].uri,
              name: generateImageFilename(response.assets[0].type, 'photographer_profile'),
              type: response.assets[0].type || 'image/jpeg',
            }
          }, {
            onSuccess: () => {
              Alert.show({
                title: '성공',
                message: '프로필 사진이 업데이트되었습니다.',
              });
            },
            onError: (e) => {
              Alert.show({
                title: '오류',
                message: '프로필 사진 업데이트에 실패했습니다.',
              });
              console.error(e);
            },
          });
          setProfileImageURI(response.assets[0].uri);
        }
      }
    );
  }, [uploadProfile]);

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
          quality: 0.8,
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
          const images = response.assets
            .filter(
              (asset): asset is UploadImageParams =>
                !!asset.uri && !!asset.fileName && !!asset.type,
            )
            .map((asset) => ({
              uri: asset.uri!,
              name: generateImageFilename(asset.type, 'photographer_portfolio'),
              type: asset.type!,
            }));

          uploadPortfolio({
            request: { content: "" },
            images
          }, {
            onSuccess: () => {
              Alert.show({
                title: '성공',
                message: '포트폴리오 사진이 업로드되었습니다.',
              });
            },
            onError: (e) => {
              Alert.show({
                title: '오류',
                message: '포트폴리오 사진 업로드에 실패했습니다.',
              });
              console.error(e);
            },
          });
          setPhotoURIs(images.map(image => image.uri));
        }
      }
    );
  }, [uploadPortfolio]);

  const handleToggleRegion = useCallback((id: number) => {
    setValue(
      'shootingRegions',
      watchedShootingRegions.includes(id)
        ? watchedShootingRegions.filter((l) => l !== id)
        : [...watchedShootingRegions, id]
    );
  }, [setValue, watchedShootingRegions]);

  const handleToggleConcept = useCallback((id: number) => {
    setValue(
      'shootingConcepts',
      watchedShootingConcepts.includes(id)
        ? watchedShootingConcepts.filter((c) => c !== id)
        : [...watchedShootingConcepts, id]
    );
  }, [setValue, watchedShootingConcepts]);

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
      onPressSubmit={handlePressSubmit}
      isSubmitDisabled={!isStepValid}
      submitButtonText={submitButtonText}
      progress={progress}
      profileImageURI={profileImageURI}
      onProfileImageUpload={handleProfileImageUpload}
      photoURIs={photoURIs}
      onPhotoUpload={handlePhotoUpload}
      regions={regions ?? []}
      concepts={concepts ?? []}
      onToggleRegion={handleToggleRegion}
      onToggleConcept={handleToggleConcept}
      onToggleDay={handleToggleDay}
    />
  );
}
