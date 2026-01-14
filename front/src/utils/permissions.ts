import {Platform} from 'react-native';
import {
  PERMISSIONS,
  request,
  check,
  RESULTS,
  openSettings,
  Permission,
  requestNotifications,
  checkNotifications,
  NotificationOption,
} from 'react-native-permissions';
import {Alert} from '@/components/theme/Alert';
import {
  PermissionType,
  PERMISSION_MESSAGES,
} from '@/constants/permissions';

/**
 * 앱 이름 (설정 안내용)
 * iOS 설정 경로 안내에 사용됨
 */
const APP_NAME = 'Snaplink';

/**
 * 권한 상태
 */
export type PermissionStatus =
  | 'granted'
  | 'denied'
  | 'blocked'
  | 'unavailable'
  | 'limited';

/**
 * Android 버전별 사진 권한 가져오기
 * - Android 13+ (API 33+): READ_MEDIA_IMAGES
 * - Android 12 이하 (API 32-): READ_EXTERNAL_STORAGE
 */
const getAndroidPhotoPermission = (): Permission => {
  if (Platform.OS !== 'android') {
    return PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE; // fallback (실제로는 사용되지 않음)
  }

  const androidVersion = Platform.Version as number;
  console.log('[Permission] Android version:', androidVersion);

  // Android 13+ (API 33+)
  if (androidVersion >= 33) {
    return PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
  }

  // Android 12 이하 (API 32-)
  return PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
};

/**
 * 플랫폼별 권한 매핑
 *
 * 알림 권한은 requestNotifications()를 사용하므로 null로 설정
 */
const PERMISSION_MAP: Record<PermissionType, Permission | null> = {
  camera: Platform.select({
    ios: PERMISSIONS.IOS.CAMERA,
    android: PERMISSIONS.ANDROID.CAMERA,
  })!,
  photo: Platform.select({
    ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
    android: getAndroidPhotoPermission(),
  })!,
  notification: null, // 알림은 requestNotifications() 사용
};

/**
 * 알림 권한 옵션
 */
const NOTIFICATION_OPTIONS: NotificationOption[] = Platform.select({
  ios: ['alert', 'badge', 'sound'],
  android: ['alert', 'sound'],
})!;

/**
 * 권한 상태 확인
 *
 * 알림 권한은 checkNotifications()를 사용하고,
 * 일반 권한은 check()를 사용합니다.
 */
export async function checkPermission(
  type: PermissionType,
): Promise<PermissionStatus> {
  // 알림 권한은 별도 처리
  if (type === 'notification') {
    const {status} = await checkNotifications();
    switch (status) {
      case RESULTS.GRANTED:
        return 'granted';
      case RESULTS.DENIED:
        return 'denied';
      case RESULTS.BLOCKED:
        return 'blocked';
      default:
        return 'unavailable';
    }
  }

  // 일반 권한 처리
  const permission = PERMISSION_MAP[type];
  if (!permission) {
    return 'unavailable';
  }

  const result = await check(permission);

  switch (result) {
    case RESULTS.GRANTED:
    case RESULTS.LIMITED:
      return 'granted';
    case RESULTS.DENIED:
      return 'denied';
    case RESULTS.BLOCKED:
      return 'blocked';
    default:
      return 'unavailable';
  }
}

/**
 * 인앱 안내를 표시한 권한 타입 저장
 * (메모리에만 저장, 앱 재시작 시 초기화)
 */
const shownInAppGuides = new Set<PermissionType>();

/**
 * 권한 요청 (2단계: 인앱 안내 → 시스템 권한 요청)
 *
 * UX 규칙:
 * 1. 첫 요청: 인앱 안내 → 시스템 요청
 * 2. denied 상태: 시스템 요청만 (인앱 안내 생략)
 * 3. blocked 상태: 설정 안내만
 *
 * @param type - 권한 타입
 * @param onGranted - 권한 허용 시 콜백
 * @param onDenied - 권한 거부 시 콜백
 *
 * @example
 * ```tsx
 * requestPermission(
 *   'camera',
 *   () => console.log('카메라 권한 허용됨'),
 *   () => console.log('카메라 권한 거부됨')
 * );
 * ```
 */
