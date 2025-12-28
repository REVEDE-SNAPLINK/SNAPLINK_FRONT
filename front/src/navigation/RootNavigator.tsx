import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@/store/authStore.ts';
import { useModalStore } from '@/store/modalStore.ts';
import MainStack from '@/navigation/stacks/MainStack.tsx';
import AuthStack from '@/navigation/stacks/AuthStack.tsx';
import { RootStackParamList } from '@/types/navigation';
import CommunityPostModal from '@/components/common/CommunityPostModal';
import { CreateCommunityPostParams } from '@/api/community.ts';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { status } = useAuthStore();
  const { communityPostModal, closeCommunityPostModal } = useModalStore();

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
        isLoading={!!communityPostModal.isLoading}
      />
    </>
  );
}

// export default function RootNavigator() {
//   return (
//     <Stack.Navigator
//       screenOptions={{headerShown: false}}
//     >
//       <Stack.Screen name="Auth" component={AuthStack} />
//     </Stack.Navigator>
//   )
// }