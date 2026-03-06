import { create } from 'zustand';
import { signInApi, refreshApi, signUpApi, SignUpFormData, logoutApi, withdrawApi, RefreshTokenError, testSignInApi, testSignUpApi } from '@/api/auth';
import {
  saveRefreshToken,
  loadRefreshToken,
  clearRefreshToken,
  saveUserId,
  loadUserId,
  clearUserId,
  saveUserType,
  loadUserType,
  clearUserType,
  saveAppleLoginInfo,
  clearAppleLoginInfo,
} from '@/auth/tokenStore.ts';
import messaging from '@react-native-firebase/messaging';
import { deleteFCMToken, registerFCMdevice } from '@/api/fcm.ts';
import { login } from '@react-native-kakao/user';
import { jwtDecode } from 'jwt-decode';
import { Platform, Linking } from 'react-native';
import { queryClient } from '@/config/queryClient.ts';
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import { updateNotificationSettings } from '@/api/user.ts';
import { Alert } from '@/components/ui';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import NaverLogin from '@react-native-seoul/naver-login';

let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

type AuthStatus = 'idle' | 'loading' | 'authed' | 'anon' | 'needs_signup';
type UserType = 'user' | 'photographer';

type AuthState = {
  status: AuthStatus;
  userId: string;
  userType: UserType;
  accessToken: string | null;
  isExpertMode: boolean;
  isFirst: boolean;

  setUserType: (userType: UserType) => void;
  setIsFirst: (isFirst: boolean) => void;

  signUpCompletionModalType: boolean;
  setSignUpCompletionModalType: () => void;

  bootstrapped: boolean;

  // actions
  bootstrap: () => Promise<void>;
  signInWithKakao: () => Promise<'LOGIN_SUCCESS' | 'SIGNUP_REQUIRED'>;
  signInWithApple: () => Promise<'LOGIN_SUCCESS' | 'SIGNUP_REQUIRED'>;
  signInWithNaver: () => Promise<'LOGIN_SUCCESS' | 'SIGNUP_REQUIRED'>;
  signInWithProviderToken: (provider: 'KAKAO' | 'NAVER' | 'GOOGLE' | 'APPLE', token: string) => Promise<'LOGIN_SUCCESS' | 'SIGNUP_REQUIRED'>;
  signInWithTestAccount: (testId: string) => Promise<'LOGIN_SUCCESS' | 'SIGNUP_REQUIRED'>;
  signUpWithTestAccount: (formData: SignUpFormData) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (formData: SignUpFormData) => Promise<void>;
  withdraw: () => Promise<void>;
  toggleExpertMode: () => void;
  getAccessToken: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'idle',
  bootstrapped: false,
  userId: '',
  userType: 'user',  // 기본값은 'user' (로그인 후 실제 값으로 업데이트됨)
  accessToken: null,
  isExpertMode: false, // 기본 false, photographer 로그인 시 true로 설정됨
  isFirst: false,

  setUserType: (userType: UserType) => set({ userType }),
  setIsFirst: (isFirst: boolean) => set({ isFirst }),

  signUpCompletionModalType: false,
  setSignUpCompletionModalType: () => {
    set({ signUpCompletionModalType: true });
  },

  toggleExpertMode: () => {
    const currentMode = get().isExpertMode;
    set({ isExpertMode: !currentMode });
  },

  async bootstrap() {
    // 이미 토큰 갱신 중이라면 그 결과를 기다림 (getAccessToken의 로직 공유)
    if (isRefreshing && refreshPromise) {
      console.log('[AuthStore] Bootstrap waiting for ongoing refresh...');
      await refreshPromise;
      return;
    }

    try {
      console.log('[AuthStore] Bootstrap starting...');
      const refreshToken = await loadRefreshToken();

      if (!refreshToken) {
        console.log('[AuthStore] No refresh token found, setting anon status');
        set({ status: 'anon', accessToken: null, userId: '', bootstrapped: true });
        return;
      }

      // getAccessToken을 통해 안전하게 갱신 시도 (Lock 적용됨)
      const token = await get().getAccessToken();

      if (token) {
        const [savedUserId, savedUserType] = await Promise.all([
          loadUserId(),
          loadUserType(),
        ]);

        const resolvedUserType = savedUserType || 'user';
        set({
          accessToken: token,
          status: 'authed',
          userId: savedUserId || '',
          userType: resolvedUserType,
          isExpertMode: resolvedUserType === 'photographer', // photographer는 기본 전문가 모드
          bootstrapped: true,
        });
        console.log('[AuthStore] Bootstrap completed successfully');
      } else {
        throw new Error('Bootstrap failed to get access token');
      }
    } catch (e) {
      console.error('[AuthStore] Bootstrap failed:', e);

      const shouldClearToken = e instanceof RefreshTokenError && e.isTokenInvalid;

      if (shouldClearToken) {
        await clearRefreshToken();
        await clearUserId();
        await clearUserType();
        set({ status: 'anon', accessToken: null, userId: '', bootstrapped: true });
      } else {
        // 네트워크 에러 등 일시적 에러: 저장된 정보로 복구 시도
        const [savedUserId, savedUserType] = await Promise.all([
          loadUserId(),
          loadUserType(),
        ]);

        if (savedUserId) {
          const resolvedUserType = savedUserType || 'user';
          set({
            status: 'authed',
            accessToken: null,
            userId: savedUserId,
            userType: resolvedUserType,
            isExpertMode: resolvedUserType === 'photographer', // photographer는 기본 전문가 모드
            bootstrapped: true,
          });
          console.log('[AuthStore] Bootstrap recovered with saved user info (offline mode)');
        } else {
          set({ status: 'anon', accessToken: null, userId: '', bootstrapped: true });
        }
      }
    }
  },

  async signInWithKakao(): Promise<'LOGIN_SUCCESS' | 'SIGNUP_REQUIRED'> {
    set({ status: 'loading' });
    try {
      const response = await login();

      if (!response.accessToken) {
        throw new Error('Kakao Login failed: No accessToken');
      }

      console.log(response);

      return await get().signInWithProviderToken('KAKAO', response.accessToken);
    } catch (e) {
      set({ status: 'anon' });
      console.error('signInWithKakaoCode error:', e);
      throw e;
    }
  },

  async signInWithNaver(): Promise<'LOGIN_SUCCESS' | 'SIGNUP_REQUIRED'> {
    set({ status: 'loading' });
    try {
      const { successResponse, failureResponse } = await NaverLogin.login();

      if (failureResponse) {
        throw new Error(`Naver Login failed: ${failureResponse.message}`);
      }

      if (!successResponse?.accessToken) {
        throw new Error('Naver Login failed: No accessToken');
      }

      return await get().signInWithProviderToken('NAVER', successResponse.accessToken);
    } catch (e) {
      set({ status: 'anon' });
      console.error('signInWithNaver error:', e);
      throw e;
    }
  },

  async signInWithApple(): Promise<'LOGIN_SUCCESS' | 'SIGNUP_REQUIRED'> {
    set({ status: 'loading' });
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });

      const { identityToken, fullName, email } = appleAuthRequestResponse;

      if (!identityToken) {
        throw new Error('Apple Login failed: No identityToken');
      }

      // 애플은 최초 로그인 시에만 이름과 이메일을 반환하므로 저장해둠
      const name = fullName ? `${fullName.familyName || ''}${fullName.givenName || ''}`.trim() : null;
      if (name || email) {
        await saveAppleLoginInfo(name, email ?? null);
      }

      return await get().signInWithProviderToken('APPLE', identityToken);
    } catch (e: any) {
      if (e.code === 'ERR_CANCELED') {
        set({ status: 'anon' });
        throw e; // 사용자가 취소한 경우
      }
      set({ status: 'anon' });
      console.error('signInWithApple error:', e);
      throw e;
    }
  },

  async signInWithProviderToken(provider, token): Promise<'LOGIN_SUCCESS' | 'SIGNUP_REQUIRED'> {
    set({ status: 'loading' });
    try {
      const response = await signInApi(provider, token);

      if (response.status === 'LOGIN_SUCCESS') {
        const userType = response.role === 'USER' ? 'user' : 'photographer';

        await analytics().logEvent('login', {
          method: provider.toLowerCase(),
        });

        // ✅ Analytics 사용자 속성 설정
        analytics().setUserId(response.userId);
        analytics().setUserProperties({
          user_type: userType,
        });

        // ✅ Crashlytics 사용자 컨텍스트 설정
        crashlytics().setUserId(response.userId);
        crashlytics().setAttributes({
          userType: userType,
          loginMethod: provider.toLowerCase(),
        });

        crashlytics().log(`✅ User logged in: ${response.userId} (${userType})`);

        // Save tokens and user data to persistent storage
        await Promise.all([
          saveRefreshToken(response.tokens.refreshToken),
          saveUserId(response.userId),
          saveUserType(userType),
        ]);

        set({
          status: 'authed',
          accessToken: response.tokens.accessToken,
          userId: response.userId,
          userType,
          isExpertMode: userType === 'photographer', // photographer는 기본 전문가 모드
        });

        // FCM 등록은 백그라운드에서 처리 (UI blocking 방지)
        safeRegisterFcmDevice();
      } else {
        // Save userId even in needs_signup state
        await saveUserId(response.userId);

        set({
          status: 'needs_signup',
          userId: response.userId,
          accessToken: null,
        });
      }

      return response.status;
    } catch (e) {
      set({ status: 'anon', accessToken: null });
      console.error(e);
      throw e;
    }
  },

  // 테스트 계정 로그인
  async signInWithTestAccount(testId: string): Promise<'LOGIN_SUCCESS' | 'SIGNUP_REQUIRED'> {
    set({ status: 'loading' });
    try {
      const response = await testSignInApi(testId);

      if (response.status === 'LOGIN_SUCCESS') {
        const userType = response.role === 'USER' ? 'user' : 'photographer';

        await analytics().logEvent('login', {
          method: 'test_account',
        });

        analytics().setUserId(response.userId);
        analytics().setUserProperties({
          user_type: userType,
        });

        crashlytics().setUserId(response.userId);
        crashlytics().setAttributes({
          userType: userType,
          loginMethod: 'test_account',
        });

        crashlytics().log(`✅ Test user logged in: ${response.userId} (${userType})`);

        await Promise.all([
          saveRefreshToken(response.tokens.refreshToken),
          saveUserId(response.userId),
          saveUserType(userType),
        ]);

        set({
          status: 'authed',
          accessToken: response.tokens.accessToken,
          userId: response.userId,
          userType,
          isExpertMode: userType === 'photographer',
        });

        safeRegisterFcmDevice();
      } else {
        await saveUserId(response.userId);

        set({
          status: 'needs_signup',
          userId: response.userId,
          accessToken: null,
        });
      }

      return response.status;
    } catch (e) {
      set({ status: 'anon', accessToken: null });
      console.error('signInWithTestAccount error:', e);
      throw e;
    }
  },

  // 테스트 계정 회원가입
  async signUpWithTestAccount(formData: SignUpFormData) {
    set({ status: 'loading' });
    try {
      const response = await testSignUpApi(formData);

      if (response.status === 'LOGIN_SUCCESS') {
        const userType = response.role === 'USER' ? 'user' : 'photographer';
        const signupDate = new Date().toISOString().split('T')[0];

        await analytics().logEvent('sign_up', {
          user_id: response.userId,
          user_type: userType,
          signup_date: signupDate,
          method: 'test_account',
        });

        analytics().setUserId(response.userId);
        analytics().setUserProperties({
          user_type: userType,
          signup_date: signupDate,
        });

        crashlytics().setUserId(response.userId);
        crashlytics().setAttributes({
          userType: userType,
          signupDate: signupDate,
        });

        crashlytics().log(`✅ Test user signed up: ${response.userId} (${userType})`);

        await Promise.all([
          saveRefreshToken(response.tokens.refreshToken),
          saveUserId(response.userId),
          saveUserType(userType),
        ]);

        set({
          status: 'authed',
          accessToken: response.tokens.accessToken,
          userId: response.userId,
          userType,
          isExpertMode: userType === 'photographer',
        });

        safeRegisterFcmDevice();
      }
    } catch (e) {
      set({ status: 'anon', accessToken: null });
      console.error('signUpWithTestAccount error:', e);
      throw e;
    }
  },

  async signOut() {
    // 서버 로그아웃/FCM 정리는 best-effort
    await Promise.allSettled([
      logoutApi(),
      safeDeleteFcmToken(),
    ]);

    set({ status: 'anon', accessToken: null, userId: '' });

    // Clear all persistent storage
    await Promise.allSettled([
      clearRefreshToken(),
      clearUserId(),
      clearUserType(),
      clearAppleLoginInfo(),
    ]);

    // Query 캐시 초기화
    queryClient.clear();

  },

  async signUp(formData: SignUpFormData) {
    set({ status: 'loading' });
    try {
      const response = await signUpApi(formData);

      if (response.status === 'LOGIN_SUCCESS') {
        const userType = response.role === 'USER' ? 'user' : 'photographer';
        const signupDate = new Date().toISOString().split('T')[0];

        await analytics().logEvent('sign_up', {
          user_id: response.userId,
          user_type: userType,
          signup_date: signupDate,
        });

        // ✅ Analytics 사용자 속성 설정
        analytics().setUserId(response.userId);
        analytics().setUserProperties({
          user_type: userType,
          signup_date: signupDate,
        });

        // ✅ Crashlytics 사용자 컨텍스트 설정
        crashlytics().setUserId(response.userId);
        crashlytics().setAttributes({
          userType: userType,
          signupDate: signupDate,
        });

        crashlytics().log(`✅ User signed up: ${response.userId} (${userType})`);

        // Save tokens and user data to persistent storage
        await Promise.all([
          saveRefreshToken(response.tokens.refreshToken),
          saveUserId(response.userId),
          saveUserType(userType),
        ]);

        // 회원가입 완료 후 저장된 애플 로그인 정보 삭제
        await clearAppleLoginInfo();

        set({
          status: 'authed',
          accessToken: response.tokens.accessToken,
          userId: response.userId,
          userType,
          isExpertMode: userType === 'photographer', // photographer는 기본 전문가 모드
        });

        // FCM 등록은 백그라운드에서 처리 (UI blocking 방지)
        safeRegisterFcmDevice();
      }
    } catch (e) {
      set({ status: 'anon', accessToken: null });
      console.error(e);
      throw e;
    }
  },

  withdraw: async () => {
    const result = await withdrawApi().then(
      () => ({ ok: true as const }),
      (e) => ({ ok: false as const, e }),
    );

    // Clear all persistent storage
    await Promise.allSettled([
      clearRefreshToken(),
      clearUserId(),
      clearUserType(),
      clearAppleLoginInfo(),
    ]);

    set({ status: 'anon', accessToken: null, userId: '' });

    // Query 캐시 초기화
    queryClient.clear();

    // FCM 정리는 best-effort
    await safeDeleteFcmToken();

    // 필요하면 호출한 쪽에서 에러 핸들링할 수 있게 throw
    if (!result.ok) throw result.e;
  },

  getAccessToken: async () => {
    // 1. 이미 리프레시 진행 중이면 생성된 Promise 반환 (Lock)
    if (isRefreshing && refreshPromise) {
      console.log('[getAccessToken] Already refreshing, returning existing promise');
      return refreshPromise;
    }

    const accessToken = get().accessToken;

    // 2. 유효한 토큰이 있으면 즉시 반환
    if (accessToken && !isJwtExpired(accessToken)) {
      return accessToken;
    }

    const refreshToken = await loadRefreshToken();
    if (!refreshToken) return null;

    // 3. 리프레시 시작 (Lock 설정)
    isRefreshing = true;
    refreshPromise = (async () => {
      try {
        console.log('[getAccessToken] Refreshing token...');
        const refreshPromiseApi = refreshApi(refreshToken);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Refresh timeout')), 10000) // 10초로 연장
        );

        const refreshed = await Promise.race([refreshPromiseApi, timeoutPromise]) as any;

        if (refreshed.refreshToken && refreshed.refreshToken !== refreshToken) {
          await saveRefreshToken(refreshed.refreshToken);
        }

        set({
          status: 'authed',
          accessToken: refreshed.accessToken,
        });

        console.log('[getAccessToken] Token refreshed successfully');
        return refreshed.accessToken;
      } catch (e) {
        console.error('[getAccessToken] Token refresh failed:', e);
        // 토큰이 만료/무효화된 경우 완전히 로그아웃 처리
        if (e instanceof RefreshTokenError && e.isTokenInvalid) {
          console.log('[getAccessToken] Token invalid, logging out...');
          await Promise.all([
            clearRefreshToken(),
            clearUserId(),
            clearUserType(),
          ]);
          set({ status: 'anon', accessToken: null, userId: '' });
          queryClient.clear();

          // 화면 네비게이션 복귀와 Alert 표시가 동시에 일어나면서 발생하는 터치 블록(Freeze) 버그를 막기 위해 지연 호출
          setTimeout(() => {
            Alert.show({
              title: '로그인이 필요합니다',
              message: '오랫동안 사용하지 않아 자동으로 로그아웃 되었습니다.\n계속 이용하시려면 다시 로그인해주세요.',
              buttons: [
                {
                  text: '확인',
                  onPress: () => { },
                },
              ],
            });
          }, 500);
        } else {
          // 네트워크 에러 등 일시적 실패는 토큰만 null로
          set({ accessToken: null });
        }
        return null;
      } finally {
        // 4. 완료 후 Lock 해제
        isRefreshing = false;
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  }
}));

