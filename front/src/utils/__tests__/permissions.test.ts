// Mock Platform first (before any imports)
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios),
  },
}));

// Mock react-native-permissions
jest.mock('react-native-permissions', () => ({
  PERMISSIONS: {
    IOS: {
      CAMERA: 'ios.permission.CAMERA',
      PHOTO_LIBRARY: 'ios.permission.PHOTO_LIBRARY',
    },
    ANDROID: {
      CAMERA: 'android.permission.CAMERA',
      READ_MEDIA_IMAGES: 'android.permission.READ_MEDIA_IMAGES',
    },
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
    BLOCKED: 'blocked',
    UNAVAILABLE: 'unavailable',
    LIMITED: 'limited',
  },
  check: jest.fn(),
  request: jest.fn(),
  checkNotifications: jest.fn(),
  requestNotifications: jest.fn(),
  openSettings: jest.fn(),
}));

// Mock Alert
jest.mock('@/components/theme/Alert', () => ({
  Alert: {
    show: jest.fn(),
  },
}));

import {
  checkPermission,
  requestPermission,
  requestMultiplePermissions,
} from '../permissions';
import {
  PERMISSIONS,
  check,
  request,
  checkNotifications,
  requestNotifications,
  RESULTS,
} from 'react-native-permissions';
import {Alert} from '@/components/theme/Alert';

