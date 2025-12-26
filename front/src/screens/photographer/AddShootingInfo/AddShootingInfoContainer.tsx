import { useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import AddShootingInfoView, {
  ShootingInfoFormData,
} from '@/screens/photographer/AddShootingInfo/AddShootingInfoView.tsx';
import { MainNavigationProp } from '@/types/navigation.ts';
import { Alert } from '@/components/theme';

const TOTAL_STEPS = 3;

export default function AddShootingInfoContainer() {
  const navigation = useNavigation<MainNavigationProp>();

  const [currentStep, setCurrentStep] = useState(0);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ShootingInfoFormData>({
    defaultValues: {
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
          // Step1: 촬영 정보
          return (
            watchedBasePrice.trim() !== '' &&
            watchedShootingDuration !== null &&
            watchedShootingPeople !== null
          );
        case 1:
          // Step2: 보정 정보
          if (watchedRetouchingType === '제공하지 않음') {
            return true;
          }
          return (
            watchedRetouchingType !== null &&
            watchedRetouchingDuration !== null &&
            watchedRetouchingSelectionRight !== null
          );
        case 2:
          // Step3: 촬영 가능 일정
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
        return (
          watchedBasePrice.trim() !== '' &&
          watchedShootingDuration !== null &&
          watchedShootingPeople !== null
        );
      case 1:
        if (watchedRetouchingType === '제공하지 않음') {
          return true;
        }
        return (
          watchedRetouchingType !== null &&
          watchedRetouchingDuration !== null &&
          watchedRetouchingSelectionRight !== null
        );
      case 2:
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

  const handlePressSubmit = async () => {
    if (!isStepValid) return;

    const isValid = await validateStep(currentStep);
    if (!isValid) return;

    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      await handleSubmit(onSubmit)();
    }
  };

  const onSubmit = useCallback(
    async (data: ShootingInfoFormData) => {
      // TODO: API 호출하여 촬영 정보 저장
      console.log('Shooting info data:', data);

      Alert.show({
        title: '완료',
        message: '촬영 정보가 추가되었습니다.',
        buttons: [
          {
            text: '확인',
            onPress: () => {
              navigation.goBack();
            },
          },
        ],
      });
    },
    [navigation]
  );

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
    <AddShootingInfoView
      currentStep={currentStep}
      control={control}
      errors={errors}
      onPressSubmit={handlePressSubmit}
      isSubmitDisabled={!isStepValid}
      submitButtonText={submitButtonText}
      onToggleDay={handleToggleDay}
    />
  );
}
