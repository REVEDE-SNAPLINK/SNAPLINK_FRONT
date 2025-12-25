import { useState, useCallback, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigation} from '@react-navigation/native';
import PortfolioOnboardingView, {
  PortfolioOnboardingFormData,
} from '@/screens/photographer/PortfolioOnboarding/PortfolioOnboardingView.tsx';
import { MainNavigationProp } from '@/types/navigation.ts';
import { useAuthStore } from '@/store/authStore.ts';
import { useConceptsQuery, useRegionsQuery } from '@/queries/meta.ts';
import { usePatchPhotographerProfileImageMutation, useSignPhotographerMutation } from '@/mutations/photographers.ts';
import { Alert, requestPermission } from '@/components/theme';
import {
  CameraOptions,
  ImageLibraryOptions,
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import { generateImageFilename } from '@/utils/format.ts';

const TOTAL_STEPS = 7;

export default function PortfolioOnboardingContainer() {
  const { userId } = useAuthStore();
  const { data: regions, isLoading: isLoadingRegions } = useRegionsQuery();
  const { data: concepts, isLoading: isLoadingConcepts } = useConceptsQuery();

  const navigation = useNavigation<MainNavigationProp>();

  const { mutate: uploadProfileMutate } = usePatchPhotographerProfileImageMutation();

  const [currentStep, setCurrentStep] = useState(0);
  const [profileImageURI, setProfileImageURI] = useState<string | undefined>(undefined);
  const [photoURIs, setPhotoURIs] = useState<string[]>([]);
  const [completeSelectedRegions, setCompleteSelectedRegions] = useState<boolean>(false);
  const [completeSelectedConcepts, setCompleteSelectedConcepts] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PortfolioOnboardingFormData>({
    defaultValues: {
      introduction: '',
      shootingRegions: [],
      shootingConcepts: [],
      basePrice: '',
      shootingDuration: null,
      shootingPeople: null,
      retouchingType: null,
      provideRawFiles: false,
      retouchingDuration: null,
      retouchingSelectionRight: null,
      availableDays: [],
      startTime: null,
      endTime: null,
    },
    mode: 'onChange',
  });

  const watchedIntroduction = watch('introduction');
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

  // Step6를 건너뛸지 여부 (보정 작업 제공이 '제공하지 않음'인 경우)
  const shouldSkipStep6 = watchedRetouchingType === '제공하지 않음';

  const validateStep = useCallback(
    async (step: number): Promise<boolean> => {
      switch (step) {
        case 0:
          // Step1: 프로필 사진과 한 줄 소개
          return profileImageURI !== undefined && watchedIntroduction.trim() !== '';
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
            watchedShootingPeople !== null &&
            watchedRetouchingType !== null
          );
        case 5:
          // Step6: 보정 정보 (Step5에서 '제공하지 않음' 선택 시 건너뜀)
          if (shouldSkipStep6) return true;
          return (
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
      watchedIntroduction,
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
      shouldSkipStep6,
    ]
  );

  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 0:
        return profileImageURI !== undefined && watchedIntroduction.trim() !== '';
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
          watchedShootingPeople !== null &&
          watchedRetouchingType !== null
        );
      case 5:
        if (shouldSkipStep6) return true;
        return (
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
    watchedIntroduction,
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
    shouldSkipStep6,
  ]);

  // 진행률 계산
  const progress = useMemo(() => {
    if (currentStep === 0) return 0;
    if (currentStep === 1) return 10;
    if (currentStep === 2) return 20;
    if (currentStep === 3) return 30;
    if (currentStep === 4) return 40;
    if (currentStep === 5) {
      return shouldSkipStep6 ? 80 : 60;
    }
    if (currentStep === 6) return 80;
    return 100;
  }, [currentStep, shouldSkipStep6]);

  const handlePressSubmit = async () => {
    if (!isStepValid) return;

    const isValid = await validateStep(currentStep);
    if (!isValid) return;

    if (currentStep < TOTAL_STEPS - 1) {
      // Step5에서 Step6로 넘어갈 때, '제공하지 않음' 선택 시 Step6 건너뛰기
      if (currentStep === 4 && shouldSkipStep6) {
        setCurrentStep(6);
      }

      if (currentStep === 2 && !isLoadingRegions) {
        setCompleteSelectedRegions(true);
        return;
      }
      if (currentStep === 3 && !isLoadingConcepts) {
        setCompleteSelectedConcepts(true);
        return;
      }
      setCurrentStep((prev) => prev + 1);

    } else {
      await handleSubmit(onSubmit)();
    }
  };

  useEffect(() => {
    if (isLoadingRegions && completeSelectedRegions && currentStep === 2) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [isLoadingRegions, completeSelectedRegions, currentStep]);

  useEffect(() => {
    if (isLoadingConcepts && completeSelectedConcepts && currentStep === 3) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [isLoadingConcepts, completeSelectedConcepts, currentStep]);

  const onSubmit = useCallback(
    async (data: PortfolioOnboardingFormData) => {
      const portfolioData = {
        ...data,
        profileImageURI,
        photoURIs,
        userId,
      };

      console.log('포트폴리오 등록 데이터:', portfolioData);

      // TODO: API 연결
      // try {
      //   const response = await createPortfolioAPI(portfolioData);
      //   if (response.success) {
      //     // 포트폴리오 등록 성공
      //     completePortfolioRegistration();
      //     navigation.replace('Home');
      //   }
      // } catch (error) {
      //   console.error('포트폴리오 등록 실패:', error);
      // }

      // TODO: 포토폴리오 등록 API 연결
      navigation.replace('Home');
    },
    [profileImageURI, photoURIs, userId, navigation]
  );

  const handleProfileImageUpload = useCallback(() => {
    // TODO: 이미지 업로드 로직
    // const result = await ImagePicker.launchImageLibrary();
    // if (result.assets && result.assets[0]) {
    //   setProfileImageURI(result.assets[0].uri);
    // }

    // 임시: 더미 이미지 URI
    setProfileImageURI('https://picsum.photos/200');
  }, []);

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
          uploadProfileMutate({
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
            onError: () => {
              Alert.show({
                title: '오류',
                message: '프로필 사진 업데이트에 실패했습니다.',
              });
            },
          });
          setProfileImageURI(response.assets[0].uri);
        } else {
          console.log('No image URI found in response');
        }
      }
    );
  }, [uploadProfileMutate]);

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
          uploadProfileMutate({
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
            onError: () => {
              Alert.show({
                title: '오류',
                message: '프로필 사진 업데이트에 실패했습니다.',
              });
            },
          });
          setProfileImageURI(response.assets[0].uri);
        }
      }
      // onDenied 콜백 제거 - requestPermission 내부에서 적절한 안내 처리
    );
  }, [uploadProfileMutate]);

  const handlePhotoUpload = useCallback(() => {
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