const isJwtExpired = (token: string, skewSeconds = 30) => {
  try {
    const { exp } = jwtDecode<{ exp?: number }>(token);
    const expMs = (exp ?? 0) * 1000;
    return Date.now() >= expMs - skewSeconds * 1000;
  } catch {
    return true;
  }
};

const safeDeleteFcmToken = async () => {
  try {
    console.log('[FCM] Deleting FCM token from server...');

    const fcmToken = await messaging().getToken().catch(() => null);

    if (!fcmToken) {
      console.log('[FCM] No FCM token found, skip deletion');
      return;
    }

    console.log('[FCM] FCM token to delete:', fcmToken.substring(0, 20) + '...');
    await deleteFCMToken(fcmToken);
    console.log('[FCM] FCM token deleted successfully from server');
  } catch (e) {
    console.error('[FCM] safeDeleteFcmToken failed:', e);
  }
};

const safeRegisterFcmDevice = async () => {
  try {
    console.log('[FCM] Starting FCM device registration...');

    // Step 1: 권한 요청 (iOS와 Android 모두)
    console.log('[FCM] Requesting notification permission...');
    const authStatus = await messaging().requestPermission({
      alert: true,
      badge: true,
      sound: true,
    });

    const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    console.log('[FCM] Platform:', Platform.OS, 'Permission status:', authStatus, 'enabled:', enabled);

    if (!enabled) {
      console.warn('[FCM] 알림 권한 거부됨');

      // 권한 거부 시 안내 Alert
      const settingsMessage = Platform.OS === 'android'
        ? '알림을 받으려면 설정에서 알림 권한을 허용해주세요.'
        : '알림을 받으려면 설정에서 알림 권한을 허용해주세요.\n\n설정 > Snaplink > 알림에서 변경할 수 있습니다.';

      Alert.show({
        title: '알림 권한이 거부되었습니다',
        message: settingsMessage,
        buttons: [
          {
            text: '나중에',
            type: 'cancel',
            onPress: () => { },
          },
          {
            text: '설정 열기',
            onPress: () => {
              Linking.openSettings().catch(() => {
                console.warn('설정 앱을 열 수 없습니다.');
              });
            },
          },
        ],
      });
      return;
    }

    if (Platform.OS === 'ios') {
      // Step 2 (iOS only): APNs 등록 (권한 승인 후)
      console.log('[FCM] iOS - Registering device for remote notifications...');
      await messaging().registerDeviceForRemoteMessages();
      console.log('[FCM] iOS - Device registered for remote notifications');

      // Step 3 (iOS only): APNs 토큰 대기 (retry with timeout)
      console.log('[FCM] iOS - Waiting for APNs token...');
      const apnsToken = await waitForAPNsToken();

      if (!apnsToken) {
        console.error('[FCM] iOS - Failed to get APNs token after retries, cannot proceed');
        return;
      }

      console.log('[FCM] iOS - APNs token obtained:', apnsToken.substring(0, 20) + '...');
    }

    // Step 4: FCM 토큰 생성
    console.log('[FCM] Getting FCM token...');
    const fcmToken = await messaging().getToken();

    if (!fcmToken) {
      console.error('[FCM] Failed to get FCM token');
      return;
    }

    console.log('[FCM] FCM token obtained:', fcmToken.substring(0, 20) + '...');

    // Step 5: 서버에 FCM 토큰 등록
    console.log('[FCM] Registering FCM token with server...');
    await registerFCMdevice(fcmToken);
    console.log('[FCM] FCM device registration completed successfully');

    // Step 6: 알림 설정 초기화 (모든 알림 허용)
    console.log('[FCM] Setting notification preferences to all enabled...');
    try {
      await updateNotificationSettings({
        consentMarketing: true,
        consentCommunity: true,
        consentChat: true,
        consentSystem: true,
        consentSchedule: true,
      });
      console.log('[FCM] Notification preferences updated successfully');
    } catch (e) {
      console.error('[FCM] Failed to update notification preferences:', e);
      // 설정 업데이트 실패해도 FCM 등록은 성공으로 간주
    }
  } catch (e) {
    console.error('[FCM] safeRegisterFcmDevice failed:', e);
  }
};

/**
 * APNs 토큰을 기다리는 헬퍼 함수 (retry 로직 포함)
 * iOS에서 registerDeviceForRemoteMessages() 후 APNs 토큰 생성까지 시간이 걸릴 수 있음
 */
const waitForAPNsToken = async (maxRetries = 10, delayMs = 500): Promise<string | null> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const token = await messaging().getAPNSToken();
      if (token) {
        console.log(`[FCM] APNs token obtained on attempt ${i + 1}`);
        return token;
      }
    } catch (e) {
      console.log(`[FCM] APNs token not available yet (attempt ${i + 1}/${maxRetries})`);
    }

    // 마지막 시도가 아니면 대기
    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  console.error('[FCM] APNs token not available after', maxRetries, 'attempts');
  return null;
};