import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@/store/authStore.ts';
import { useModalStore, PersonalSchedule } from '@/store/modalStore.ts';
import MainStack from '@/navigation/stacks/MainStack.tsx';
import AuthStack from '@/navigation/stacks/AuthStack.tsx';
import { RootStackParamList } from '@/types/navigation';
import CommunityPostModal from '@/components/common/CommunityPostModal';
import AddScheduleModal from '@/screens/photographer/BookingCalendar/AddScheduleModal';
import ScheduleDetailModal from '@/screens/photographer/BookingCalendar/ScheduleDetailModal';
import { CreateCommunityPostParams } from '@/api/community.ts';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { status } = useAuthStore();
  const {
    communityPostModal,
    closeCommunityPostModal,
    addScheduleModal,
    closeAddScheduleModal,
    scheduleDetailModal,
    closeScheduleDetailModal,
  } = useModalStore();

  const handleCloseCommunityPostModal = () => {
    closeCommunityPostModal();
  };

  const handleSubmitCommunityPost = (params: CreateCommunityPostParams) => {
    communityPostModal.onSubmit?.(params);
  };

  const handleCloseAddScheduleModal = () => {
    closeAddScheduleModal();
  };

  const handleSubmitAddSchedule = (schedule: Omit<PersonalSchedule, 'id'>) => {
    addScheduleModal.onSubmit?.(schedule);
  };

  const handleCloseScheduleDetailModal = () => {
    closeScheduleDetailModal();
  };

  const handleEditSchedule = (schedule: PersonalSchedule) => {
    scheduleDetailModal.onEdit?.(schedule);
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    scheduleDetailModal.onDelete?.(scheduleId);
  };

  const handleDuplicateSchedule = (schedule: PersonalSchedule) => {
    scheduleDetailModal.onDuplicate?.(schedule);
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

      <AddScheduleModal
        visible={addScheduleModal.visible}
        onClose={handleCloseAddScheduleModal}
        onSubmit={handleSubmitAddSchedule}
        initialSchedule={addScheduleModal.initialSchedule}
        isDuplicate={addScheduleModal.isDuplicate}
        initialStartDate={addScheduleModal.initialStartDate}
      />

      <ScheduleDetailModal
        visible={scheduleDetailModal.visible}
        onClose={handleCloseScheduleDetailModal}
        schedule={scheduleDetailModal.schedule || null}
        onEdit={handleEditSchedule}
        onDelete={handleDeleteSchedule}
        onDuplicate={handleDuplicateSchedule}
      />
    </>
  );
}
