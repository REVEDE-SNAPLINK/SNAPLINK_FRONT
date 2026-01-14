import { useNavigation } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import { MainNavigationProp } from '@/types/navigation.ts';
import NotificationSettingView from '@/screens/common/NotificationSetting/NotificationSettingView.tsx';
import { Alert } from '@/components/theme';
import { checkPermission, requestPermission } from '@/utils/permissions';
import {useNotificationSettingsQuery} from "@/queries/user.ts";
import {usePatchNotificationSettingMutation} from "@/mutations/user.ts";

export default function NotificationSettingContainer() {
  const navigation = useNavigation<MainNavigationProp>();

  const { data: notificationSetting, isSuccess } = useNotificationSettingsQuery();
  const notificationSettingMutation = usePatchNotificationSettingMutation();

  // 각 알림 설정 상태
  const [allNotifications, setAllNotifications] = useState(false);
  const [chatNotifications, setChatNotifications] = useState(false);
  const [serviceNotifications, setServiceNotifications] = useState(false);
  const [communityNotifications, setCommunityNotifications] = useState(false);
  const [advertisementNotifications, setAdvertisementNotifications] = useState(false);
  const [systemNotifications, setSystemNotifications] = useState(false);

  // 서버 데이터로 초기화 (권한 확인은 제거)
  useEffect(() => {
    if (notificationSetting !== undefined) {
      const allOn = notificationSetting.consentChat &&
        notificationSetting.consentSchedule &&
        notificationSetting.consentCommunity &&
        notificationSetting.consentMarketing &&
        notificationSetting.consentSystem;

      setAllNotifications(allOn);
      setChatNotifications(notificationSetting.consentChat);
      setServiceNotifications(notificationSetting.consentSchedule);
      setCommunityNotifications(notificationSetting.consentCommunity);
      setAdvertisementNotifications(notificationSetting.consentMarketing);
      setSystemNotifications(notificationSetting.consentSystem);
    }
  }, [notificationSetting]);

  // 개별 알림이 모두 꺼지면 전체 알림도 자동으로 꺼짐
  useEffect(() => {
    const allOn = chatNotifications && serviceNotifications && communityNotifications && advertisementNotifications && systemNotifications;
    if (allOn) {
      setAllNotifications(true);
    } else {
      setAllNotifications(false);
    }
  }, [chatNotifications, serviceNotifications, communityNotifications, advertisementNotifications, systemNotifications]);

  const handlePressBack = () => navigation.goBack();

  const handleToggleAllNotifications = async (value: boolean) => {
    if (value) {
      // 전체 알림 켜기 - 시스템 권한 확인
      const status = await checkPermission('notification');

      if (status !== 'granted') {
        // 권한 요청
        await requestPermission(
          'notification',
          () => {
            // 권한 허용 시 API 호출
            updateAllNotifications(true);
          },
          () => {
            // 권한 거부 시 아무것도 하지 않음
            setAllNotifications(false);
          }
        );
      } else {
        // 이미 권한이 있으면 바로 API 호출
        updateAllNotifications(true);
      }
    } else {
      // 전체 알림 끄기 - 확인 Alert 표시
      Alert.show({
        title: '알림을 끄시겠어요?',
        message: '유용한 정보나 이벤트 알림을 받지 못할 수 있어요.',
        buttons: [
          {
            text: '취소',
            type: 'cancel',
            onPress: () => {},
          },
          {
            text: '알림 끄기',
            onPress: () => {
              updateAllNotifications(false);
            },
          },
        ],
      });
    }
  };

  const updateAllNotifications = (value: boolean) => {
    // 이전 상태 저장
    const previousState = {
      all: allNotifications,
      chat: chatNotifications,
      service: serviceNotifications,
      community: communityNotifications,
      advertisement: advertisementNotifications,
      system: systemNotifications,
    };

    // 낙관적 업데이트: 상태 먼저 변경
    setAllNotifications(value);
    setChatNotifications(value);
    setServiceNotifications(value);
    setCommunityNotifications(value);
    setAdvertisementNotifications(value);
    setSystemNotifications(value);

    // API 호출
    notificationSettingMutation.mutate(
      {
        consentMarketing: value,
        consentCommunity: value,
        consentChat: value,
        consentSystem: value,
        consentSchedule: value,
      },
      {
        onError: () => {
          // 실패 시 이전 상태로 복원
          setAllNotifications(previousState.all);
          setChatNotifications(previousState.chat);
          setServiceNotifications(previousState.service);
          setCommunityNotifications(previousState.community);
          setAdvertisementNotifications(previousState.advertisement);
          setSystemNotifications(previousState.system);

          Alert.show({
            title: '알림 설정 실패',
            message: '알림 설정을 변경할 수 없습니다. 다시 시도해주세요.',
            buttons: [{ text: '확인', onPress: () => {} }],
          });
        },
      }
    );
  };

  const handleToggleChatNotifications = async (value: boolean) => {
    // 알림 켜기 시도 시 시스템 권한 확인
    if (value) {
      const status = await checkPermission('notification');
      if (status === 'blocked' || status === 'denied') {
        Alert.show({
          title: '알림 권한 필요',
          message: '알림을 받으려면 설정에서 알림 권한을 허용해주세요.\n\n설정 > Snaplink > 알림에서 변경할 수 있습니다.',
          buttons: [
            {
              text: '취소',
              type: 'cancel',
              onPress: () => {},
            },
            {
              text: '설정 열기',
              onPress: () => {
                requestPermission('notification', () => {}, () => {});
              },
            },
          ],
        });
        return;
      }
    }

    const previousValue = chatNotifications;
    setChatNotifications(value);

    notificationSettingMutation.mutate(
      {
        consentMarketing: notificationSetting?.consentMarketing ?? true,
        consentCommunity: notificationSetting?.consentCommunity ?? true,
        consentChat: value,
        consentSystem: notificationSetting?.consentSystem ?? true,
        consentSchedule: notificationSetting?.consentSchedule ?? true,
      },
      {
        onError: () => {
          setChatNotifications(previousValue);
          Alert.show({
            title: '알림 설정 실패',
            message: '알림 설정을 변경할 수 없습니다. 다시 시도해주세요.',
            buttons: [{ text: '확인', onPress: () => {} }],
          });
        },
      }
    );
  };

  const handleToggleServiceNotifications = async (value: boolean) => {
    // 알림 켜기 시도 시 시스템 권한 확인
    if (value) {
      const status = await checkPermission('notification');
      if (status === 'blocked' || status === 'denied') {
        Alert.show({
          title: '알림 권한 필요',
          message: '알림을 받으려면 설정에서 알림 권한을 허용해주세요.\n\n설정 > Snaplink > 알림에서 변경할 수 있습니다.',
          buttons: [
            {
              text: '취소',
              type: 'cancel',
              onPress: () => {},
            },
            {
              text: '설정 열기',
              onPress: () => {
                requestPermission('notification', () => {}, () => {});
              },
            },
          ],
        });
        return;
      }
    }

    const previousValue = serviceNotifications;
    setServiceNotifications(value);

    notificationSettingMutation.mutate(
      {
        consentMarketing: notificationSetting?.consentMarketing ?? true,
        consentCommunity: notificationSetting?.consentCommunity ?? true,
        consentChat: notificationSetting?.consentChat ?? true,
        consentSystem: notificationSetting?.consentSystem ?? true,
        consentSchedule: value,
      },
      {
        onError: () => {
          setServiceNotifications(previousValue);
          Alert.show({
            title: '알림 설정 실패',
            message: '알림 설정을 변경할 수 없습니다. 다시 시도해주세요.',
            buttons: [{ text: '확인', onPress: () => {} }],
          });
        },
      }
    );
  };

  const handleToggleCommunityNotifications = async (value: boolean) => {
    // 알림 켜기 시도 시 시스템 권한 확인
    if (value) {
      const status = await checkPermission('notification');
      if (status === 'blocked' || status === 'denied') {
        Alert.show({
          title: '알림 권한 필요',
          message: '알림을 받으려면 설정에서 알림 권한을 허용해주세요.\n\n설정 > Snaplink > 알림에서 변경할 수 있습니다.',
          buttons: [
            {
              text: '취소',
              type: 'cancel',
              onPress: () => {},
            },
            {
              text: '설정 열기',
              onPress: () => {
                requestPermission('notification', () => {}, () => {});
              },
            },
          ],
        });
        return;
      }
    }

    const previousValue = communityNotifications;
    setCommunityNotifications(value);

    notificationSettingMutation.mutate(
      {
        consentMarketing: notificationSetting?.consentMarketing ?? true,
        consentCommunity: value,
        consentChat: notificationSetting?.consentChat ?? true,
        consentSystem: notificationSetting?.consentSystem ?? true,
        consentSchedule: notificationSetting?.consentSchedule ?? true,
      },
      {
        onError: () => {
          setCommunityNotifications(previousValue);
          Alert.show({
            title: '알림 설정 실패',
            message: '알림 설정을 변경할 수 없습니다. 다시 시도해주세요.',
            buttons: [{ text: '확인', onPress: () => {} }],
          });
        },
      }
    );
  };

  const handleToggleAdvertisementNotifications = async (value: boolean) => {
    // 알림 켜기 시도 시 시스템 권한 확인
    if (value) {
      const status = await checkPermission('notification');
      if (status === 'blocked' || status === 'denied') {
        Alert.show({
          title: '알림 권한 필요',
          message: '알림을 받으려면 설정에서 알림 권한을 허용해주세요.\n\n설정 > Snaplink > 알림에서 변경할 수 있습니다.',
          buttons: [
            {
              text: '취소',
              type: 'cancel',
              onPress: () => {},
            },
            {
              text: '설정 열기',
              onPress: () => {
                requestPermission('notification', () => {}, () => {});
              },
            },
          ],
        });
        return;
      }
    }

    const previousValue = advertisementNotifications;
    setAdvertisementNotifications(value);

    notificationSettingMutation.mutate(
      {
        consentMarketing: value,
        consentCommunity: notificationSetting?.consentCommunity ?? true,
        consentChat: notificationSetting?.consentChat ?? true,
        consentSystem: notificationSetting?.consentSystem ?? true,
        consentSchedule: notificationSetting?.consentSchedule ?? true,
      },
      {
        onError: () => {
          setAdvertisementNotifications(previousValue);
          Alert.show({
            title: '알림 설정 실패',
            message: '알림 설정을 변경할 수 없습니다. 다시 시도해주세요.',
            buttons: [{ text: '확인', onPress: () => {} }],
          });
        },
      }
    );
  };

  const handleToggleSystemNotifications = async (value: boolean) => {
    // 알림 켜기 시도 시 시스템 권한 확인
    if (value) {
      const status = await checkPermission('notification');
      if (status === 'blocked' || status === 'denied') {
        Alert.show({
          title: '알림 권한 필요',
          message: '알림을 받으려면 설정에서 알림 권한을 허용해주세요.\n\n설정 > Snaplink > 알림에서 변경할 수 있습니다.',
          buttons: [
            {
              text: '취소',
              type: 'cancel',
              onPress: () => {},
            },
            {
              text: '설정 열기',
              onPress: () => {
                requestPermission('notification', () => {}, () => {});
              },
            },
          ],
        });
        return;
      }
    }

    const previousValue = systemNotifications;
    setSystemNotifications(value);

    notificationSettingMutation.mutate(
      {
        consentMarketing: notificationSetting?.consentMarketing ?? true,
        consentCommunity: notificationSetting?.consentCommunity ?? true,
        consentChat: notificationSetting?.consentChat ?? true,
        consentSystem: value,
        consentSchedule: notificationSetting?.consentSchedule ?? true,
      },
      {
        onError: () => {
          setSystemNotifications(previousValue);
          Alert.show({
            title: '알림 설정 실패',
            message: '알림 설정을 변경할 수 없습니다. 다시 시도해주세요.',
            buttons: [{ text: '확인', onPress: () => {} }],
          });
        },
      }
    );
  }

  return (
    <NotificationSettingView
      onPressBack={handlePressBack}
      allNotifications={allNotifications}
      chatNotifications={chatNotifications}
      serviceNotifications={serviceNotifications}
      communityNotifications={communityNotifications}
      advertisementNotifications={advertisementNotifications}
      systemNotifications={systemNotifications}
      onToggleAllNotifications={handleToggleAllNotifications}
      onToggleChatNotifications={handleToggleChatNotifications}
      onToggleServiceNotifications={handleToggleServiceNotifications}
      onToggleCommunityNotifications={handleToggleCommunityNotifications}
      onToggleAdvertisementNotifications={handleToggleAdvertisementNotifications}
      onToggleSystemNotifications={handleToggleSystemNotifications}
      navigation={navigation}
    />
  );
}