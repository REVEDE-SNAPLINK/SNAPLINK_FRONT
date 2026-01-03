import { useNavigation } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import { MainNavigationProp } from '@/types/navigation.ts';
import NotificationSettingView from '@/screens/common/NotificationSetting/NotificationSettingView.tsx';
import { Alert } from '@/components/theme';
import { checkPermission, requestPermission } from '@/utils/permissions';

export default function NotificationSettingContainer() {
  const navigation = useNavigation<MainNavigationProp>();

  // 각 알림 설정 상태
  const [allNotifications, setAllNotifications] = useState(false);
  const [chatNotifications, setChatNotifications] = useState(false);
  const [serviceNotifications, setServiceNotifications] = useState(false);
  const [communityNotifications, setCommunityNotifications] = useState(false);
  const [advertisementNotifications, setAdvertisementNotifications] = useState(false);
  const [followNotifications, setFollowNotifications] = useState(false);

  // 시스템 알림 권한 상태 확인
  useEffect(() => {
    (async () => {
      const status = await checkPermission('notification');
      if (status === 'granted') {
        // 권한이 있으면 모든 알림을 켜진 상태로 초기화
        setAllNotifications(true);
        setChatNotifications(true);
        setServiceNotifications(true);
        setCommunityNotifications(true);
        setAdvertisementNotifications(true);
        setFollowNotifications(true);
      }
    })();
  }, []);

  // 개별 알림이 모두 꺼지면 전체 알림도 자동으로 꺼짐
  useEffect(() => {
    const allOn = chatNotifications && serviceNotifications && communityNotifications && advertisementNotifications && followNotifications;
    if (allOn) {
      setAllNotifications(true);
    } else {
      setAllNotifications(false);
    }
  }, [chatNotifications, serviceNotifications, communityNotifications, advertisementNotifications, followNotifications]);

  const handlePressBack = () => navigation.goBack();

  const handleToggleAllNotifications = async (value: boolean) => {
    if (value) {
      // 전체 알림 켜기 - 시스템 권한 확인
      const status = await checkPermission('notification');

      if (status === 'granted') {
        // 이미 권한이 있으면 모든 알림 켜기
        setAllNotifications(true);
        setChatNotifications(true);
        setServiceNotifications(true);
        setCommunityNotifications(true);
        setAdvertisementNotifications(true);
        setFollowNotifications(true);
      } else {
        // 권한 요청
        await requestPermission(
          'notification',
          () => {
            // 권한 허용 시 모든 알림 켜기
            setAllNotifications(true);
            setChatNotifications(true);
            setServiceNotifications(true);
            setCommunityNotifications(true);
            setAdvertisementNotifications(true);
            setFollowNotifications(true);
          },
          () => {
            // 권한 거부 시 아무것도 하지 않음
            setAllNotifications(false);
          }
        );
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
              setAllNotifications(false);
              setChatNotifications(false);
              setServiceNotifications(false);
              setCommunityNotifications(false);
              setAdvertisementNotifications(false);
              setFollowNotifications(false);
            },
          },
        ],
      });
    }
  };

  const handleToggleChatNotifications = (value: boolean) => {
    setChatNotifications(value);
  };

  const handleToggleServiceNotifications = (value: boolean) => {
    setServiceNotifications(value);
  };

  const handleToggleCommunityNotifications = (value: boolean) => {
    setCommunityNotifications(value);
  };

  const handleToggleAdvertisementNotifications = (value: boolean) => {
    setAdvertisementNotifications(value);
  };

  const handleToggleFollowNotifications = (value: boolean) => {
    setFollowNotifications(value);
  };

  return (
    <NotificationSettingView
      onPressBack={handlePressBack}
      allNotifications={allNotifications}
      chatNotifications={chatNotifications}
      serviceNotifications={serviceNotifications}
      communityNotifications={communityNotifications}
      advertisementNotifications={advertisementNotifications}
      followNotifications={followNotifications}
      onToggleAllNotifications={handleToggleAllNotifications}
      onToggleChatNotifications={handleToggleChatNotifications}
      onToggleServiceNotifications={handleToggleServiceNotifications}
      onToggleCommunityNotifications={handleToggleCommunityNotifications}
      onToggleAdvertisementNotifications={handleToggleAdvertisementNotifications}
      onToggleFollowNotifications={handleToggleFollowNotifications}
    />
  );
}