import { useState, useRef } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { TextInput } from 'react-native';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';
import CommunityDetailsView, { ShareLink } from '@/screens/common/CommunityDetails/CommunityDetailsView.tsx';
import { CreateCommunityPostParams } from '@/api/community.ts';
import { useAuthStore } from '@/store/authStore.ts';
import { useModalStore } from '@/store/modalStore.ts';
import { useCommunityPostQuery, useCommunityCommentsQuery } from '@/queries/community.ts';
import {
  useToggleLikeMutation,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} from '@/mutations/community.ts';

type CommunityDetailsRouteProp = RouteProp<MainStackParamList, 'CommunityDetails'>;

const shareLinks: ShareLink[] = [
  {
    name: '카카오톡 오픈 채팅',
    url: 'https://pf.kakao.com/_KasSn/chat'
  }
]

export default function CommunityDetailsContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<CommunityDetailsRouteProp>();
  const { userId } = useAuthStore();
  const { openCommunityPostModal, closeCommunityPostModal } = useModalStore();

  const { postId } = route.params;

  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [replyTo, setReplyTo] = useState<{ parentId: number; nickname: string } | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  const commentInputRef = useRef<TextInput | null>(null);

  // Fetch post details
  const { data: post } = useCommunityPostQuery(postId);

  // Fetch comments
  const { data: commentsData } = useCommunityCommentsQuery(postId);
  const comments = commentsData?.content || [];

  // Mutations
  const toggleLikeMutation = useToggleLikeMutation();
  const createCommentMutation = useCreateCommentMutation(postId);
  const updateCommentMutation = useUpdateCommentMutation();
  const deleteCommentMutation = useDeleteCommentMutation();
  const updatePostMutation = useUpdatePostMutation();
  const deletePostMutation = useDeletePostMutation();

  const handlePressBack = () => {
    navigation.goBack();
  };

  const handlePressShare = () => {
    setIsShareModalVisible(true);
  };

  const handlePressLike = () => {
    toggleLikeMutation.mutate(postId);
  };

  const handlePressChat = () => {
    setIsCommentModalVisible(true);
  };

  const handlePressMoreComments = () => {
    setIsCommentModalVisible(true);
  };

  const handlePressWriteComment = () => {
    setIsCommentModalVisible(true);
    // Auto focus input after modal opens
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 300);
  };

  const handleCloseCommentModal = () => {
    setIsCommentModalVisible(false);
    setCommentInput('');
    setReplyTo(null);
    setEditingCommentId(null);
  };

  const handleSubmitComment = () => {
    if (commentInput.trim().length === 0) return;

    // If editing, update comment
    if (editingCommentId) {
      updateCommentMutation.mutate(
        {
          commentId: editingCommentId,
          content: commentInput.trim(),
        },
        {
          onSuccess: () => {
            setCommentInput('');
            setEditingCommentId(null);
            commentInputRef.current?.blur();
          },
        }
      );
    } else {
      // Create new comment or reply
      createCommentMutation.mutate(
        {
          content: commentInput.trim(),
          parentId: replyTo ? replyTo.parentId : 0, // 0 for top-level comments
        },
        {
          onSuccess: () => {
            setCommentInput('');
            setReplyTo(null);
          },
        }
      );
    }
  };

  const handlePressMore = () => {
    setIsEditModalVisible(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalVisible(false);
  };

  const handleCloseShareModal = () => {
    setIsShareModalVisible(false);
  };

  const handleUpdatePost = (params: CreateCommunityPostParams & { deletePhotoIds?: string[] }) => {
    if (!post) return;

    updatePostMutation.mutate(
      {
        postId: post.id,
        request: {
          category: params.category,
          title: params.title,
          content: params.content,
          deletePhotoIds: params.deletePhotoIds || [],
        },
        images: params.images,
      },
      {
        onSuccess: () => {
          closeCommunityPostModal();
        },
        onError: (error: Error) => {
          console.error('Failed to update post:', error);
        },
      }
    );
  };

  const handlePressEdit = () => {
    setIsEditModalVisible(false);
    if (post) {
      openCommunityPostModal(handleUpdatePost, post);
    }
  };

  const handlePressDelete = () => {
    setIsEditModalVisible(false);
    deletePostMutation.mutate(postId, {
      onSuccess: () => {
        navigation.goBack();
      },
    });
  };

  const handlePressReply = (commentId: number, nickname: string) => {
    setReplyTo({ parentId: commentId, nickname });
    setCommentInput(`@${nickname} `);
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 100);
  };

  const handlePressEditComment = (commentId: number, content: string) => {
    setEditingCommentId(commentId.toString());
    setCommentInput(content);
    setReplyTo(null);
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 100);
  };

  const handlePressDeleteComment = (commentId: number) => {
    deleteCommentMutation.mutate(commentId.toString(), {
      onSuccess: () => {
        // Comment deleted successfully
      },
    });
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setCommentInput('');
    setReplyTo(null);
    commentInputRef.current?.blur();
  };

  const isMyPost = post?.author.userId === userId;

  return (
    <CommunityDetailsView
      post={post}
      comments={comments}
      isMyPost={isMyPost}
      userId={userId}
      isCommentModalVisible={isCommentModalVisible}
      isEditModalVisible={isEditModalVisible}
      isShareModalVisible={isShareModalVisible}
      commentInput={commentInput}
      commentInputRef={commentInputRef}
      replyTo={replyTo}
      editingCommentId={editingCommentId}
      onChangeCommentInput={setCommentInput}
      shareLinks={shareLinks}
      onPressBack={handlePressBack}
      onPressShare={handlePressShare}
      onPressLike={handlePressLike}
      onPressChat={handlePressChat}
      onPressMoreComments={handlePressMoreComments}
      onPressWriteComment={handlePressWriteComment}
      onCloseCommentModal={handleCloseCommentModal}
      onCloseShreModal={handleCloseShareModal}
      onCloseEditModal={handleCloseEditModal}
      onSubmitComment={handleSubmitComment}
      onPressMore={handlePressMore}
      onPressEdit={handlePressEdit}
      onPressDelete={handlePressDelete}
      onPressReply={handlePressReply}
      onPressEditComment={handlePressEditComment}
      onPressDeleteComment={handlePressDeleteComment}
      onCancelEdit={handleCancelEdit}
    />
  );
}