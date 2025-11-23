/**
 * Alert 사용 예제
 *
 * 이 파일은 Alert 컴포넌트의 다양한 사용 방법을 보여줍니다.
 * 실제 프로젝트에서는 필요에 따라 복사하여 사용하세요.
 */

import React from 'react';
import {View, Button} from 'react-native';
import {Alert} from './Alert';
import {requestPermission, requestMultiplePermissions} from '@/utils/permissions';

export function AlertExamples() {
  // 1. 기본 Alert (확인 버튼만)
  const showBasicAlert = () => {
    Alert.show({
      title: '알림',
      message: '작업이 완료되었습니다.',
    });
  };

  // 2. 확인/취소 Alert
  const showConfirmAlert = () => {
    Alert.show({
      title: '삭제 확인',
      message: '정말로 삭제하시겠습니까?',
      buttons: [
        {
          text: '취소',
          onPress: () => console.log('취소됨'),
          type: 'cancel',
        },
        {
          text: '삭제',
          onPress: () => console.log('삭제됨'),
          type: 'destructive',
        },
      ],
    });
  };

  // 3. 여러 옵션 Alert
  const showMultipleOptions = () => {
    Alert.show({
      title: '작업 선택',
      message: '어떤 작업을 수행하시겠습니까?',
      buttons: [
        {text: '옵션 1', onPress: () => console.log('옵션 1 선택')},
        {text: '옵션 2', onPress: () => console.log('옵션 2 선택')},
        {text: '옵션 3', onPress: () => console.log('옵션 3 선택')},
      ],
    });
  };

  // 4. 바깥 터치 불가능한 Alert
  const showNonCancelableAlert = () => {
    Alert.show({
      title: '중요',
      message: '반드시 선택해야 합니다.',
      buttons: [{text: '확인', onPress: () => {}}],
      cancelable: false,
    });
  };

  // 5. 카메라 권한 요청
  const requestCameraPermission = () => {
    requestPermission(
      'camera',
      () => {
        console.log('카메라 권한 허용됨');
        Alert.show({
          title: '권한 허용됨',
          message: '이제 카메라를 사용할 수 있습니다.',
        });
      },
      () => {
        console.log('카메라 권한 거부됨');
      },
    );
  };

  // 6. 사진 권한 요청
  const requestPhotoPermission = () => {
    requestPermission(
      'photo',
      () => {
        console.log('사진 권한 허용됨');
        // 갤러리 열기 로직
      },
      () => {
        console.log('사진 권한 거부됨');
      },
    );
  };

  // 7. 알림 권한 요청
  const requestNotificationPermission = () => {
    requestPermission(
      'notification',
      () => {
        console.log('알림 권한 허용됨');
        Alert.show({
          title: '알림 설정 완료',
          message: '이제 중요한 알림을 받으실 수 있습니다.',
        });
      },
      () => {
        console.log('알림 권한 거부됨');
      },
    );
  };

  // 8. 여러 권한 한번에 요청
  const requestMultiplePermissionsExample = () => {
    requestMultiplePermissions(
      ['camera', 'photo'],
      () => {
        Alert.show({
          title: '권한 설정 완료',
          message: '모든 권한이 허용되었습니다.',
        });
      },
      deniedPermissions => {
        Alert.show({
          title: '일부 권한이 거부됨',
          message: `거부된 권한: ${deniedPermissions.join(', ')}`,
        });
      },
    );
  };

  // 9. 프로필 사진 변경 플로우
  const changeProfilePhoto = () => {
    Alert.show({
      title: '프로필 사진 변경',
      message: '사진을 선택하거나 촬영하세요',
      buttons: [
        {
          text: '취소',
          type: 'cancel',
          onPress: () => {},
        },
        {
          text: '사진 촬영',
          onPress: () => {
            requestPermission(
              'camera',
              () => {
                console.log('카메라 열기');
                // launchCamera 로직
              },
              () => {
                Alert.show({
                  title: '카메라 권한 필요',
                  message: '프로필 사진 촬영을 위해 카메라 권한이 필요합니다.',
                });
              },
            );
          },
        },
        {
          text: '갤러리에서 선택',
          onPress: () => {
            requestPermission(
              'photo',
              () => {
                console.log('갤러리 열기');
                // launchImageLibrary 로직
              },
            );
          },
        },
      ],
    });
  };

  // 10. 로그아웃 확인
  const handleLogout = () => {
    Alert.show({
      title: '로그아웃',
      message: '정말 로그아웃 하시겠습니까?',
      buttons: [
        {
          text: '취소',
          type: 'cancel',
          onPress: () => {},
        },
        {
          text: '로그아웃',
          type: 'destructive',
          onPress: async () => {
            // 로그아웃 로직
            console.log('로그아웃 완료');
          },
        },
      ],
    });
  };

  return (
    <View style={{padding: 20, gap: 10}}>
      <Button title="1. 기본 Alert" onPress={showBasicAlert} />
      <Button title="2. 확인/취소 Alert" onPress={showConfirmAlert} />
      <Button title="3. 여러 옵션 Alert" onPress={showMultipleOptions} />
      <Button title="4. 닫기 불가능한 Alert" onPress={showNonCancelableAlert} />
      <Button title="5. 카메라 권한 요청" onPress={requestCameraPermission} />
      <Button title="6. 사진 권한 요청" onPress={requestPhotoPermission} />
      <Button title="7. 알림 권한 요청" onPress={requestNotificationPermission} />
      <Button
        title="8. 여러 권한 한번에 요청"
        onPress={requestMultiplePermissionsExample}
      />
      <Button title="9. 프로필 사진 변경" onPress={changeProfilePhoto} />
      <Button title="10. 로그아웃 확인" onPress={handleLogout} />
    </View>
  );
}
