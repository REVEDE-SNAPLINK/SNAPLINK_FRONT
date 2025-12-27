import { create } from 'zustand';
import { CommunityPost, CreateCommunityPostParams } from '@/api/community.ts';

interface CommunityPostModalState {
  visible: boolean;
  initialPost?: CommunityPost;
  onSubmit?: (params: CreateCommunityPostParams) => void;
  isLoading?: boolean;
}

interface ModalStore {
  communityPostModal: CommunityPostModalState;
  openCommunityPostModal: (
    onSubmit: (params: CreateCommunityPostParams) => void,
    initialPost?: CommunityPost,
  ) => void;
  closeCommunityPostModal: () => void;
  setCommunityPostModalLoading: (isLoading: boolean) => void;
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
}));
