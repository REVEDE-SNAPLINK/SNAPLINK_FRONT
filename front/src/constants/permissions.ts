/**
 * 권한 요청 메시지 상수
 *
 * 인앱 안내 메시지 정의:
 * - 사용자에게 권한이 필요한 이유를 설명
 * - 확인 버튼 클릭 시 react-native-permissions의 시스템 권한 요청 다이얼로그가 표시됨
 */

export type PermissionType = 'camera' | 'photo' | 'notification';

export interface PermissionMessage {
  inApp: {
    title: string;
    body: string;
    confirmText: string;
  };
}

export const PERMISSION_MESSAGES: Record<PermissionType, PermissionMessage> = {
  camera: {
    inApp: {
      title: '카메라 접근 권한이 필요합니다',
      body: 'Snaplink는 프로필 사진 촬영을 위해 기기의 카메라에 접근합니다.\n\n촬영된 이미지는 사용자가 선택한 기능에만 사용되며, 외부로 전송되거나 공유되지 않습니다.',
      confirmText: '확인',
    },
  },
  photo: {
    inApp: {
      title: '사진 접근 권한이 필요합니다',
      body: 'Snaplink는 프로필 등록, 촬영 후기 작성 등 서비스 이용 과정에서 사용자가 선택한 사진을 업로드하기 위해 기기 사진(갤러리)에 접근합니다.\n\n이 권한은 사진 선택 기능에만 사용되며, 업로드된 이미지는 명시된 목적 외에는 저장되거나 외부로 공유되지 않습니다.',
      confirmText: '확인',
    },
  },
  notification: {
    inApp: {
      title: '알림 수신 권한이 필요합니다',
      body: 'Snaplink는 촬영 요청, 예약 상태, 매칭 완료 등 주요 안내를 위해 푸시 알림을 전송합니다.\n\n알림을 허용하시면 더 빠르고 편리하게 서비스를 이용하실 수 있습니다.',
      confirmText: '확인',
    },
  },
};
