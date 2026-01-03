import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import RootNavigator from '@/navigation/RootNavigator.tsx';

export const navigationRef = createNavigationContainerRef();

const linking = {
  prefixes: [
    'snaplink://',
    'https://link.snaplink.run',
  ],
  config: {
    screens: {
      Main: {
        screens: {
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
          }
        },
      },
    },
  },
};

export default function AppNavigator() {
  return (
    <NavigationContainer linking={linking} ref={navigationRef}>
      <RootNavigator />
    </NavigationContainer>
  )
}