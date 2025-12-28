import { useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import ServiceFormView, {
  ServiceFormData,
} from '@/screens/photographer/ServiceForm/ServiceFormView.tsx';
import { MainNavigationProp } from '@/types/navigation.ts';
import { Alert } from '@/components/theme';

const TOTAL_STEPS = 4;

type ServiceFormRouteProp = RouteProp<{
  ServiceForm: {
    serviceId?: number; // If provided, it's edit mode
  };
}, 'ServiceForm'>;

export default function ServiceFormContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<ServiceFormRouteProp>();

  const serviceId = route.params?.serviceId;
  const isEditMode = serviceId !== undefined;

  const [currentStep, setCurrentStep] = useState(0);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ServiceFormData>({
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
      daySchedules: {},
      unavailableDateDescription: '',
      additionalOptions: [],
    },
    mode: 'onChange',
  });

  const watchedBasePrice = watch('basePrice');
  const watchedShootingDuration = watch('shootingDuration');
  const watchedShootingPeople = watch('shootingPeople');
  const watchedAdditionalOptions = watch('additionalOptions');
  const watchedRetouchingType = watch('retouchingType');
  const watchedRetouchingDuration = watch('retouchingDuration');
  const watchedRetouchingSelectionRight = watch('retouchingSelectionRight');
  const watchedAvailableDays = watch('availableDays');
  const watchedDaySchedules = watch('daySchedules');
  const watchedUnavailableDateDescription = watch('unavailableDateDescription');

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
        case 1: {
          // Step2: 추가 옵션
          // 추가 옵션 자체는 필수가 아님
          if (watchedAdditionalOptions.length === 0) return true;

          // 각 옵션에서 하나라도 값이 입력되면, time을 제외한 모든 필드가 필수
          return watchedAdditionalOptions.every(option => {
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
        case 2:
          // Step3: 보정 정보
          if (watchedRetouchingType === '제공하지 않음') {
            return true;
          }
          return (
            watchedRetouchingType !== null &&
            watchedRetouchingDuration !== null &&
            watchedRetouchingSelectionRight !== null
          );
        case 3: {
          // Step4: 촬영 가능 일정
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
    },
    [
      watchedBasePrice,
      watchedShootingDuration,
      watchedShootingPeople,
      watchedAdditionalOptions,
      watchedRetouchingType,
      watchedRetouchingDuration,
      watchedRetouchingSelectionRight,
      watchedAvailableDays,
      watchedDaySchedules,
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
      case 1: {
        // 추가 옵션 자체는 필수가 아님
        if (watchedAdditionalOptions.length === 0) return true;

        // 각 옵션에서 하나라도 값이 입력되면, time을 제외한 모든 필드가 필수
        return watchedAdditionalOptions.every(option => {
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
      case 2:
        if (watchedRetouchingType === '제공하지 않음') {
          return true;
        }
        return (
          watchedRetouchingType !== null &&
          watchedRetouchingDuration !== null &&
          watchedRetouchingSelectionRight !== null
        );
      case 3: {
        if (watchedAvailableDays.length < 1) return false;

        const selectedWeekdays = watchedAvailableDays.filter(day => day !== '공휴일');
        if (selectedWeekdays.length === 0 && watchedAvailableDays.includes('공휴일')) {
          return true;
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
    watchedBasePrice,
    watchedShootingDuration,
    watchedShootingPeople,
    watchedAdditionalOptions,
    watchedRetouchingType,
    watchedRetouchingDuration,
    watchedRetouchingSelectionRight,
    watchedAvailableDays,
    watchedDaySchedules,
  ]);

  const handlePressBack = () => {
    if (currentStep === 0) {
      navigation.goBack();
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

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
    async (data: ServiceFormData) => {
      // TODO: API 연동
      // isEditMode ? updateService(serviceId, data) : createService(data)

      console.log('Form data:', data);
      console.log('Is edit mode:', isEditMode);
      console.log('Service ID:', serviceId);

      Alert.show({
        title: '완료',
        message: isEditMode ? '촬영 서비스가 수정되었습니다.' : '촬영 서비스가 등록되었습니다.',
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
    [isEditMode, serviceId, navigation]
  );

  const handleDeleteOption = useCallback((index: number) => {
    setValue(
      'additionalOptions',
      [...watchedAdditionalOptions.filter((_, i) => i !== index)]
    );
  }, [watchedAdditionalOptions, setValue]);

  const handleToggleDay = useCallback((day: string) => {
    setValue(
      'availableDays',
      watchedAvailableDays.includes(day)
        ? watchedAvailableDays.filter((d) => d !== day)
        : [...watchedAvailableDays, day]
    );
  }, [setValue, watchedAvailableDays]);

  const submitButtonText = currentStep === TOTAL_STEPS - 1
    ? (isEditMode ? '수정 완료' : '등록 완료')
    : '다음';

  return (
    <ServiceFormView
      currentStep={currentStep}
      control={control}
      errors={errors}
      onPressBack={handlePressBack}
      onPressSubmit={handlePressSubmit}
      isSubmitDisabled={!isStepValid}
      submitButtonText={submitButtonText}
      onDeleteOption={handleDeleteOption}
      onToggleDay={handleToggleDay}
      isEditMode={isEditMode}
    />
  );
}
