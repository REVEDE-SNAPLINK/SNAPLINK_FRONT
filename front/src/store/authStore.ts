import { create } from 'zustand';
import { signInApi, refreshApi, signUpApi, SignUpFormData } from '@/api/auth';
import { saveRefreshToken, loadRefreshToken, clearRefreshToken } from '@/auth/tokenStore.ts';
import { KAKAO_REST_API_KEY, KAKAO_CLIENT_SECRET } from '@/config/api';

const KAKAO_TOKEN_URL = 'https://kauth.kakao.com/oauth/token';
const REDIRECT_URI = 'https://snaplink-web-mu.vercel.app/kakao/callback';

type AuthStatus = 'idle' | 'loading' | 'authed' | 'anon' | 'needs_signup';

type AuthState = {
  status: AuthStatus;
  userId: string | null;
  userType: 'user' | 'photographer';
  accessToken: string | null;

  signUpCompletionModalType: boolean;
  setSignUpCompletionModalType: () => void;

  // actions
  bootstrap: () => Promise<void>;
  signInWithKakaoCode: (code: string, codeVerifier: string) => Promise<void>;
  signInWithProviderToken: (provider: 'KAKAO' | 'NAVER' | 'GOOGLE', token: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (formData: SignUpFormData) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'idle',
  userType: 'user',
  userId: null,
  accessToken: null,

  signUpCompletionModalType: false,
  setSignUpCompletionModalType: () => {
    set({ signUpCompletionModalType: true });
  },

  async bootstrap() {
    // TODO: refresh api 추가 시 수정
    // try {
    //   const refreshToken = await loadRefreshToken();
    //   if (!refreshToken) {
    //     set({ status: 'anon', accessToken: null, userId: null });
    //     return;
    //   }
    //
    //   const refreshed = await refreshApi(refreshToken);
    //
    //   if (refreshed.refreshToken && refreshed.refreshToken !== refreshToken) {
    //     await saveRefreshToken(refreshed.refreshToken);
    //   }
    //
    //   set({ accessToken: refreshed.accessToken, status: 'authed' });
    //
    // } catch (e) {
    //   await clearRefreshToken();
    //   set({ status: 'anon', accessToken: null, userId: null });
    // }
    set({ status: 'anon', accessToken: null, userId: null });
  },

  async signInWithKakaoCode(code: string, codeVerifier: string) {
    set({ status: 'loading' });
    try {
      if (!KAKAO_REST_API_KEY) {
        throw new Error('KAKAO_REST_API_KEY is not configured');
      }

      console.log('Token exchange request:', {
        client_id: KAKAO_REST_API_KEY,
        redirect_uri: REDIRECT_URI,
        code: code.substring(0, 10) + '...',
        has_client_secret: !!KAKAO_CLIENT_SECRET,
        has_code_verifier: !!codeVerifier,
      });

      const params: Record<string, string> = {
        grant_type: 'authorization_code',
        client_id: KAKAO_REST_API_KEY,
        redirect_uri: REDIRECT_URI,
        code,
      };

      // Client Secret이 있으면 포함
      if (KAKAO_CLIENT_SECRET) {
        params.client_secret = KAKAO_CLIENT_SECRET;
      }

      // PKCE는 선택사항
      if (codeVerifier) {
        params.code_verifier = codeVerifier;
      }

      const body = new URLSearchParams(params);

      const response = await fetch(KAKAO_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
        body: body.toString(),
      });

      const tokenData = await response.json();
      console.log('Token response status:', response.status);
      console.log('Token response data:', tokenData);

      if (!response.ok) {
        console.error('Token exchange failed:', tokenData);
        throw new Error(tokenData?.error_description || tokenData?.error || 'Token exchange failed');
      }

      const kakaoAccessToken = tokenData.access_token;

      await get().signInWithProviderToken('KAKAO', kakaoAccessToken);
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

      if (response.status === 'LOGIN_SUCCESS')  {
        await saveRefreshToken(response.tokens.refreshToken);

        set({
          status: 'authed',
          accessToken: response.tokens.accessToken,
          userId: response.userId
        });
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
    }
  },

  async signOut() {
    await clearRefreshToken();
    set({ status: 'anon', accessToken: null, userId: null });
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
          userId: response.userId
        })
      }
    } catch (e) {
      console.error(e);
    }
    set({ status: 'anon', accessToken: null });
  }
}));