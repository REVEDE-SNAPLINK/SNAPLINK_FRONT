import { API_BASE_URL } from '@/config/api.ts';
import { authFetch } from '@/api/utils.ts';

const AUTH_BASE = `${API_BASE_URL}/api/auth`;
const TEST_AUTH_BASE = `${API_BASE_URL}/api/test/auth`;

type LoginSuccessResponse = {
  status: 'LOGIN_SUCCESS';
  userId: string;
  role: "USER" | "PHOTOGRAPHER"
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
};

type SignupRequiredResponse = {
  status: 'SIGNUP_REQUIRED'
  userId: string;
};

export type SignInResponse =
  | LoginSuccessResponse
  | SignupRequiredResponse;

// 로그인
export async function signInApi(provider: string, token: string): Promise<SignInResponse> {
  // console.log({
  //   provider,
  //   token,
  // })

  const response = await fetch(`${AUTH_BASE}/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, token: token }),
  });

  if (!response.ok) throw new Error(`로그인할 수 없습니다. ${response.status} ${response.statusText}`);

  const data = await response.json();

  if (data.status === 'LOGIN_SUCCESS') {
    return {
      status: data.status,
      userId: data.userId,
      role: data.role,
      tokens: {
        accessToken: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken,
      }
    }
  }

  return {
    status: data.status,
    userId: data.userId,
  }
}

// 토큰 갱신 에러 클래스
export class RefreshTokenError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'RefreshTokenError';
  }

  // 토큰이 만료/무효화되어 삭제해야 하는 경우
  get isTokenInvalid(): boolean {
    return this.statusCode === 401 || this.statusCode === 403;
  }
}

// 토큰 갱신
export async function refreshApi(refreshToken: string): Promise<{ accessToken: string; refreshToken?: string }> {
  const response = await fetch(`${AUTH_BASE}/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new RefreshTokenError(response.status, `토큰 갱신 실패 (${response.status})`);
  }

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
  role: "USER" | "PHOTOGRAPHER";
  consentMarketing: boolean;
  id: string;
}

// 회원가입
export async function signUpApi(formData: SignUpFormData): Promise<LoginSuccessResponse> {
  console.log(formData);

  const response = await fetch(`${AUTH_BASE}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });

  if (!response.ok) throw new Error('회원가입을 완료할 수 없습니다.');

  const data = await response.json();

  return {
    status: 'LOGIN_SUCCESS',
    userId: data.userId,
    role: data.role,
    tokens: {
      accessToken: data.tokens.accessToken,
      refreshToken: data.tokens.refreshToken,
    },
  }
}

// 로그아웃
export async function logoutApi(): Promise<void> {
  const response = await authFetch(`${AUTH_BASE}/logout`, {
    method: 'POST',
  })

  if (!response.ok) throw new Error('로그아웃할 수 없습니다.');
}

// 회원 탈퇴
export async function withdrawApi(): Promise<void> {
  const response = await authFetch(`${AUTH_BASE}/withdraw`, {
    method: 'DELETE',
  })

  if (!response.ok) throw new Error('회원 탈퇴를 완료할 수 없습니다.');
}

// ============================================================
// 테스트 계정 API (개발/테스트 환경 전용)
// ============================================================

// 테스트 계정 로그인
export async function testSignInApi(id: string): Promise<SignInResponse> {
  const response = await fetch(`${TEST_AUTH_BASE}/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider: "KAKAO", id }),
  });

  console.log(response);

  if (!response.ok) throw new Error('테스트 계정 로그인에 실패했습니다.');

  const data = await response.json();

  if (data.status === 'LOGIN_SUCCESS') {
    return {
      status: data.status,
      userId: data.userId,
      role: data.role,
      tokens: {
        accessToken: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken,
      }
    }
  }

  return {
    status: data.status,
    userId: data.userId,
  }
}

// 테스트 계정 회원가입
export async function testSignUpApi(formData: SignUpFormData): Promise<LoginSuccessResponse> {
  const response = await fetch(`${TEST_AUTH_BASE}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });

  if (!response.ok) throw new Error('테스트 계정 회원가입에 실패했습니다.');

  const data = await response.json();

  return {
    status: 'LOGIN_SUCCESS',
    userId: data.userId,
    role: data.role,
    tokens: {
      accessToken: data.tokens.accessToken,
      refreshToken: data.tokens.refreshToken,
    },
  }
}