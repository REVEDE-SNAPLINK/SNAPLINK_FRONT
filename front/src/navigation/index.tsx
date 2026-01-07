import { NavigationContainer, createNavigationContainerRef, Route, NavigationState } from '@react-navigation/native';
import RootNavigator from '@/navigation/RootNavigator.tsx';
import { AppState, Platform } from 'react-native';
import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore.ts';
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';

export const navigationRef = createNavigationContainerRef();

const linking = {
  prefixes: [
    'snaplink://',
    'https://link.snaplink.run',
  ],
  config: {
    screens: {
      Main: {
        path: 'tab/:tab',
        parse: {
          tab: (tab: string) => tab,
        },
        screens: {
          PostDetail: {
            path: 'portfolio/:postId',
            parse: {
              postId: Number,
            },
          },
          CommunityDetails: {
            path: 'post/:postId',
            parse: {
              postId: Number,
            },
          },
          PhotographerDetails: {
            path: 'photographer/:photographerId',
            parse: {
              photographerId: Number,
            },
          },
          BookingManage: {
            path: 'bookings/photographer'
          },
          BookingHistory: {
            path: 'bookings/user',
          },
          ViewPhotos: {
            path: 'booking/:bookingId/photos',
            parse: {
              bookingId: Number,
            }
          },
          WriteReview: {
            path: 'booking/:bookingId/writeReview',
            parse: {
              bookingId: Number,
            }
          },
          BookingDetails: {
            path: 'booking/:bookingId',
            parse: {
              bookingId: Number,
            }
          },
          ChatDetails: {
            path: 'chat/:roomId',
            parse: {
              roomId: Number,
            }
          },
          ReviewDetails: {
            path: 'review/:reviewId',
            parse: { reviewId: Number },
          },
          NoticeDetails: {
            path: 'notice/:noticeId',
            parse: {
              noticeId: Number,
            }
          },
          EventDetails: {
            path: 'event/:eventId',
            parse: {
              noticeId: Number,
            }
          }
        },
      },
    },
  },
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

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async nextState => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        // 세션 시작
        sessionStartTime.current = Date.now();
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