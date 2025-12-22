import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, View, ActivityIndicator, Alert } from 'react-native';
import WebView from 'react-native-webview';
import { KAKAO_REST_API_KEY } from '@/config/api';

const KAKAO_AUTH_URL = 'https://kauth.kakao.com/oauth/authorize';
const REDIRECT_URI = 'https://snaplink-web-mu.vercel.app/kakao/callback';

function randomString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

type KakaoAuthMessage = {
  type: string;
  code: string | null;
  state: string | null;
  error: string | null;
  error_description: string | null;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSuccess: (code: string, codeVerifier: string) => void;
};

export default function KakaoLoginWebView({ visible, onClose, onSuccess }: Props) {
  const webRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);

  const [pkce, setPkce] = useState<{
    state: string;
    codeVerifier: string;
    codeChallenge: string;
  } | null>(null);

  useEffect(() => {
    if (!visible) return;

    const state = randomString(32);
    // PKCE는 선택사항이므로 빈 값으로 설정
    const codeVerifier = '';
    const codeChallenge = '';

    console.log('Auth params generated:', { state });

    setPkce({ state, codeVerifier, codeChallenge });
  }, [visible]);

  const authUrl = useMemo(() => {
    if (!pkce || !KAKAO_REST_API_KEY) {
      console.log('authUrl not ready:', { pkce: !!pkce, apiKey: !!KAKAO_REST_API_KEY });
      return null;
    }

    const params: Record<string, string> = {
      response_type: 'code',
      client_id: KAKAO_REST_API_KEY,
      redirect_uri: REDIRECT_URI,
      state: pkce.state,
    };

    // PKCE는 선택사항
    if (pkce.codeChallenge) {
      params.code_challenge = pkce.codeChallenge;
      params.code_challenge_method = 'S256';
    }

    const url = `${KAKAO_AUTH_URL}?${new URLSearchParams(params).toString()}`;
    console.log('Auth URL generated:', url);
    return url;
  }, [pkce]);

  function handleMessage(event: any) {
    try {
      console.log('WebView message received:', event.nativeEvent.data);
      const msg: KakaoAuthMessage = JSON.parse(event.nativeEvent.data);
      console.log('Parsed message:', msg);

      if (msg.type !== 'KAKAO_AUTH_RESULT') {
        console.log('Ignoring non-auth message');
        return;
      }

      if (msg.error) {
        console.error('Kakao auth error:', msg.error, msg.error_description);
        Alert.alert('로그인 실패', msg.error_description || msg.error);
        onClose();
        return;
      }

      if (!pkce || msg.state !== pkce.state) {
        console.error('State mismatch:', { received: msg.state, expected: pkce?.state });
        Alert.alert('보안 오류', 'state 불일치. 다시 시도해주세요.');
        onClose();
        return;
      }

      if (!msg.code) {
        console.error('No auth code received');
        Alert.alert('오류', '인가 코드가 없습니다.');
        onClose();
        return;
      }

      console.log('Auth successful, calling onSuccess with code:', msg.code.substring(0, 10) + '...');
      onSuccess(msg.code, pkce.codeVerifier);
    } catch (error) {
      console.error('WebView message parsing error:', error);
    }
  }

  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="slide">
      <View style={{ flex: 1 }}>
        {loading && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            <ActivityIndicator size="large" />
          </View>
        )}

        {authUrl && (
          <WebView
            ref={webRef}
            source={{ uri: authUrl }}
            onLoadStart={() => {
              console.log('WebView load started');
              setLoading(true);
            }}
            onLoadEnd={() => {
              console.log('WebView load ended');
              setLoading(false);
            }}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('WebView error:', nativeEvent);
            }}
            onMessage={handleMessage}
            incognito
            sharedCookiesEnabled={false}
            thirdPartyCookiesEnabled={false}
            javaScriptEnabled
            domStorageEnabled
            originWhitelist={['https://*']}
            mixedContentMode="always"
            allowsInlineMediaPlayback
          />
        )}
      </View>
    </Modal>
  );
}
