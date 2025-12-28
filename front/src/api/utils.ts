import { useAuthStore } from '@/store/authStore';
import RNBlobUtil from 'react-native-blob-util';

export type AuthRequestInit = RequestInit & {
  json?: unknown;
};

/**
 * Multipart 파트 정의
 */
export interface MultipartPart {
  name: string;
  type?: string;
  data: string | any;
  filename?: string;
}

export const authFetch = async (
  input: Parameters<typeof fetch>[0],
  init: AuthRequestInit = {},
) => {
  const { getAccessToken } = useAuthStore.getState();

  const token = await getAccessToken();

  // headers 복사
  const headers = new Headers(init.headers);

  if (token) headers.set('Authorization', `Bearer ${token}`);

  // ✅ json 옵션 처리
  let body = init.body;
  if (init.json !== undefined) {
    body = JSON.stringify(init.json);
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }

  const nextInit: RequestInit = {
    ...init,
    headers,
    body,
  };

  delete (nextInit as any).json;

  let response = await fetch(input as any, nextInit);

  // 401이면 토큰 갱신 후 1회 재시도
  if (response.status === 401) {
    const { accessToken: currentToken } = useAuthStore.getState();
    if (currentToken) useAuthStore.setState({ accessToken: null });

    const refreshed = await getAccessToken();
    if (!refreshed) return response;

    const retryHeaders = new Headers(init.headers);
    retryHeaders.set('Authorization', `Bearer ${refreshed}`);

    if (init.json !== undefined && !retryHeaders.has('Content-Type')) {
      retryHeaders.set('Content-Type', 'application/json');
    }

    const retryInit: RequestInit = {
      ...init,
      headers: retryHeaders,
      body,
    };

    delete (retryInit as any).json;

    response = await fetch(input as any, retryInit);
  }

  console.log('--------------------------------------');
  console.log('url:', input);
  console.log('request:', nextInit);
  console.log('response:', response);
  console.log('--------------------------------------');

  return response;
};

/**
 * Multipart/form-data 전송용 인증 fetch
 * RNBlobUtil을 사용하여 파일 업로드 지원
 *
 * @param url 요청 URL
 * @param parts Multipart 파트 배열
 * @param method HTTP 메서드 (기본: POST)
 * @returns RNBlobUtil Response
 *
 * @example
 * ```typescript
 * const parts: MultipartPart[] = [
 *   {
 *     name: 'request',
 *     type: 'application/json',
 *     data: JSON.stringify({ title: 'Test' }),
 *   },
 *   {
 *     name: 'images',
 *     filename: 'photo.jpg',
 *     type: 'image/jpeg',
 *     data: RNBlobUtil.wrap(uri),
 *   },
 * ];
 * const res = await authMultipartFetch(url, parts);
 * ```
 */
export const authMultipartFetch = async (
  url: string,
  parts: MultipartPart[],
  method: 'POST' | 'PATCH' | 'PUT' = 'POST',
) => {
  const { getAccessToken } = useAuthStore.getState();
  const token = await getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'multipart/form-data',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response = await RNBlobUtil.fetch(method, url, headers, parts);

  // 401이면 토큰 갱신 후 1회 재시도
  if (response.info().status === 401) {
    const { accessToken: currentToken } = useAuthStore.getState();
    if (currentToken) useAuthStore.setState({ accessToken: null });

    const refreshed = await getAccessToken();
    if (!refreshed) return response;

    const retryHeaders: Record<string, string> = {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${refreshed}`,
    };

    response = await RNBlobUtil.fetch(method, url, retryHeaders, parts);
  }

  console.log('--------------------------------------');
  console.log('url:', url);
  console.log('request:', parts);
  console.log('response:', response);
  console.log('--------------------------------------');


  return response;
};