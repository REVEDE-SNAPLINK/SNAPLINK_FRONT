import { create } from 'zustand';
import { CommunityPost, CreateCommunityPostParams } from '@/api/community.ts';
import { REASON, TargetType } from '@/api/reports.ts';
import { UserType } from '@/types/auth.ts';

export type ScheduleType = 'personal' | 'holiday';

export interface PersonalSchedule {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  isAllDay: boolean;
  description?: string;
  scheduleType?: ScheduleType; // 'personal' or 'holiday'
  holidayId?: number; // For holiday type
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
  initialStartDate?: Date;
}

interface ScheduleDetailModalState {
  visible: boolean;
  schedule?: PersonalSchedule;
  onEdit?: (schedule: PersonalSchedule) => void;
  onDelete?: (scheduleId: string) => void;
  onDuplicate?: (schedule: PersonalSchedule) => void;
}

export interface ReportModalParams {
  reason: REASON;
  description: string;
}

interface ReportModalState {
  visible: boolean;
  targetId?: string;
  targetType?: TargetType;
  targetUserType?: UserType;
  initialReason?: REASON;
  onSubmit?: (params: ReportModalParams) => void;
  isLoading?: boolean;
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
    initialStartDate?: Date,
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

  reportModal: ReportModalState;
  openReportModal: (
    targetId: string,
    targetType: TargetType,
    targetUserType: UserType,
    onSubmit: (params: ReportModalParams) => void,
    initialReason?: REASON,
  ) => void;
  closeReportModal: () => void;
  setReportModalLoading: (isLoading: boolean) => void;
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
    initialStartDate: undefined,
  },
  openAddScheduleModal: (onSubmit, initialSchedule, isDuplicate = false, initialStartDate) =>
    set({
      addScheduleModal: {
        visible: true,
        onSubmit,
        initialSchedule,
        isDuplicate,
        initialStartDate,
      },
    }),
  closeAddScheduleModal: () =>
    set({
      addScheduleModal: {
        visible: false,
        initialSchedule: undefined,
        onSubmit: undefined,
        isDuplicate: false,
        initialStartDate: undefined,
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

  reportModal: {
    visible: false,
    targetId: undefined,
    targetType: undefined,
    targetUserType: undefined,
    initialReason: undefined,
    onSubmit: undefined,
    isLoading: false,
  },
  openReportModal: (targetId, targetType, targetUserType, onSubmit, initialReason) =>
    set({
      reportModal: {
        visible: true,
        targetId,
        targetType,
        targetUserType,
        initialReason,
        onSubmit,
        isLoading: false,
      },
    }),
  closeReportModal: () =>
    set({
      reportModal: {
        visible: false,
        targetId: undefined,
        targetType: undefined,
        targetUserType: undefined,
        initialReason: undefined,
        onSubmit: undefined,
        isLoading: false,
      },
    }),
  setReportModalLoading: (isLoading) =>
    set((state) => ({
      reportModal: {
        ...state.reportModal,
        isLoading,
      },
    })),
}));
