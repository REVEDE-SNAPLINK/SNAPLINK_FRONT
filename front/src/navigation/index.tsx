import {
  NavigationContainer,
  createNavigationContainerRef,
  Route,
  NavigationState,
} from '@react-navigation/native';
import RootNavigator from '@/navigation/RootNavigator.tsx';
import { AppState, Linking, Platform } from 'react-native';
import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore.ts';
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import {
  safeLogEvent,
  parseDeepLinkUrl,
  checkAndMarkFirstInstall,
  setCrashlyticsContext,
  safeCrashlyticsLog,
  trackDeepLinkOpen,
  resetImpressionCache,
  loadAttributionTrackingCode,
} from '@/utils/analytics.ts';
import { resolveAndroidInstallReferrer } from '@/utils/installReferrer.ts';
import { getLinkHubUrl } from '@/config/api';

export const navigationRef = createNavigationContainerRef();

// 미인증 상태에서 수신된 딥링크를 보관한다.
// 인증 완료 후 pendingDeepLink processing useEffect에서 소비된다.
let pendingDeepLink: { url: string; isFirstInstall: boolean } | null = null;

export const navigateByDeepLink = async (url: string, options?: { userId?: string; userType?: string; isFirstInstall?: boolean }) => {
  // 인증 상태 확인 - 미인증이면 보류하고 종료
  const { status } = useAuthStore.getState();
  if (status !== 'authed') {
    console.log('⏳ Deep link deferred (auth status:', status, '):', url);
    pendingDeepLink = { url, isFirstInstall: options?.isFirstInstall ?? false };
    return;
  }

  console.log('🔗 Processing deep link:', url);

  // ── deep_link_open 이벤트 로깅 ──
  const parsed = parseDeepLinkUrl(url);

  // EntityType 매핑
  const mapEntityType = (linkType: string) => {
    switch (linkType) {
      case 'photographer_profile': return 'photographer';
      case 'portfolio_post': return 'portfolio_post';
      case 'community_post': return 'community_post';
      case 'booking': return 'booking';
      case 'chat': return 'room';
      default: return undefined;
    }
  };

  setCrashlyticsContext({
    flow: 'deep_link',
    entityId: parsed.targetId,
    entityType: mapEntityType(parsed.linkType)
  });
  safeCrashlyticsLog(`🔗 Deep link opened: ${parsed.linkType} / ${parsed.targetId}`);

  trackDeepLinkOpen(url, parsed, {
    is_first_open_after_install: options?.isFirstInstall ?? false,
  });

  if (!navigationRef.isReady()) {
    console.log('⚠️ Navigation not ready, retrying in 500ms...');
    setTimeout(() => navigateByDeepLink(url, options), 500);
    return;
  }

  // 스킴 제거 (snaplink://tab/home -> tab/home or https://link.snaplink.run/tab/home -> tab/home)
  let routePath = url;
  if (url.includes('://')) {
    const parts = url.split('://');
    routePath = parts[1];

    // Remove domain for https links
    if (routePath.startsWith('link.snaplink.run/')) {
      routePath = routePath.replace('link.snaplink.run/', '');
    }
  }

  // Remove leading slashes (snaplink:///tab/home -> tab/home)
  routePath = routePath.replace(/^\/+/, '');

  console.log('📍 Route path:', routePath);


  // Parse the path - 쿼리 스트링(?...) 앞까지만 remainingPath로 캡처하도록 수정
  const pathMatch = routePath.match(/^tab\/(\w+)(?:\/([^?]+))?(?:\?(.+))?$/);

  if (!pathMatch) {
    console.warn('❌ Invalid deeplink format:', routePath);
    // deep_link_landing_resolved: 실패
    safeLogEvent('deep_link_landing_resolved', {
      original_link_type: parsed.linkType,
      original_target_id: parsed.targetId,
      resolved_screen: '',
      resolved_target_id: '',
      resolve_success: false,
      fail_reason: 'invalid_link',
    });
    return;
  }

  const [, tab, remainingPath, queryString] = pathMatch;
  console.log('✅ Parsed - tab:', tab, 'remaining:', remainingPath, 'query:', queryString);

  // Parse query parameters
  const params: any = {};
  if (queryString) {
    queryString.split('&').forEach(param => {
      const [key, value] = param.split('=');
      if (key && value) {
        params[key] = decodeURIComponent(value);
      }
    });
  }

  // If only tab is specified (e.g., snaplink://tab/home)
  if (!remainingPath) {
    (navigationRef as any).reset({
      index: 0,
      routes: [
        {
          name: 'Main',
          state: {
            index: 0,
            routes: [{ name: 'Home', params: { ...params } }],
          },
        },
      ],
    });
    return;
  }

  // Handle different tab types
  let screenName: string | null = null;
  let screenParams: any = {};

  // Tab-specific routing
  if (tab === 'chat') {
    // tab/chat/:roomId
    screenName = 'ChatDetails';
    screenParams = { roomId: Number(remainingPath) };
  } else if (tab === 'home') {
    // tab/home/photographer/:id or tab/home/portfolio/:postId or tab/home/review/:id
    const parts = remainingPath.split('/');
    const firstSegment = parts[0];

    if (firstSegment === 'photographer') {
      // tab/home/photographer/:id
      screenName = 'PhotographerDetails';
      screenParams = { photographerId: parts[1] };
    } else if (firstSegment === 'portfolio') {
      // tab/home/portfolio/:postId?profileImageURI=...
      screenName = 'PostDetail';
      screenParams = {
        postId: Number(parts[1]),
        profileImageURI: params.profileImageURI || params.utm_content || '', // utm_content 폴백 추가
      };
    } else if (firstSegment === 'review') {
      // tab/home/review/:id
      screenName = 'ReviewDetails';
      screenParams = { reviewId: Number(parts[1]) };
    } else if (firstSegment === 'ai-recommendation') {
      // tab/home/ai-recommendation
      screenName = 'AIRecommdationForm';
    }
  } else if (tab === 'community') {
    // tab/community/post/:id
    const firstSegment = remainingPath.split('/')[0];
    const idPart = remainingPath.split('/')[1];

    if (firstSegment === 'post') {
      screenName = 'CommunityDetails';
      screenParams = { postId: Number(idPart) };
    }
  } else if (tab === 'profile') {
    // tab/profile/bookings/photographer, tab/profile/booking/:id, tab/profile/notice/:id
    if (remainingPath === 'bookings/photographer') {
      screenName = 'BookingManage';
    } else if (remainingPath === 'bookings/user') {
      screenName = 'BookingHistory';
    } else if (remainingPath.startsWith('booking/')) {
      const parts = remainingPath.split('/');
      const bookingId = Number(parts[1]);

      if (remainingPath.includes('/photos')) {
        screenName = 'ViewPhotos';
        screenParams = { bookingId };
      } else if (remainingPath.includes('/writeReview')) {
        screenName = 'WriteReview';
        screenParams = { bookingId };
      } else {
        screenName = 'BookingDetails';
        screenParams = { bookingId };
      }
    } else if (remainingPath.startsWith('notice/')) {
      const noticeId = Number(remainingPath.split('/')[1]);
      screenName = 'NoticeDetails';
      screenParams = { noticeId };
    }
  }

  if (screenName) {
    console.log('🎯 Navigating to:', screenName, 'with params:', screenParams);

    // deep_link_landing_resolved: 성공
    safeLogEvent('deep_link_landing_resolved', {
      original_link_type: parsed.linkType,
      original_target_id: parsed.targetId,
      resolved_screen: screenName,
      resolved_target_id: screenParams.photographerId ?? screenParams.postId ?? screenParams.bookingId ?? screenParams.roomId ?? screenParams.reviewId ?? screenParams.noticeId ?? '',
      resolve_success: true,
      fail_reason: '',
    });

    // Reset navigation stack with Home first, then target screen
    // This ensures goBack() works properly from the target screen
    let routes: any[] = [{ name: 'Home', params: { tab } }];
    let stackIndex = 1;

    // For PostDetail, add PhotographerDetails in between
    if (screenName === 'PostDetail' && screenParams.photographerId) {
      routes.push({ name: 'PhotographerDetails', params: { photographerId: screenParams.photographerId } });
      routes.push({ name: screenName, params: screenParams });
      stackIndex = 2;
    } else {
      routes.push({ name: screenName, params: screenParams });
      stackIndex = 1;
    }

    (navigationRef as any).reset({
      index: 0,
      routes: [
        {
          name: 'Main',
          state: {
            index: stackIndex,
            routes,
          },
        },
      ],
    });
  } else {
    console.warn('❌ Unknown route:', tab, remainingPath);
    // deep_link_landing_resolved: 실패 (알 수 없는 라우트)
    safeLogEvent('deep_link_landing_resolved', {
      original_link_type: parsed.linkType,
      original_target_id: parsed.targetId,
      resolved_screen: '',
      resolved_target_id: '',
      resolve_success: false,
      fail_reason: 'not_found',
      user_id: options?.userId ?? 'anonymous',
      user_type: options?.userType ?? 'guest',
    });
  }
};

