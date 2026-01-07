import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import EditRegionView, {
  EditRegionFormData,
} from '@/screens/photographer/EditRegion/EditRegionView.tsx';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';
import { useRegionsQuery } from '@/queries/meta.ts';
import { Alert } from '@/components/theme';

type EditRegionRouteProp = RouteProp<MainStackParamList, 'EditRegion'>;

export default function EditRegionContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<EditRegionRouteProp>();
  const { regionIds, onSubmit } = route.params;

  const { data: regions } = useRegionsQuery();

  const {
    control,
    watch,
    setValue,
  } = useForm<EditRegionFormData>({
    defaultValues: {
      regionIds: regionIds || [],
    },
    mode: 'onChange',
  });

  const watchedRegionIds = watch('regionIds');

  const isSubmitDisabled = useMemo(() => {
    return (watchedRegionIds?.length ?? 0) < 1;
  }, [watchedRegionIds]);

  const handlePressBack = () => {
    navigation.goBack();
  };

  const handlePressSubmit = () => {
    if (isSubmitDisabled) return;

    // onSubmit이 있으면 호출하고, 없으면 기본 동작 (뒤로 가기)
    if (onSubmit) {
      onSubmit(watchedRegionIds || []);
      navigation.goBack();
    } else {
      Alert.show({
        title: '촬영 지역 수정',
        message: '촬영 지역이 수정되었습니다.',
        buttons: [
          {
            text: '확인',
            onPress: () => {
              navigation.goBack();
            },
          },
        ],
      });
    }
  };

  const handleToggleRegion = useCallback((id: number) => {
    const currentRegionIds = watchedRegionIds ?? [];
    setValue(
      'regionIds',
      currentRegionIds.includes(id)
        ? currentRegionIds.filter((l) => l !== id)
        : [...currentRegionIds, id]
    );
  }, [setValue, watchedRegionIds]);

  return (
    <EditRegionView
      control={control}
      regions={regions ?? []}
      onToggleRegion={handleToggleRegion}
      onPressBack={handlePressBack}
      onPressSubmit={handlePressSubmit}
      isSubmitDisabled={isSubmitDisabled}
      navigation={navigation}
    />
  );
}
