import { create } from 'zustand';
import { CommunityPost, CreateCommunityPostParams } from '@/api/community.ts';
import { COMMUNITY_REASON, CommunityTargetType, REASON, TargetType } from '@/api/reports.ts';
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
  scheduleId?: number; // API에서 데이터를 가져올 ID
}

export interface ReportModalParams {
  reason: REASON | COMMUNITY_REASON;
  description: string;
}

interface ReportModalState {
  visible: boolean;
  targetId?: string | number;
  targetType?: TargetType | CommunityTargetType;
  targetUserType?: UserType | undefined;
  initialReason?: REASON | COMMUNITY_REASON;
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
  openScheduleDetailModal: (scheduleId?: number, schedule?: PersonalSchedule) => void;
  closeScheduleDetailModal: () => void;

  reportModal: ReportModalState;
  openReportModal: (
    targetId: string | number,
    targetType: TargetType | CommunityTargetType,
    onSubmit: (params: ReportModalParams) => void,
    targetUserType?: UserType,
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
    scheduleId: undefined,
  },
  openScheduleDetailModal: (scheduleId, schedule) =>
    set({
      scheduleDetailModal: {
        visible: true,
        schedule,
        scheduleId,
      },
    }),
  closeScheduleDetailModal: () =>
    set({
      scheduleDetailModal: {
        visible: false,
        schedule: undefined,
        scheduleId: undefined,
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
  openReportModal: (targetId, targetType, onSubmit, targetUserType, initialReason) =>
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