/**
 * 앱 최초 설치 후 실행 시 link-hub에서 deferred deep link를 조회한다.
 * go.snaplink.run/l/{code} 방문 시 서버에 기록된 핑거프린트와 매칭하여
 * 설치 전에 클릭한 링크의 목적지로 자동 이동시킨다.
 */
const checkDeferredDeepLink = async (options?: { userId?: string; userType?: string }) => {
  try {
    const linkHubUrl = getLinkHubUrl();
    const res = await fetch(`${linkHubUrl}/api/deferred`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) return;

    const data = await res.json();
    if (data.found && data.deepLinkUrl) {
      console.log('🔗 Deferred deep link found:', data.deepLinkUrl);
      navigateByDeepLink(data.deepLinkUrl, {
        ...options,
        isFirstInstall: true,
      });
    }
  } catch (error) {
    // deferred deep link 실패는 무시 (앱 정상 동작에 영향 없음)
    console.warn('⚠️ Deferred deep link check failed:', error);
  }
};

const getActiveRouteName = (route: Route<string, object | undefined>): string => {
  const state = (route as any)?.state as NavigationState | undefined;

  if (!state || !state.routes || state.routes.length === 0) return route.name;

  const nestedRoute = state.routes[state.index ?? 0];
  return getActiveRouteName(nestedRoute as Route<string, object | undefined>);
};