export async function requestPermission(
  type: PermissionType,
  onGranted?: () => void,
  onDenied?: () => void,
): Promise<void> {
  // 현재 권한 상태 확인
  const currentStatus = await checkPermission(type);
  console.log(`[Permission] ${type} current status:`, currentStatus);

  // 이미 권한이 허용된 경우
  if (currentStatus === 'granted') {
    onGranted?.();
    return;
  }

  // 권한이 영구 거부된 경우 설정으로 안내
  if (currentStatus === 'blocked') {
    console.log(`[Permission] ${type} is blocked, showing settings alert`);
    showSettingsAlert(type, onDenied);
    return;
  }

  const messages = PERMISSION_MESSAGES[type];
  const hasShownGuide = shownInAppGuides.has(type);

  // denied 상태이고 이미 인앱 안내를 본 경우: 바로 시스템 요청
  if (currentStatus === 'denied' && hasShownGuide) {
    console.log(`[Permission] ${type} already showed guide, requesting directly...`);
    await requestSystemPermission(type, () => {
      onGranted?.();
    }, onDenied);
    return;
  }

  // 첫 요청: 인앱 안내 표시
  console.log(`[Permission] ${type} showing in-app guide...`);

  Alert.show({
    title: messages.inApp.title,
    message: messages.inApp.body,
    buttons: [
      {
        text: messages.inApp.confirmText,
        onPress: async () => {
          console.log(`[Permission] In-app alert confirmed, requesting ${type} permission...`);
          await requestSystemPermission(type, () => {
            // 권한이 허용된 경우에만 인앱 안내를 본 것으로 표시
            shownInAppGuides.add(type);
            onGranted?.();
          }, onDenied);
        },
      },
    ],
    cancelable: false,
  });
}

/**
 * 시스템 권한 요청 (알림/일반 권한 분기)
 */
async function requestSystemPermission(
  type: PermissionType,
  onGranted?: () => void,
  onDenied?: () => void,
): Promise<void> {
  let result: string;

  // 알림 권한은 requestNotifications() 사용
  if (type === 'notification') {
    const response = await requestNotifications(NOTIFICATION_OPTIONS);
    result = response.status;
    console.log(`[Permission] notification request result:`, {
      status: response.status,
      settings: response.settings,
    });
  } else {
    // 일반 권한은 request() 사용
    const permission = PERMISSION_MAP[type];
    if (!permission) {
      console.warn(`Permission ${type} is not available on this platform`);
      onDenied?.();
      return;
    }
    result = await request(permission);
    console.log(`[Permission] ${type} request result:`, result);
  }

  // 결과 처리
  if (result === RESULTS.GRANTED || result === RESULTS.LIMITED) {
    console.log(`[Permission] ${type} granted`);
    onGranted?.();
  } else if (result === RESULTS.BLOCKED) {
    // 거부 후 다시는 묻지 않음 선택 시
    console.log(`[Permission] ${type} blocked, showing settings alert`);
    showSettingsAlert(type, onDenied);
  } else if (result === RESULTS.DENIED) {
    // 일반 거부 시 - 나중에 다시 시도 가능
    console.log(`[Permission] ${type} denied`);
    onDenied?.();
  } else {
    console.log(`[Permission] ${type} unexpected result:`, result);
    onDenied?.();
  }
}

/**
 * 설정으로 이동 안내 Alert
 * - Android: 설정 앱으로 직접 이동
 * - iOS: 설정 안내 후 사용자가 수동으로 이동
 */
export function showSettingsAlert(
  type: PermissionType,
  onDenied?: () => void,
): void {
  const permissionName =
    type === 'camera' ? '카메라' : type === 'photo' ? '사진' : '알림';

  const isAndroid = Platform.OS === 'android';

  console.log(`[Permission] Showing settings alert for ${type} on ${Platform.OS}`);

  Alert.show({
    title: `${permissionName} 권한 필요`,
    message: isAndroid
      ? `이 기능을 사용하려면 ${permissionName} 권한이 필요합니다.\n\n설정에서 권한을 허용해주세요.`
      : `이 기능을 사용하려면 ${permissionName} 권한이 필요합니다.\n\n설정 > ${APP_NAME} > ${permissionName}에서 권한을 허용해주세요.`,
    buttons: isAndroid
      ? [
          {
            text: '취소',
            onPress: () => {
              console.log(`[Permission] Settings alert - Cancel pressed`);
              onDenied?.();
            },
            type: 'cancel',
          },
          {
            text: '설정 열기',
            onPress: () => {
              console.log(`[Permission] Settings alert - Open settings pressed`);
              openSettings().catch(() => {
                console.warn('설정 앱을 열 수 없습니다.');
              });
              onDenied?.();
            },
          },
        ]
      : [
          {
            text: '확인',
            onPress: () => {
              console.log(`[Permission] Settings alert - OK pressed`);
              onDenied?.();
            },
          },
        ],
  });
}

/**
 * 여러 권한 한번에 요청
 *
 * @example
 * ```tsx
 * requestMultiplePermissions(
 *   ['camera', 'photo'],
 *   () => console.log('모든 권한 허용'),
 *   (deniedPermissions) => console.log('거부된 권한:', deniedPermissions)
 * );
 * ```
 */
export async function requestMultiplePermissions(
  types: PermissionType[],
  onAllGranted?: () => void,
  onSomeDenied?: (deniedPermissions: PermissionType[]) => void,
): Promise<void> {
  const deniedPermissions: PermissionType[] = [];

  for (const type of types) {
    await new Promise<void>(resolve => {
      requestPermission(
        type,
        () => resolve(),
        () => {
          deniedPermissions.push(type);
          resolve();
        },
      );
    });
  }

  if (deniedPermissions.length === 0) {
    onAllGranted?.();
  } else {
    onSomeDenied?.(deniedPermissions);
  }
}
