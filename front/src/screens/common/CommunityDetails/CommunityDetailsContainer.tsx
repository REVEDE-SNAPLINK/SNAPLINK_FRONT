import { useState, useRef, useEffect } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Share, TextInput, InteractionManager } from 'react-native';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';
import CommunityDetailsView from '@/screens/common/CommunityDetails/CommunityDetailsView.tsx';
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
import { Alert } from '@/components/theme';

type CommunityDetailsRouteProp = RouteProp<MainStackParamList, 'CommunityDetails'>;

export default function CommunityDetailsContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<CommunityDetailsRouteProp>();
  const { userId } = useAuthStore();
  const { openCommunityPostModal, closeCommunityPostModal, setCommunityPostModalLoading } = useModalStore();

  const { postId } = route.params;

  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  // const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [shouldFocusCommentInput, setShouldFocusCommentInput] = useState(false);
  const [replyTo, setReplyTo] = useState<{ parentId: number; nickname: string } | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);

  const commentInputRef = useRef<TextInput | null>(null);

  // Safe focus utility for comment input (iOS release modal animation/layout fix)
  const focusCommentInputSafely = () => {
    // iOS Release(Build)에서 모달 애니메이션/레이아웃 중 focus 호출 시 크래시/이상 동작이 발생할 수 있어
    // InteractionManager + rAF로 화면 안정화 이후 포커스를 준다.
    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        commentInputRef.current?.focus();
      });
    });
  };

  useEffect(() => {
    if (!isCommentModalVisible) return;
    if (!shouldFocusCommentInput) return;

    focusCommentInputSafely();
    setShouldFocusCommentInput(false);
  }, [isCommentModalVisible, shouldFocusCommentInput]);

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
  const { mutate: updatePostMutation, isPending: isUpdatePostPending } = useUpdatePostMutation();
  const deletePostMutation = useDeletePostMutation();

  // Update modal loading state
  useEffect(() => {
    setCommunityPostModalLoading(isUpdatePostPending);
  }, [isUpdatePostPending, setCommunityPostModalLoading]);

  const handlePressBack = () => {
    navigation.goBack();
  };

  const handlePressShare = () => {
    // setIsShareModalVisible(true);
    if (post) {
      Share.share({
        message: `${post.title}\nhttps://link.snaplink.run/post/${post.id}`,
      });
    }
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
    setShouldFocusCommentInput(true);
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
      // Remove @nickname mention from content if replying
      let content = commentInput.trim();
      if (replyTo) {
        const mentionText = `@${replyTo.nickname} `;
        if (content.startsWith(mentionText)) {
          content = content.substring(mentionText.length).trim();
        }
      }

      // Create new comment or reply
      createCommentMutation.mutate(
        {
          content,
          parentId: replyTo !== null ? replyTo.parentId : null, // 0 for top-level comments
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

  const handleUpdatePost = (params: CreateCommunityPostParams & { deletePhotoIds?: number[] }) => {
    if (!post) return;

    updatePostMutation(
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
          Alert.show({
            title: '완료',
            message: '게시글이 수정되었습니다.',
            buttons: [
              {
                text: '확인',
                onPress: () => {
                  closeCommunityPostModal();
                },
              },
            ],
          });
        },
        onError: (error: Error) => {
          console.error('Failed to update post:', error);
          Alert.show({
            title: '오류',
            message: '게시글 수정에 실패했습니다.',
            buttons: [{ text: '확인', onPress: () => {} }],
          });
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
    Alert.show({
      title: '삭제하시겠습니까?',
      message: '삭제 하시면 다시 복구할 수 없습니다.',
      buttons: [
        { text: '취소', onPress: () => { }, type: 'cancel' },
        { text: '삭제', onPress: () => {
            deletePostMutation.mutate(postId, {
              onSuccess: () => {
                Alert.show({
                  title: '삭제 완료',
                  message: '삭제되었습니다.',
                  buttons: [
                    { text: '완료', onPress: () => navigation.goBack()},
                  ]
                })
              },
            });
          } },
      ]
    })
  };

  const handlePressReply = (commentId: number, nickname: string) => {
    console.log(commentId, nickname);
    setReplyTo({ parentId: commentId, nickname });
    setCommentInput(`@${nickname} `);
    setShouldFocusCommentInput(true);
  };

  const handlePressEditComment = (commentId: number, content: string) => {
    setEditingCommentId(commentId);
    setCommentInput(content);
    setReplyTo(null);
    setShouldFocusCommentInput(true);
  };

  const handlePressDeleteComment = (commentId: number) => {
    deleteCommentMutation.mutate(commentId, {
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
      commentInput={commentInput}
      commentInputRef={commentInputRef}
      replyTo={replyTo}
      editingCommentId={editingCommentId}
      onChangeCommentInput={setCommentInput}
      onPressBack={handlePressBack}
      onPressShare={handlePressShare}
      onPressLike={handlePressLike}
      onPressChat={handlePressChat}
      onPressMoreComments={handlePressMoreComments}
      onPressWriteComment={handlePressWriteComment}
      onCloseCommentModal={handleCloseCommentModal}
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