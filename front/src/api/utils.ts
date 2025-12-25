import { useAuthStore } from '@/store/authStore';

// export type AuthFetch = typeof fetch;

export type AuthRequestInit = RequestInit & {
  json?: unknown; // body 대신 json을 주면 자동 stringify + Content-Type 지정
};

export const authFetch: (
  input: Parameters<typeof fetch>[0],
  init?: AuthRequestInit
) => ReturnType<typeof fetch> = async (input, init) => {
  const { getAccessToken } = useAuthStore.getState();
  const token = await getAccessToken();

  const headers = new Headers(init?.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let body = init?.body;
  if (init?.json !== undefined) {
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

  return fetch(input as any, nextInit);
};