import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore.ts';
import { useModalStore } from '@/store/modalStore.ts';
import SplashScreen from 'react-native-splash-screen';
import MainStack from '@/navigation/stacks/MainStack.tsx';
import AuthStack from '@/navigation/stacks/AuthStack.tsx';
import { RootStackParamList } from '@/types/navigation';
import CommunityPostModal from '@/components/CommunityPostModal.tsx';
import { CreateCommunityPostParams } from '@/api/community.ts';

const Stack = createNativeStackNavigator<RootStackParamList>();

// 최소 스플래시 노출 시간(ms)
// const MIN_SPLASH_DELAY = __DEV__ ? 400 : 1200;
const MIN_SPLASH_DELAY = 400;

export default function RootNavigator() {
  const { status } = useAuthStore();
  const [minDelayDone, setMinDelayDone] = useState(false);
  const { communityPostModal, closeCommunityPostModal } = useModalStore();

  useEffect(() => {
    const t = setTimeout(() => setMinDelayDone(true), MIN_SPLASH_DELAY);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (minDelayDone && status !== 'idle') {
      SplashScreen.hide();
    }
  }, [minDelayDone, status]);

  const handleCloseCommunityPostModal = () => {
    closeCommunityPostModal();
  };

  const handleSubmitCommunityPost = (params: CreateCommunityPostParams) => {
    communityPostModal.onSubmit?.(params);
  };

  return (
    <>
      <Stack.Navigator
        screenOptions={{headerShown: false}}
        key={status}
      >
        {status === 'authed' ? (
          <Stack.Screen name="Main" component={MainStack} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>

      <CommunityPostModal
        visible={communityPostModal.visible}
        onClose={handleCloseCommunityPostModal}
        onSubmit={handleSubmitCommunityPost}
        initialPost={communityPostModal.initialPost}
      />
    </>
  );
}