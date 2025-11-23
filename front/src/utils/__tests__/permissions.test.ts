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

import {checkPermission} from '../permissions';
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
});
