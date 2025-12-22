import { API_BASE_URL } from '@/config/api.ts';

const AUTH_BASE = `${API_BASE_URL}/api/v1/auth`;

type LoginSuccessResponse = {
  status: 'LOGIN_SUCCESS';
  userId: string;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
};

type SignupRequiredResponse = {
  status: 'NEED_SIGNUP'
  userId: string;
};

export async function authorize () {

}

export type SignInResponse =
  | LoginSuccessResponse
  | SignupRequiredResponse;

export async function signInApi (provider: string, token: string): Promise<SignInResponse> {
  const response = await fetch(`${AUTH_BASE}/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, token: token }),
  });

  if (!response.ok) throw new Error(`signin failed: ${response.status}`);

  const data = await response.json();

  if (data.status === 'LOGIN_SUCCESS') {
    return {
      status: 'LOGIN_SUCCESS',
      userId: data.userId,
      tokens: {
        accessToken: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken,
      }
    }
  }

  return {
    status: 'NEED_SIGNUP',
    userId: data.userId,
  }
}

export async function refreshApi(refreshToken: string): Promise<{ accessToken: string; refreshToken?: string }> {
  const response = await fetch(`${AUTH_BASE}/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) throw new Error(`refresh failed: ${response.status}`);

  const data = await response.json();
  return {
    accessToken: data.access_token ?? data.accessToken,
    refreshToken: data.refresh_token ?? data.refreshToken,
  };
}

export interface SignUpFormData {
  name: string;
  nickname: string;
  email: string;
  birthDate: string;
  gender: "MALE" | "FEMALE" | null;
  consentMarketing: boolean;
  id: string;
}

export async function signUpApi (formData: SignUpFormData): Promise<LoginSuccessResponse> {
  const response = await fetch(`${AUTH_BASE}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });

  if (!response.ok) throw new Error(`signup failed: ${response.status}`);

  const data = await response.json();

  return {
    status: 'LOGIN_SUCCESS',
    userId: data.userId,
    tokens: {
      accessToken: data.tokens.accessToken,
      refreshToken: data.tokens.refreshToken,
    }
  }
}