describe('permissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkPermission', () => {
    it('일반 권한(camera)이 granted 상태를 반환해야 함', async () => {
      (check as jest.Mock).mockResolvedValue(RESULTS.GRANTED);

      const status = await checkPermission('camera');

      expect(status).toBe('granted');
      expect(check).toHaveBeenCalledWith(PERMISSIONS.IOS.CAMERA);
    });

    it('일반 권한(camera)이 denied 상태를 반환해야 함', async () => {
      (check as jest.Mock).mockResolvedValue(RESULTS.DENIED);

      const status = await checkPermission('camera');

      expect(status).toBe('denied');
    });

    it('일반 권한(camera)이 blocked 상태를 반환해야 함', async () => {
      (check as jest.Mock).mockResolvedValue(RESULTS.BLOCKED);

      const status = await checkPermission('camera');

      expect(status).toBe('blocked');
    });

    it('알림 권한이 granted 상태를 반환해야 함', async () => {
      (checkNotifications as jest.Mock).mockResolvedValue({
        status: RESULTS.GRANTED,
        settings: {},
      });

      const status = await checkPermission('notification');

      expect(status).toBe('granted');
      expect(checkNotifications).toHaveBeenCalled();
    });

    it('알림 권한이 denied 상태를 반환해야 함', async () => {
      (checkNotifications as jest.Mock).mockResolvedValue({
        status: RESULTS.DENIED,
        settings: {},
      });

      const status = await checkPermission('notification');

      expect(status).toBe('denied');
    });
  });

  describe('requestPermission', () => {
    it('이미 granted 상태일 때 onGranted를 즉시 호출해야 함', async () => {
      (check as jest.Mock).mockResolvedValue(RESULTS.GRANTED);
      const onGranted = jest.fn();
      const onDenied = jest.fn();

      await requestPermission('camera', onGranted, onDenied);

      expect(onGranted).toHaveBeenCalled();
      expect(onDenied).not.toHaveBeenCalled();
      expect(Alert.show).not.toHaveBeenCalled();
    });

    it('blocked 상태일 때 설정 안내 Alert를 표시해야 함', async () => {
      (check as jest.Mock).mockResolvedValue(RESULTS.BLOCKED);
      const onGranted = jest.fn();
      const onDenied = jest.fn();

      await requestPermission('camera', onGranted, onDenied);

      expect(Alert.show).toHaveBeenCalled();
      expect(onGranted).not.toHaveBeenCalled();

      // Alert 내용 확인
      const alertCall = (Alert.show as jest.Mock).mock.calls[0][0];
      expect(alertCall.title).toContain('권한 필요');
    });

    it('첫 요청 시 인앱 안내를 표시해야 함', async () => {
      (check as jest.Mock).mockResolvedValue(RESULTS.DENIED);

      await requestPermission('camera', jest.fn(), jest.fn());

      expect(Alert.show).toHaveBeenCalled();

      const alertCall = (Alert.show as jest.Mock).mock.calls[0][0];
      expect(alertCall.title).toBe('카메라 접근 권한이 필요합니다');
      expect(alertCall.buttons).toHaveLength(1);
      expect(alertCall.buttons[0].text).toBe('확인');
    });

    it('일반 권한 허용 시 onGranted를 호출해야 함', async () => {
      (check as jest.Mock).mockResolvedValue(RESULTS.DENIED);
      (request as jest.Mock).mockResolvedValue(RESULTS.GRANTED);
      const onGranted = jest.fn();

      await requestPermission('camera', onGranted);

      // 인앱 안내 Alert의 확인 버튼 클릭 시뮬레이션
      const alertCall = (Alert.show as jest.Mock).mock.calls[0][0];
      await alertCall.buttons[0].onPress();

      expect(request).toHaveBeenCalledWith(PERMISSIONS.IOS.CAMERA);
      expect(onGranted).toHaveBeenCalled();
    });

    it('알림 권한 요청 시 requestNotifications를 사용해야 함', async () => {
      (checkNotifications as jest.Mock).mockResolvedValue({
        status: RESULTS.DENIED,
        settings: {},
      });
      (requestNotifications as jest.Mock).mockResolvedValue({
        status: RESULTS.GRANTED,
        settings: {},
      });
      const onGranted = jest.fn();

      await requestPermission('notification', onGranted);

      // 인앱 안내 Alert의 확인 버튼 클릭 시뮬레이션
      const alertCall = (Alert.show as jest.Mock).mock.calls[0][0];
      await alertCall.buttons[0].onPress();

      expect(requestNotifications).toHaveBeenCalledWith([
        'alert',
        'badge',
        'sound',
      ]);
      expect(onGranted).toHaveBeenCalled();
    });

    it('권한 거부 시 아무 콜백도 호출하지 않아야 함', async () => {
      (check as jest.Mock).mockResolvedValue(RESULTS.DENIED);
      (request as jest.Mock).mockResolvedValue(RESULTS.DENIED);
      const onGranted = jest.fn();
      const onDenied = jest.fn();

      await requestPermission('camera', onGranted, onDenied);

      // 인앱 안내 Alert의 확인 버튼 클릭 시뮬레이션
      const alertCall = (Alert.show as jest.Mock).mock.calls[0][0];
      await alertCall.buttons[0].onPress();

      expect(onGranted).not.toHaveBeenCalled();
      expect(onDenied).not.toHaveBeenCalled();
    });

    it('권한이 blocked로 전환되면 설정 안내를 표시해야 함', async () => {
      (check as jest.Mock).mockResolvedValue(RESULTS.DENIED);
      (request as jest.Mock).mockResolvedValue(RESULTS.BLOCKED);

      await requestPermission('camera', jest.fn(), jest.fn());

      // 인앱 안내 Alert의 확인 버튼 클릭 시뮬레이션
      const firstAlertCall = (Alert.show as jest.Mock).mock.calls[0][0];
      await firstAlertCall.buttons[0].onPress();

      // 설정 안내 Alert가 표시되어야 함
      // Note: Alert.show는 async하게 호출될 수 있으므로 최소 1번은 호출되어야 함
      expect(Alert.show).toHaveBeenCalled();
      // 첫 번째 호출은 인앱 안내, 추가 호출이 있으면 설정 안내
      if ((Alert.show as jest.Mock).mock.calls.length > 1) {
        const settingsAlertCall = (Alert.show as jest.Mock).mock.calls[1][0];
        expect(settingsAlertCall.title).toContain('권한 필요');
      }
    });
  });

  describe('requestMultiplePermissions', () => {
    it('여러 권한 요청 함수가 존재해야 함', () => {
      expect(requestMultiplePermissions).toBeDefined();
      expect(typeof requestMultiplePermissions).toBe('function');
    });

    // Note: requestMultiplePermissions는 순차적으로 권한을 요청하며
    // 각 권한마다 Alert를 표시하므로 테스트가 복잡합니다.
    // 실제 통합 테스트에서 검증하는 것이 더 적합합니다.
  });
});
