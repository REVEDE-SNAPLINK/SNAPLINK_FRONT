import { useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import PortfolioOnboardingView, {
  PortfolioOnboardingFormData,
} from '@/screens/photographer/PortfolioOnboarding/PortfolioOnboardingView.tsx';
import { AuthStackParamList, MainNavigationProp } from '@/types/navigation.ts';
import { useAuth } from '@/context/AuthContext.tsx';

type PortfolioOnboardingRouteProp = RouteProp<AuthStackParamList, 'PortfolioOnboarding'>;

const TOTAL_STEPS = 7;

export default function PortfolioOnboardingContainer() {
  const route = useRoute<PortfolioOnboardingRouteProp>();
  const navigation = useNavigation<MainNavigationProp>();
  const { completePortfolioRegistration } = useAuth();
  const portfolioId = route.params?.id;

  const [currentStep, setCurrentStep] = useState(0);
  const [profileImageURI, setProfileImageURI] = useState<string | undefined>(undefined);
  const [photoURIs, setPhotoURIs] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PortfolioOnboardingFormData>({
    defaultValues: {
      introduction: '',
      shootingLocations: [],
      shootingCategories: [],
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
  const watchedShootingLocations = watch('shootingLocations');
  const watchedShootingCategories = watch('shootingCategories');
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
          return watchedShootingLocations.length >= 1;
        case 3:
          // Step4: 활동 컨셉 (최소 1개)
          return watchedShootingCategories.length >= 1;
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
      watchedShootingLocations,
      watchedShootingCategories,
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
        return watchedShootingLocations.length >= 1;
      case 3:
        return watchedShootingCategories.length >= 1;
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
    watchedShootingLocations,
    watchedShootingCategories,
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
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    } else {
      await handleSubmit(onSubmit)();
    }
  };

  const onSubmit = useCallback(
    async (data: PortfolioOnboardingFormData) => {
      const portfolioData = {
        ...data,
        profileImageURI,
        photoURIs,
        portfolioId,
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

      // 임시: 포트폴리오 등록 성공으로 가정하고 Home으로 이동
      completePortfolioRegistration();
      navigation.replace('Home');
    },
    [profileImageURI, photoURIs, portfolioId, completePortfolioRegistration, navigation]
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

  const handlePhotoUpload = useCallback(() => {
    // TODO: 이미지 업로드 로직
    // const result = await ImagePicker.launchImageLibrary({ selectionLimit: 10 });
    // if (result.assets) {
    //   setPhotoURIs(result.assets.map(asset => asset.uri));
    // }

    // 임시: 더미 이미지 URI 추가
    setPhotoURIs((prev) => [...prev, `https://picsum.photos/200?random=${Date.now()}`]);
  }, []);

  const handleToggleLocation = useCallback((location: string) => {
    setValue(
      'shootingLocations',
      watchedShootingLocations.includes(location)
        ? watchedShootingLocations.filter((l) => l !== location)
        : [...watchedShootingLocations, location]
    );
  }, [setValue, watchedShootingLocations]);

  const handleToggleCategory = useCallback((category: string) => {
    setValue(
      'shootingCategories',
      watchedShootingCategories.includes(category)
        ? watchedShootingCategories.filter((c) => c !== category)
        : [...watchedShootingCategories, category]
    );
  }, [setValue, watchedShootingCategories]);

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
      onToggleLocation={handleToggleLocation}
      onToggleCategory={handleToggleCategory}
      onToggleDay={handleToggleDay}
    />
  );
}
