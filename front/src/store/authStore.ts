import { create } from 'zustand';
import { signInApi, refreshApi, signUpApi, SignUpFormData, logoutApi, withdrawApi } from '@/api/auth';
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
} from '@/auth/tokenStore.ts';
import messaging from '@react-native-firebase/messaging';
import { deleteFCMToken, registerFCMdevice } from '@/api/fcm.ts';
import { login } from '@react-native-kakao/user';
import { jwtDecode } from 'jwt-decode';
import { Platform } from 'react-native';
import { queryClient } from '@/config/queryClient.ts';
import analytics from '@react-native-firebase/analytics';

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
  signInWithKakao: () => Promise<string | null>;
  signInWithProviderToken: (provider: 'KAKAO' | 'NAVER' | 'GOOGLE', token: string) => Promise<'LOGIN_SUCCESS' | 'SIGNUP_REQUIRED'>;
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
  userType: 'photographer',
  accessToken: null,
  isExpertMode: true, // photographer는 기본 전문가 모드
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
    try {
      console.log('[AuthStore] Bootstrap starting...');
      const refreshToken = await loadRefreshToken();

      if (!refreshToken) {
        console.log('[AuthStore] No refresh token found, setting anon status');
        set({ status: 'anon', accessToken: null, userId: '', bootstrapped: true });
        return;
      }

      console.log('[AuthStore] Refresh token found, attempting to refresh...');
      const startTime = Date.now();

      // 5초 타임아웃 추가
      const refreshPromise = refreshApi(refreshToken);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Refresh timeout')), 5000)
      );

      const refreshed = await Promise.race([refreshPromise, timeoutPromise]) as any;

      const elapsed = Date.now() - startTime;
      console.log(`[AuthStore] Token refreshed successfully in ${elapsed}ms`);

      if (refreshed.refreshToken && refreshed.refreshToken !== refreshToken) {
        console.log('[AuthStore] New refresh token received, saving...');
        await saveRefreshToken(refreshed.refreshToken);
      }

      // Load userId and userType from persistent storage
      const [savedUserId, savedUserType] = await Promise.all([
        loadUserId(),
        loadUserType(),
      ]);

      console.log('[AuthStore] Loaded userId:', savedUserId, 'userType:', savedUserType);

      set({
        accessToken: refreshed.accessToken,
        status: 'authed',
        userId: savedUserId || '',
        userType: savedUserType || 'user',
        bootstrapped: true,
      });
      console.log('[AuthStore] Bootstrap completed successfully');
    } catch (e) {
      console.error('[AuthStore] Bootstrap failed:', e);
      await clearRefreshToken();
      set({ status: 'anon', accessToken: null, userId: '', bootstrapped: true });
    }
  },

  async signInWithKakao(): Promise<string | null> {
    set({ status: 'loading' });
    try {
      const response = await login();

      return new Promise(resolve => resolve(response.accessToken));
    } catch (e) {
      set({ status: 'anon' });
      console.error('signInWithKakaoCode error:', e);
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

        analytics().setUserId(response.userId);
        analytics().setUserProperties({
          user_type: userType,
        });

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
        });

        await safeRegisterFcmDevice();
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

  async signOut() {
    set({ status: 'anon', accessToken: null, userId: '' });

    // Clear all persistent storage
    await Promise.allSettled([
      clearRefreshToken(),
      clearUserId(),
      clearUserType(),
    ]);

    // Query 캐시 초기화
    queryClient.clear();

    // 서버 로그아웃/FCM 정리는 best-effort
    await Promise.allSettled([
      logoutApi(),
      safeDeleteFcmToken(),
    ]);
  },

  async signUp(formData: SignUpFormData) {
    set({ status: 'loading' });
    try {
      const response = await signUpApi(formData);

      if (response.status === 'LOGIN_SUCCESS') {
        const userType = response.role === 'USER' ? 'user' : 'photographer';

        await analytics().logEvent('sign_up');

        analytics().setUserId(response.userId);
        analytics().setUserProperties({
          user_type: userType,
        });

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
        });

        await safeRegisterFcmDevice();
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
    const accessToken = get().accessToken;

    if (accessToken && !isJwtExpired(accessToken)) {
      return accessToken;
    }

    const refreshToken = await loadRefreshToken();
    if (!refreshToken) {
      // refreshToken이 없어도 바로 로그아웃하지 않음
      // 이미 authed 상태라면 유지 (UI에서 401 발생 시 처리)
      console.log('[getAccessToken] No refresh token available');
      return null;
    }

    try {
      const refreshed = await refreshApi(refreshToken);

      if (refreshed.refreshToken && refreshed.refreshToken !== refreshToken) {
        await saveRefreshToken(refreshed.refreshToken);
      }

      set({
        status: 'authed',
        accessToken: refreshed.accessToken,
      });

      return refreshed.accessToken;
    } catch (e) {
      console.error('[getAccessToken] Token refresh failed:', e);
      // Refresh 실패 시 토큰 정리하지만 status는 유지
      // authFetch에서 401 처리 후 최종 실패 시에만 로그아웃
      await clearRefreshToken();
      set({ accessToken: null });
      return null;
    }
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
    if (Platform.OS === 'ios') {
      await messaging().registerDeviceForRemoteMessages().catch(() => {});
      const apnsToken = await messaging().getAPNSToken().catch(() => null);
      if (!apnsToken) return;
    }

    const fcmToken = await messaging().getToken();
    if (!fcmToken) return;

    await deleteFCMToken(fcmToken);
  } catch (e) {
    console.log('[Auth] safeDeleteFcmToken failed:', e);
  }
};

const safeRegisterFcmDevice = async () => {
  try {
    if (Platform.OS === 'ios') {
      // iOS에서 APNs 준비가 안 되면 getToken이 터질 수 있음
      await messaging().registerDeviceForRemoteMessages();
      await messaging().requestPermission();

      const apnsToken = await messaging().getAPNSToken().catch(() => null);
      if (!apnsToken) {
        console.log('[Auth] APNs token not ready, skip FCM register');
        return;
      }
    }

    const fcmToken = await messaging().getToken();
    if (!fcmToken) return;

    await registerFCMdevice(fcmToken);
  } catch (e) {
    console.log('[Auth] safeRegisterFcmDevice failed:', e);
  }
};