export default function AppNavigator() {
  const routeNameRef = useRef<string | undefined>(undefined);
  const sessionStartTime = useRef<number | null>(null);
  const appState = useRef(AppState.currentState)

  const { status, userId, userType } = useAuthStore();

  // 인증 완료 시 보류 중인 딥링크 처리
  useEffect(() => {
    if (status === 'authed' && pendingDeepLink) {
      const { url, isFirstInstall } = pendingDeepLink;
      pendingDeepLink = null;
      navigateByDeepLink(url, { userId, userType, isFirstInstall });
    }
  }, [status, userId, userType]);

    // 앱 콜드 스타트 시 딥링크 처리 (최초 1회만 실행)
  useEffect(() => {
    const handleInitialURL = async () => {
      try {
        // 이전 유입 tracking_code 복원 (전환 추적용)
        await loadAttributionTrackingCode();

        const isFirstInstall = await checkAndMarkFirstInstall();
        const initialUrl = await Linking.getInitialURL();
        console.log('🚀 Initial URL from Linking:', initialUrl);

        if (initialUrl) {
          navigateByDeepLink(initialUrl, { userId, userType, isFirstInstall });
          return;
        }

        if (isFirstInstall) {
          // 최초 설치 시 deferred deep link 조회 (first_open은 Firebase가 자동 수집)
          if (Platform.OS === 'android') {
            // Android: Install Referrer API로 link_code 직접 복원 (정확도 ~99%)
            const result = await resolveAndroidInstallReferrer();
            if (result) {
              console.log('📦 Android referrer deep link resolved:', result.deepLinkUrl);
              navigateByDeepLink(result.deepLinkUrl, { userId, userType, isFirstInstall: true });
            } else {
              // Referrer 없으면 fingerprint 폴백
              checkDeferredDeepLink({ userId, userType });
            }
          } else {
            // iOS: fingerprint 매칭
            checkDeferredDeepLink({ userId, userType });
          }
        }
      } catch (error) {
        console.error('❌ Error getting initial URL:', error);
      }
    };

    handleInitialURL();
  }, [userId, userType]);

  // 앱이 이미 실행 중일 때 딥링크 수신
  useEffect(() => {
    console.log('🎧 Setting up deep link listener...');

    const handleUrl = ({ url }: { url: string }) => {
      console.log('📱 Deep link received (app already open):', url);
      navigateByDeepLink(url, { userId, userType, isFirstInstall: false });
    };

    const subscription = Linking.addEventListener('url', handleUrl);

    console.log('✅ Deep link listener registered');

    return () => {
      console.log('🛑 Removing deep link listener');
      subscription.remove();
    };
  }, [userId, userType]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async nextState => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        // 포그라운드 복귀 (session_start는 Firebase가 자동 수집)
        sessionStartTime.current = Date.now();
        resetImpressionCache(); // 세션 전환 시 impression dedupe 캐시 초기화
        await analytics().logEvent('app_foreground');
      }

      if (appState.current === 'active' && nextState.match(/inactive|background/)) {
        // 백그라운드 전환
        const duration = sessionStartTime.current ? (Date.now() - sessionStartTime.current) / 1000 : 0;
        await analytics().logEvent('app_background', { duration_seconds: duration });
        sessionStartTime.current = null;
      }

      appState.current = nextState;
    });

    return () => subscription.remove();
  }, []);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        const route = navigationRef.getCurrentRoute();
        routeNameRef.current = route ? getActiveRouteName(route) : undefined;

        // Crashlytics 로그 (app_open은 Firebase가 자동 수집)
        crashlytics().log('App opened');
      }}
      onStateChange={async () => {
        const route = navigationRef.getCurrentRoute();
        const currentRouteName = route ? getActiveRouteName(route) : undefined;

        if (currentRouteName && currentRouteName !== routeNameRef.current) {
          // Crashlytics 현재 화면 attribute 갱신
          setCrashlyticsContext({ screen: currentRouteName });

          // 화면 진입 이벤트 (GA4 표준 screen_view)
          await analytics().logScreenView({
            screenName: currentRouteName,
            screenClass: currentRouteName,
          });

          routeNameRef.current = currentRouteName;
        }
      }}
    >
      <RootNavigator />
    </NavigationContainer>
  )
}
