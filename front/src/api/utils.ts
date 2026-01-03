import { useAuthStore } from '@/store/authStore';
import RNBlobUtil from 'react-native-blob-util';
import { Platform } from 'react-native';

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

const safeParseJson = (text: string) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

export const authFetch = async (
  input: Parameters<typeof fetch>[0],
  init: AuthRequestInit = {},
) => {
  const { getAccessToken } = useAuthStore.getState();
  const token = await getAccessToken();

  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let body = init.body;
  if (init.json !== undefined) {
    body = JSON.stringify(init.json);
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  }

  const nextInit: RequestInit = { ...init, headers, body };
  delete (nextInit as any).json;

  const doFetch = async (reqInit: RequestInit) => {
    const res = await fetch(input as any, reqInit);

    // ✅ 응답 바디 로깅(원본 response는 소비하지 않게 clone 사용)
    let text = '';
    let json: any = null;

    try {
      text = await res.clone().text();
      json = safeParseJson(text);
    } catch (e) {
      console.error(e);
    }

    console.log('--------------------------------------');
    console.log('url:', input);
    console.log('request:', {
      ...reqInit,
      // Headers는 콘솔에서 안 예쁘게 보이니까 객체로 펼쳐주기
      headers: Object.fromEntries((reqInit.headers as Headers).entries()),
      body: typeof reqInit.body === 'string' ? reqInit.body.slice(0, 2000) : reqInit.body, // 너무 길면 컷
    });
    console.log('response:', {
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      headers: Object.fromEntries(res.headers.entries()),
      text: text.slice(0, 4000),
      json, // json이면 여기로 보임
    });
    console.log('--------------------------------------');

    return res;
  };

  let response = await doFetch(nextInit);

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

    const retryInit: RequestInit = { ...init, headers: retryHeaders, body };
    delete (retryInit as any).json;

    response = await doFetch(retryInit);
  }

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

  // IMPORTANT: Do NOT set Content-Type for multipart/form-data
  // RNBlobUtil will automatically set the correct Content-Type with boundary
  const headers: Record<string, string> = {};

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

export async function toBlobPath(uri: string): Promise<string> {
  if (!uri) throw new Error('Empty uri');

  // iOS PhotoKit URI는 그대로는 업로드 불가인 경우가 많음
  if (Platform.OS === 'ios' && uri.startsWith('ph://')) {
    throw new Error(
      'iOS ph:// URI는 바로 업로드할 수 없습니다. file:// 경로(fileCopyUri 등)로 변환해서 넘겨주세요.',
    );
  }

  // Android content:// 는 실제 path로 변환 필요
  if (Platform.OS === 'android' && uri.startsWith('content://')) {
    const stat = await RNBlobUtil.fs.stat(uri);
    return stat.path;
  }

  // file://
  if (uri.startsWith('file://')) {
    // 공백/한글 대비
    return decodeURIComponent(uri.replace('file://', ''));
  }

  // 이미 path 형태거나 http(s) 같은 이상 케이스
  return decodeURIComponent(uri);
}