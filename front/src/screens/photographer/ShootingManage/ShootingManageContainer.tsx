import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useQueries } from '@tanstack/react-query';
import { MainNavigationProp } from '@/types/navigation.ts';
import ShootingManageView from '@/screens/photographer/ShootingManage/ShootingManageView.tsx';
import { useMyShootingsQuery } from '@/queries/shootings.ts';
import { useWeeklyScheduleQuery } from '@/queries/schedules.ts';
import { useDeleteShootingMutation, useUpdateShootingMutation } from '@/mutations/shootings.ts';
import { shootingsQueryKeys } from '@/queries/keys.ts';
import { getShootingOptions } from '@/api/shootings.ts';
import { Alert } from '@/components/ui';
import { useAuthStore } from '@/store/authStore.ts';
import analytics from '@react-native-firebase/analytics';

export default function ShootingManageContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const userId = useAuthStore((state) => state.userId);

  // Fetch weekly schedule
  const { data: weeklyScheduleData } = useWeeklyScheduleQuery(userId || '', !!userId);

  // Fetch shooting list
  const { data: shootings = [] } = useMyShootingsQuery();

  // Fetch options for each shooting
  const optionsQueries = useQueries({
    queries: shootings.map((shooting) => ({
      queryKey: shootingsQueryKeys.options(shooting.id),
      queryFn: () => getShootingOptions(shooting.id),
      enabled: !!shooting.id,
    })),
  });

  // Combine shootings with their options
  const shootingsWithOptions = useMemo(() => {
    return shootings.map((shooting, index) => ({
      ...shooting,
      optionalOptions: optionsQueries[index]?.data || [],
    }));
  }, [shootings, optionsQueries]);

  const defaultShooting = useMemo(() => {
    const defaultShootings = shootings.filter((v) => v.isDefault);
    return defaultShootings.length > 0 ? defaultShootings[0] : null;
  }, [shootings])

  const deleteShootingMutation = useDeleteShootingMutation();
  const updateShootingMutation = useUpdateShootingMutation();

  const handlePressBack = () => navigation.goBack();

  const handlePressCreateProduct = () => {
    // Firebase Analytics 이벤트: 촬영 서비스 생성 버튼 클릭
    analytics().logEvent('shooting_service_action', {
      user_id: userId ?? '',
      user_type: 'photographer',
      action_type: 'create',
    });
    navigation.navigate('ServiceForm', {});
  };

  const handlePressEditProduct = (productId: number) => {
    // Firebase Analytics 이벤트: 촬영 서비스 수정 버튼 클릭
    analytics().logEvent('shooting_service_action', {
      user_id: userId ?? '',
      user_type: 'photographer',
      action_type: 'edit',
      product_id: productId,
    });
    navigation.navigate('ServiceForm', { productId });
  };

  const handlePressDeleteProduct = (productId: number) => {
    // Firebase Analytics 이벤트: 촬영 서비스 삭제 버튼 클릭
    analytics().logEvent('shooting_service_action', {
      user_id: userId ?? '',
      user_type: 'photographer',
      action_type: 'delete',
      product_id: productId,
    });
    Alert.show({
      title: '촬영 서비스를 삭제하시겠습니까?',
      message: '삭제된 서비스는 복구할 수 없습니다.',
      buttons: [
        {
          text: '취소',
          type: 'cancel',
          onPress: () => {},
        },
        {
          text: '삭제',
          type: 'destructive',
          onPress: () => {
            deleteShootingMutation.mutate(productId, {
              onSuccess: () => {
                Alert.show({
                  title: '삭제 완료',
                  message: '촬영 서비스가 삭제되었습니다.',
                  buttons: [{ text: '확인', onPress: () => {} }],
                });
              },
              onError: () => {
                Alert.show({
                  title: '삭제 실패',
                  message: '촬영 서비스 삭제에 실패했습니다.',
                  buttons: [{ text: '확인', onPress: () => {} }],
                });
              },
            });
          },
        },
      ],
    });
  };

  const handlePressEditSchedule = () => {
    // Firebase Analytics 이벤트: 스케줄 편집 버튼 클릭
    analytics().logEvent('shooting_service_action', {
      user_id: userId ?? '',
      user_type: 'photographer',
      action_type: 'edit_schedule',
    });
    navigation.navigate('ScheduleForm');
  };

  const handleChangeDefault = (productId: number) => {
    Alert.show({
      title: '기본 상품으로 변경',
      message: '변경하시면 해당 상품 정보가 프로필에 노출됩니다. 변경하시겠습니까?',
      buttons: [
        { text: '취소', onPress: () => {}, type: 'cancel' },
        { text: '변경', onPress: () => {
            const currentShooting = shootings.find((v) => v.id === productId);

            if (currentShooting === undefined) {
              Alert.show({
                title: '변경 실패',
                message: '없는 상품입니다.',
              });
              return;
            }

            updateShootingMutation.mutate({
              shootingId: productId,
              body: {
                isDefault: true,
                PhotographerId: userId,
                shootingName: currentShooting.shoootingName,
                basePrice: currentShooting.basePrice,
                description: currentShooting.description,
                photoTime: currentShooting.photoTime,
                personnel: currentShooting.personnel,
                providesRawFile: currentShooting.providesRawFile,
                editingType: currentShooting.editingType,
                editingDeadline: currentShooting.editingDeadline,
                selectionAuthority: currentShooting.selectionAuthority,
                providedEditCount: currentShooting.providedEditCount,
              }
            }, {
              onSuccess: () => {
                if (defaultShooting !== null) {
                  updateShootingMutation.mutate({
                    shootingId: defaultShooting.id,
                    body: {
                      isDefault: false,
                      PhotographerId: userId,
                      shootingName: defaultShooting.shoootingName,
                      basePrice: defaultShooting.basePrice,
                      description: defaultShooting.description,
                      photoTime: defaultShooting.photoTime,
                      personnel: defaultShooting.personnel,
                      providesRawFile: defaultShooting.providesRawFile,
                      editingType: defaultShooting.editingType,
                      editingDeadline: defaultShooting.editingDeadline,
                      selectionAuthority: defaultShooting.selectionAuthority,
                      providedEditCount: defaultShooting.providedEditCount,
                    }
                  }, {
                    onSuccess: () => {
                      Alert.show({
                        title: '변경 완료',
                        message: '기본 상품으로 변경되었습니다.',
                      });
                    },
                    onError: () => {
                      Alert.show({
                        title: '네트워크 에러',
                        message: '네트워크를 확인해보세요.',
                      });
                    }
                  })
                }
              },
              onError: () => {
                Alert.show({
                  title: '네트워크 에러',
                  message: '네트워크를 확인해보세요.',
                });
              }
            })
          } },
      ]
    })
  }

  return (
    <ShootingManageView
      onPressBack={handlePressBack}
      onPressCreateProduct={handlePressCreateProduct}
      onPressEditProduct={handlePressEditProduct}
      onPressDeleteProduct={handlePressDeleteProduct}
      onPressEditSchedule={handlePressEditSchedule}
      onChangeDefault={handleChangeDefault}
      shootings={shootingsWithOptions}
      hasDefault={defaultShooting !== null}
      weeklySchedule={weeklyScheduleData ?? []}
      navigation={navigation}
    />
  );
}