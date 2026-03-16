import {
  NavigationContainer,
  createNavigationContainerRef,
  Route,
  NavigationState,
} from '@react-navigation/native';
import RootNavigator from '@/navigation/RootNavigator.tsx';
import { AppState, Platform, Linking } from 'react-native';
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
} from '@/utils/analytics.ts';

export const navigationRef = createNavigationContainerRef();

const linking = {
  prefixes: [
    'snaplink://',
    'https://link.snaplink.run',
  ],
  config: {
    screens: {
      Main: {
        path: '',
        screens: {
          Home: 'tab/:tab',
          PhotographerDetails: 'tab/home/photographer/:photographerId',
          PostDetail: 'tab/home/portfolio/:postId',
          ReviewDetails: 'tab/home/review/:reviewId',
          CommunityDetails: 'tab/community/post/:postId',
          ChatDetails: 'tab/chat/:roomId',
          BookingManage: 'tab/profile/bookings/photographer',
          BookingHistory: 'tab/profile/bookings/user',
          BookingDetails: 'tab/profile/booking/:bookingId',
          ViewPhotos: 'tab/profile/booking/:bookingId/photos',
          WriteReview: 'tab/profile/booking/:bookingId/writeReview',
          NoticeDetails: 'tab/profile/notice/:noticeId',
          AIRecommdationForm: 'tab/home/ai-recommendation',
        },
      },
    },
  },
};

export const navigateByDeepLink = async (url: string, options?: { userId?: string; userType?: string; isFirstInstall?: boolean }) => {
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
    setTimeout(() => navigateByDeepLink(url), 500);
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

  const { userId, userType } = useAuthStore();

  // Handle initial deep link (when app is opened via deep link)
  useEffect(() => {
    const handleInitialURL = async () => {
      try {
        const isFirstInstall = await checkAndMarkFirstInstall();
        const initialUrl = await Linking.getInitialURL();
        console.log('🚀 Initial URL from Linking:', initialUrl);
        if (initialUrl) {
          // Wait for navigation to be ready
          setTimeout(() => {
            navigateByDeepLink(initialUrl, { userId, userType, isFirstInstall });
          }, 1000);
        } else if (isFirstInstall) {
          // 딥링크 없이 최초 설치 후 앱 오픈
          safeLogEvent('first_open', {
            user_id: userId || 'anonymous',
            user_type: userType || 'guest',
          });
        }
      } catch (error) {
        console.error('❌ Error getting initial URL:', error);
      }
    };

    handleInitialURL();
  }, [userId, userType]);

  // Handle deep links when app is already open
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
        // 세션 시작
        sessionStartTime.current = Date.now();
        resetImpressionCache(); // 세션 전환 시 impression dedupe 캐시 초기화
        await analytics().logEvent('session_start');
      }

      if (appState.current === 'active' && nextState.match(/inactive|background/)) {
        // 세션 종료
        const duration = sessionStartTime.current ? (Date.now() - sessionStartTime.current) / 1000 : 0;
        await analytics().logEvent('session_end', { duration_seconds: duration });
        sessionStartTime.current = null;
      }

      appState.current = nextState;
    });

    return () => subscription.remove();
  }, []);

  return (
    <NavigationContainer
      linking={linking}
      ref={navigationRef}
      onReady={() => {
        const route = navigationRef.getCurrentRoute();
        routeNameRef.current = route ? getActiveRouteName(route) : undefined;

        // 앱 첫 실행 로그
        analytics().logEvent('app_open', {
          user_id: userId || 'anonymous',
          user_type: userType || 'guest',
          platform: Platform.OS,
        });

        // Crashlytics 로그
        crashlytics().log('App opened');
      }}
      onStateChange={async () => {
        const route = navigationRef.getCurrentRoute();
        const currentRouteName = route ? getActiveRouteName(route) : undefined;

        if (currentRouteName && currentRouteName !== routeNameRef.current) {
          // Crashlytics 현재 화면 attribute 갱신
          setCrashlyticsContext({ screen: currentRouteName });

          // 화면 진입 이벤트
          await analytics().logEvent('screen_view', {
            screen_name: currentRouteName,
            platform: Platform.OS,
            user_id: userId || 'anonymous',
            user_type: userType || 'guest',
            session_start_timestamp: sessionStartTime.current,
          });

          routeNameRef.current = currentRouteName;
        }
      }}
    >
      <RootNavigator />
    </NavigationContainer>
  )
}