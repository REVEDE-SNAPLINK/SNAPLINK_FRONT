import { create } from 'zustand';
import { CommunityPost, CreateCommunityPostParams } from '@/api/community.ts';

export interface PersonalSchedule {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  isAllDay: boolean;
  description?: string;
}

interface CommunityPostModalState {
  visible: boolean;
  initialPost?: CommunityPost;
  onSubmit?: (params: CreateCommunityPostParams & { deletePhotoIds?: number[] }) => void;
  isLoading?: boolean;
}

interface AddScheduleModalState {
  visible: boolean;
  initialSchedule?: PersonalSchedule;
  onSubmit?: (schedule: Omit<PersonalSchedule, 'id'>) => void;
  isDuplicate?: boolean;
}

interface ScheduleDetailModalState {
  visible: boolean;
  schedule?: PersonalSchedule;
  onEdit?: (schedule: PersonalSchedule) => void;
  onDelete?: (scheduleId: string) => void;
  onDuplicate?: (schedule: PersonalSchedule) => void;
}

interface ModalStore {
  communityPostModal: CommunityPostModalState;
  openCommunityPostModal: (
    onSubmit: (params: CreateCommunityPostParams & { deletePhotoIds?: number[] }) => void,
    initialPost?: CommunityPost,
  ) => void;
  closeCommunityPostModal: () => void;
  setCommunityPostModalLoading: (isLoading: boolean) => void;

  addScheduleModal: AddScheduleModalState;
  openAddScheduleModal: (
    onSubmit: (schedule: Omit<PersonalSchedule, 'id'>) => void,
    initialSchedule?: PersonalSchedule,
    isDuplicate?: boolean,
  ) => void;
  closeAddScheduleModal: () => void;

  scheduleDetailModal: ScheduleDetailModalState;
  openScheduleDetailModal: (
    schedule: PersonalSchedule,
    onEdit: (schedule: PersonalSchedule) => void,
    onDelete: (scheduleId: string) => void,
    onDuplicate: (schedule: PersonalSchedule) => void,
  ) => void;
  closeScheduleDetailModal: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  communityPostModal: {
    visible: false,
    initialPost: undefined,
    onSubmit: undefined,
    isLoading: false,
  },
  openCommunityPostModal: (onSubmit, initialPost) =>
    set({
      communityPostModal: {
        visible: true,
        onSubmit,
        initialPost,
        isLoading: false,
      },
    }),
  closeCommunityPostModal: () =>
    set({
      communityPostModal: {
        visible: false,
        initialPost: undefined,
        onSubmit: undefined,
        isLoading: false,
      },
    }),
  setCommunityPostModalLoading: (isLoading) =>
    set((state) => ({
      communityPostModal: {
        ...state.communityPostModal,
        isLoading,
      },
    })),

  addScheduleModal: {
    visible: false,
    initialSchedule: undefined,
    onSubmit: undefined,
    isDuplicate: false,
  },
  openAddScheduleModal: (onSubmit, initialSchedule, isDuplicate = false) =>
    set({
      addScheduleModal: {
        visible: true,
        onSubmit,
        initialSchedule,
        isDuplicate,
      },
    }),
  closeAddScheduleModal: () =>
    set({
      addScheduleModal: {
        visible: false,
        initialSchedule: undefined,
        onSubmit: undefined,
        isDuplicate: false,
      },
    }),

  scheduleDetailModal: {
    visible: false,
    schedule: undefined,
    onEdit: undefined,
    onDelete: undefined,
    onDuplicate: undefined,
  },
  openScheduleDetailModal: (schedule, onEdit, onDelete, onDuplicate) =>
    set({
      scheduleDetailModal: {
        visible: true,
        schedule,
        onEdit,
        onDelete,
        onDuplicate,
      },
    }),
  closeScheduleDetailModal: () =>
    set({
      scheduleDetailModal: {
        visible: false,
        schedule: undefined,
        onEdit: undefined,
        onDelete: undefined,
        onDuplicate: undefined,
      },
    }),
}));
