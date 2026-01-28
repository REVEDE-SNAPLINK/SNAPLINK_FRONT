import { useState, useCallback, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import ServiceFormView, {
  ServiceFormData,
} from '@/screens/photographer/ServiceForm/ServiceFormView.tsx';
import { MainNavigationProp } from '@/types/navigation.ts';
import { Alert } from '@/components/theme';
import { useAuthStore } from '@/store/authStore.ts';
import { useMyShootingsQuery, useShootingOptionsQuery } from '@/queries/shootings.ts';
import {
  useCreateShootingMutation,
  useUpdateShootingMutation,
  useCreateShootingOptionMutation,
  useUpdateShootingOptionMutation,
  useDeleteShootingOptionMutation,
} from '@/mutations/shootings.ts';
import type { EditingType, EditingDeadline, SelectionAuthority } from '@/api/shootings.ts';
import { showErrorAlert } from '@/utils/error';

const TOTAL_STEPS = 3;

type ServiceFormRouteProp = RouteProp<{
  ServiceForm: {
    productId?: number; // If provided, it's edit mode
  };
}, 'ServiceForm'>;

export default function ServiceFormContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<ServiceFormRouteProp>();
  const userId = useAuthStore((state) => state.userId);

  const productId = route.params?.productId;
  const isEditMode = productId !== undefined;

  const [currentStep, setCurrentStep] = useState(0);
  const [deletedOptionIds, setDeletedOptionIds] = useState<number[]>([]);

  // Fetch all shootings to find the one being edited
  const { data: shootings = [] } = useMyShootingsQuery(isEditMode);
  const currentShooting = useMemo(() => {
    if (!isEditMode || !productId) return null;
    return shootings.find(s => s.id === productId) || null;
  }, [shootings, productId, isEditMode]);

  // Fetch options for the shooting being edited
  const { data: shootingOptions = [] } = useShootingOptionsQuery(
    productId || 0,
    isEditMode && !!productId
  );

  const createShootingMutation = useCreateShootingMutation();
  const updateShootingMutation = useUpdateShootingMutation();
  const createOptionMutation = useCreateShootingOptionMutation();
  const updateOptionMutation = useUpdateShootingOptionMutation();
  const deleteOptionMutation = useDeleteShootingOptionMutation();

  const isAnyMutationPending =
    createShootingMutation.isPending ||
    updateShootingMutation.isPending ||
    createOptionMutation.isPending ||
    updateOptionMutation.isPending ||
    deleteOptionMutation.isPending;

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<ServiceFormData>({
    defaultValues: {
      shootingProductName: '',
      basePrice: '',
      shootingDuration: null,
      shootingPeople: null,
      shootingDescription: '',
      retouchingType: null,
      provideRawFiles: false,
      retouchingDuration: null,
      retouchingSelectionRight: null,
      shootingProductProvidedEditCount: '',
      additionalOptions: [],
    },
    mode: 'onChange',
  });

  // Load existing data in edit mode
  useEffect(() => {
    if (isEditMode && currentShooting && shootingOptions) {
      const retouchingTypeMap: Record<string, string> = {
        'FACIAL': '얼굴 보정',
        'COLOR': '색감 보정',
        'BOTH': '얼굴, 색감 보정',
        'NONE': '제공하지 않음',
      };

      const retouchingDurationMap: Record<string, string> = {
        'SAME_DAY': '당일',
        'WITHIN_2_DAYS': '2일 이내',
        'WITHIN_3_DAYS': '3일 이내',
        'WITHIN_4_DAYS': '4일 이내',
        'WITHIN_5_DAYS': '5일 이내',
        'WITHIN_7_DAYS': '7일 이내',
        'WITHUP_7_DAYS': '7일 이상',
      };

      const selectionAuthorityMap: Record<string, string> = {
        'PHOTOGRAPHER': '작가만 선택 가능',
        'CUSTOMER': '고객만 선택 가능',
        'BOTH': '작가, 고객 둘다 선택 가능',
      };

      // Convert photoTime from minutes to hours (e.g., 90 minutes -> "1.5" hours)
      const shootingDurationInHours = (currentShooting.photoTime / 60).toString();

      // Convert personnel to Korean string
      const shootingPeopleValue = currentShooting.personnel >= 6
        ? '6명 이상'
        : `${currentShooting.personnel}명`;

      reset({
        shootingProductName: currentShooting.shoootingName || '',
        basePrice: currentShooting.basePrice.toString(),
        shootingDuration: shootingDurationInHours,
        shootingPeople: shootingPeopleValue,
        shootingDescription: currentShooting.description || '',
        retouchingType: retouchingTypeMap[currentShooting.editingType] || null,
        provideRawFiles: currentShooting.providesRawFile,
        retouchingDuration: retouchingDurationMap[currentShooting.editingDeadline] || null,
        retouchingSelectionRight: selectionAuthorityMap[currentShooting.selectionAuthority] || null,
        shootingProductProvidedEditCount: currentShooting.providedEditCount.toString(),
        additionalOptions: shootingOptions.map(opt => ({
          id: opt.id, // Store ID for update tracking
          name: opt.name,
          description: opt.description,
          price: opt.price.toString(),
          time: opt.additionalTime > 0 ? opt.additionalTime.toString() : '',
          isTimeOption: opt.additionalTime > 0, // time 값이 있으면 isTimeOption을 true로 설정
        })),
      });
    }
  }, [isEditMode, currentShooting, shootingOptions, reset]);

  const watchedShootingProductName = watch('shootingProductName');
  const watchedBasePrice = watch('basePrice');
  const watchedShootingDuration = watch('shootingDuration');
  const watchedShootingPeople = watch('shootingPeople');
  const watchedAdditionalOptions = watch('additionalOptions');
  const watchedRetouchingType = watch('retouchingType');
  const watchedRetouchingDuration = watch('retouchingDuration');
  const watchedRetouchingSelectionRight = watch('retouchingSelectionRight');
  const watchedShootingProductProvidedEditCount = watch('shootingProductProvidedEditCount');

  const validateStep = useCallback(
    async (step: number): Promise<boolean> => {
      switch (step) {
        case 0:
          // Step1: 촬영 정보
          return (
            watchedShootingProductName.trim() !== '' &&
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
                                option.price.trim() !== '';

            if (!hasAnyValue) {
              // 모든 필드가 비어있으면 유효 (입력하지 않음)
              return true;
            }

            // 하나라도 입력했으면 time을 제외한 모든 필드가 필수
            return (
              option.name.trim() !== '' &&
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
            watchedRetouchingSelectionRight !== null &&
            watchedShootingProductProvidedEditCount.trim() !== ''
          );
        default:
          return false;
      }
    },
    [
      watchedShootingProductName,
      watchedBasePrice,
      watchedShootingDuration,
      watchedShootingPeople,
      watchedAdditionalOptions,
      watchedRetouchingType,
      watchedRetouchingDuration,
      watchedRetouchingSelectionRight,
      watchedShootingProductProvidedEditCount,
    ]
  );

  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 0:
        return (
          watchedShootingProductName.trim() !== '' &&
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
                              option.price.trim() !== '';

          if (!hasAnyValue) {
            // 모든 필드가 비어있으면 유효 (입력하지 않음)
            return true;
          }

          // 하나라도 입력했으면 time을 제외한 모든 필드가 필수
          return (
            option.name.trim() !== '' &&
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
          watchedRetouchingSelectionRight !== null &&
          watchedShootingProductProvidedEditCount.trim() !== ''
        );
      default:
        return false;
    }
  }, [
    currentStep,
    watchedShootingProductName,
    watchedBasePrice,
    watchedShootingDuration,
    watchedShootingPeople,
    watchedAdditionalOptions,
    watchedRetouchingType,
    watchedRetouchingDuration,
    watchedRetouchingSelectionRight,
    watchedShootingProductProvidedEditCount,
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
      try {
        // Map UI values to API enums
        const retouchingTypeReverseMap: Record<string, EditingType> = {
          '얼굴 보정': 'FACIAL',
          '색감 보정': 'COLOR',
          '얼굴, 색감 보정': 'BOTH',
          '제공하지 않음': 'NONE',
        };

        const retouchingDurationReverseMap: Record<string, EditingDeadline> = {
          '당일': 'SAME_DAY',
          '2일 이내': 'WITHIN_2_DAYS',
          '3일 이내': 'WITHIN_3_DAYS',
          '4일 이내': 'WITHIN_4_DAYS',
          '5일 이내': 'WITHIN_5_DAYS',
          '7일 이내': 'WITHIN_7_DAYS',
          '7일 이상': 'WITHUP_7_DAYS',
        };

        const selectionAuthorityReverseMap: Record<string, SelectionAuthority> = {
          '작가만 선택 가능': 'PHOTOGRAPHER',
          '고객만 선택 가능': 'CUSTOMER',
          '작가, 고객 둘다 선택 가능': 'BOTH',
        };

        // Convert shooting duration from hours (e.g., "1.5") to minutes
        const shootingDurationInMinutes = data.shootingDuration
          ? Math.round(parseFloat(data.shootingDuration) * 60)
          : 60;

        // Convert shooting people from Korean string to number
        let personnelCount = 1;
        if (data.shootingPeople) {
          if (data.shootingPeople === '6명 이상') {
            personnelCount = 6;
          } else {
            personnelCount = parseInt(data.shootingPeople, 10) || 1;
          }
        }

        // Transform form data to API request
        const shootingRequest = {
          isDefault: false,
          PhotographerId: userId,
          shootingName: data.shootingProductName.trim(),
          basePrice: parseInt(data.basePrice, 10),
          description: data.shootingDescription.trim(),
          photoTime: shootingDurationInMinutes,
          personnel: personnelCount,
          providesRawFile: data.provideRawFiles,
          editingType: retouchingTypeReverseMap[data.retouchingType || ''] || 'NONE',
          editingDeadline: retouchingDurationReverseMap[data.retouchingDuration || ''] || 'WITHUP_7_DAYS',
          selectionAuthority: selectionAuthorityReverseMap[data.retouchingSelectionRight || ''] || 'BOTH',
          providedEditCount: parseInt(data.shootingProductProvidedEditCount) || 0,
        };

        let shootingId: number;

        // Create or update shooting
        if (isEditMode && productId) {
          const updated = await updateShootingMutation.mutateAsync({
            shootingId: productId,
            body: shootingRequest,
          });
          shootingId = updated.id;
        } else {
          const created = await createShootingMutation.mutateAsync(shootingRequest);
          shootingId = created.id;
        }

        // Handle options
        const currentOptions = data.additionalOptions.filter(opt =>
          opt.name.trim() !== '' && opt.description.trim() !== '' && opt.price.trim() !== ''
        );

        if (isEditMode) {
          // Delete removed options
          for (const optionId of deletedOptionIds) {
            await deleteOptionMutation.mutateAsync(optionId);
          }

          // Update or create options based on ID
          for (const opt of currentOptions) {
            const optionRequest = {
              shootingProductId: shootingId,
              name: opt.name.trim(),
              description: opt.description.trim(),
              price: parseInt(opt.price, 10),
              additionalTime: opt.time ? parseInt(opt.time, 10) : 0,
            };

            if (opt.id) {
              // Update existing option (has ID)
              await updateOptionMutation.mutateAsync({
                optionId: opt.id,
                body: optionRequest,
              });
            } else {
              // Create new option (no ID)
              await createOptionMutation.mutateAsync({
                productId: shootingId,
                body: optionRequest,
              });
            }
          }
        } else {
          // Create all options
          for (const opt of currentOptions) {
            await createOptionMutation.mutateAsync({
              productId: shootingId,
              body: {
                shootingProductId: shootingId,
                name: opt.name.trim(),
                description: opt.description.trim(),
                price: parseInt(opt.price, 10),
                additionalTime: opt.time ? parseInt(opt.time, 10) : 0,
              },
            });
          }
        }

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
      } catch (error) {
        console.error('Submit error:', error);
        showErrorAlert({
          title: isEditMode ? '수정 실패' : '등록 실패',
          action: isEditMode ? '촬영 서비스 수정' : '촬영 서비스 등록',
          error,
        });
      }
    },
    [
      isEditMode,
      productId,
      userId,
      navigation,
      createShootingMutation,
      updateShootingMutation,
      createOptionMutation,
      updateOptionMutation,
      deleteOptionMutation,
      deletedOptionIds,
    ]
  );

  const handleDeleteOption = useCallback((index: number) => {
    const optionToDelete = watchedAdditionalOptions[index];

    // Track deleted option ID if it's an existing option (has ID)
    if (isEditMode && optionToDelete?.id) {
      setDeletedOptionIds(prev => [...prev, optionToDelete.id!]);
    }

    setValue(
      'additionalOptions',
      [...watchedAdditionalOptions.filter((_, i) => i !== index)]
    );
  }, [watchedAdditionalOptions, setValue, isEditMode]);

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
      isSubmitDisabled={!isStepValid || isAnyMutationPending}
      submitButtonText={submitButtonText}
      onDeleteOption={handleDeleteOption}
      isEditMode={isEditMode}
      navigation={navigation}
    />
  );
}
