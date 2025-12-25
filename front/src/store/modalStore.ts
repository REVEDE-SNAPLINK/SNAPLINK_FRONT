import { create } from 'zustand';
import { CommunityPost, CreateCommunityPostParams } from '@/api/community.ts';

interface CommunityPostModalState {
  visible: boolean;
  initialPost?: CommunityPost;
  onSubmit?: (params: CreateCommunityPostParams) => void;
}

interface ModalStore {
  communityPostModal: CommunityPostModalState;
  openCommunityPostModal: (
    onSubmit: (params: CreateCommunityPostParams) => void,
    initialPost?: CommunityPost
  ) => void;
  closeCommunityPostModal: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  communityPostModal: {
    visible: false,
    initialPost: undefined,
    onSubmit: undefined,
  },
  openCommunityPostModal: (onSubmit, initialPost) =>
    set({
      communityPostModal: {
        visible: true,
        onSubmit,
        initialPost,
      },
    }),
  closeCommunityPostModal: () =>
    set({
      communityPostModal: {
        visible: false,
        initialPost: undefined,
        onSubmit: undefined,
      },
    }),
}));
