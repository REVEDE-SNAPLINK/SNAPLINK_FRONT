import { create } from 'zustand';
import { signInApi, refreshApi, signUpApi, SignUpFormData, logoutApi, withdrawApi } from '@/api/auth';
import { saveRefreshToken, loadRefreshToken, clearRefreshToken } from '@/auth/tokenStore.ts';
import messaging from '@react-native-firebase/messaging';
import { deleteFCMToken, registerFCMdevice } from '@/api/fcm.ts';
import { login } from '@react-native-kakao/user';

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

  // actions
  bootstrap: () => Promise<void>;
  signInWithKakao: () => Promise<string | null>;
  signInWithProviderToken: (provider: 'KAKAO' | 'NAVER' | 'GOOGLE', token: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (formData: SignUpFormData) => Promise<void>;
  withdraw: () => Promise<void>;
  toggleExpertMode: () => void;
  getAccessToken: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'idle',
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
      const refreshToken = await loadRefreshToken();
      if (!refreshToken) {
        set({ status: 'anon', accessToken: null, userId: "" });
        return;
      }

      const refreshed = await refreshApi(refreshToken);

      if (refreshed.refreshToken && refreshed.refreshToken !== refreshToken) {
        await saveRefreshToken(refreshed.refreshToken);
      }

      set({ accessToken: refreshed.accessToken, status: 'authed' });

    } catch (e) {
      await clearRefreshToken();
      set({ status: 'anon', accessToken: null, userId: "" });
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

  async signInWithProviderToken(provider, token) {
    set({ status: 'loading' });
    try {
      const response = await signInApi(provider, token);

      if (response.status === 'LOGIN_SUCCESS') {
        await saveRefreshToken(response.tokens.refreshToken);

        set({
          status: 'authed',
          accessToken: response.tokens.accessToken,
          userId: response.userId,
          userType: response.role === 'USER' ? 'user' : 'photographer',
        });

        messaging()
          .getToken()
          .then(token => registerFCMdevice(token));
      } else {
        set({
          status: 'needs_signup',
          userId: response.userId,
          accessToken: null,
        });
      }
    } catch (e) {
      set({ status: 'anon', accessToken: null });
      console.error(e);
      throw e;
    }
  },

  async signOut() {
    logoutApi().then(() => {
      clearRefreshToken().then(() => {
        messaging().getToken().then((token) => deleteFCMToken(token));
        set({ status: 'anon', accessToken: null, userId: '' });
      });
    })
  },

  async signUp(formData: SignUpFormData) {
    set({ status: 'loading' });
    try {
      const response = await signUpApi(formData);

      if (response.status === 'LOGIN_SUCCESS') {
        await saveRefreshToken(response.tokens.refreshToken);

        set({
          status: 'authed',
          accessToken: response.tokens.accessToken,
          userId: response.userId,
        });

        messaging()
          .getToken()
          .then(token => registerFCMdevice(token));
      }
    } catch (e) {
      set({ status: 'anon', accessToken: null });
      console.error(e);
      throw e;
    }
  },

  withdraw: async () => {
    withdrawApi().then(() => {
      clearRefreshToken().then(() => {
        messaging().getToken().then((token) => deleteFCMToken(token));
        set({ status: 'anon', accessToken: null, userId: '' });
      });
    })
  },

  getAccessToken: async () => {
    const accessToken = get().accessToken;

    if (accessToken && !isJwtExpired(accessToken)) {
      return accessToken;
    }

    const refreshToken = await loadRefreshToken();
    if (!refreshToken) {
      set({ status: 'anon', accessToken: null, userId: '' });
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
      await clearRefreshToken();
      set({ status: 'anon', accessToken: null, userId: '' });
      return null;
    }
  }
}));

const isJwtExpired = (token: string, skewSeconds = 30) => {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString('utf8')
    );
    const expMs = (payload.exp ?? 0) * 1000;
    return Date.now() >= expMs - skewSeconds * 1000; // 30초 여유
  } catch {
    // 파싱 실패면 안전하게 만료 취급
    return true;
  }
};