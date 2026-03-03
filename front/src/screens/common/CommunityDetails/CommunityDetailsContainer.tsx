import { useState, useRef, useEffect } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Share, TextInput, InteractionManager, Platform } from 'react-native';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';
import CommunityDetailsView from '@/screens/common/CommunityDetails/CommunityDetailsView.tsx';
import {
  COMMUNITY_CATEGORY_ENUM,
  COMMUNITY_CATEGORY_VALUE,
  CreateCommunityPostParams,
} from '@/api/community.ts';
import { useAuthStore } from '@/store/authStore.ts';
import { useModalStore } from '@/store/modalStore.ts';
import { useCommunityPostQuery, useCommunityCommentsInfiniteQuery } from '@/queries/community.ts';
import {
  useToggleLikeMutation,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} from '@/mutations/community.ts';
import { Alert } from '@/components/ui';
import analytics from '@react-native-firebase/analytics';
import { usePhotographerProfileQuery } from '@/queries/photographers.ts';
import { useTogglePhotographerScrapMutation } from '@/mutations/photographer.ts';
import { useSearchUsersInfiniteQuery } from '@/queries/user.ts';
import { COMMUNITY_REASON, reportCommunityUser } from '@/api/reports.ts';
import { useBlockUserMutation } from '@/mutations/block.ts';
import { showErrorAlert } from '@/utils/error';

type CommunityDetailsRouteProp = RouteProp<MainStackParamList, 'CommunityDetails'>;

const mappingCategory = (label: COMMUNITY_CATEGORY_VALUE): COMMUNITY_CATEGORY_ENUM => {
  switch (label) {
    case '스냅일상': return 'DAILY';
    case '촬영꿀팁': return 'TIPS';
    case '스냅소식': return 'NEWS'
  }
}

export default function CommunityDetailsContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<CommunityDetailsRouteProp>();
  const { userId, userType } = useAuthStore();
  const { openCommunityPostModal, closeCommunityPostModal, setCommunityPostModalLoading, openReportModal, setReportModalLoading, closeReportModal } = useModalStore();

  const { postId } = route.params;

  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isTagModalVisible, setIsTagModalVisible] = useState(false);
  const [isSearchingPhotographerModalVisible, setIsSearchingPhotographerModalVisible] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [shouldFocusCommentInput, setShouldFocusCommentInput] = useState(false);
  const [replyTo, setReplyTo] = useState<{ parentId: number; nickname: string } | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [searchPhotographerKey, setSearchPhotographerKey] = useState<string>('');
  const [debouncedSearchKey, setDebouncedSearchKey] = useState<string>('');

  const commentInputRef = useRef<TextInput | null>(null);

  // Debounce searchPhotographerKey
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchKey(searchPhotographerKey);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchPhotographerKey]);

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
  const { data: post, isLoading: isLoadingPost, isError: isErrorPost } = useCommunityPostQuery(postId);

  // Fetch comments (infinite query for pagination)
  const {
    data: commentsData,
    isLoading: isLoadingComments,
    fetchNextPage: fetchNextComments,
    hasNextPage: hasNextComments,
    isFetchingNextPage: isFetchingNextComments,
  } = useCommunityCommentsInfiniteQuery(postId, { size: 20 });

  // Flatten pages into single array
  const comments = commentsData?.pages.flatMap(page => page.content) || [];

  const { data: taggedPhotographer } = usePhotographerProfileQuery(post?.taggedUsers?.[0]?.userId ?? '');

  // Search users (photographers only)
  const {
    data: searchUsersData,
    fetchNextPage: fetchNextSearchUsers,
    hasNextPage: hasNextSearchUsers,
    isFetchingNextPage: isFetchingNextSearchUsers,
  } = useSearchUsersInfiniteQuery(debouncedSearchKey, { size: 20 });

  // Filter to get photographers only (exclude self)
  const searchedPhotographers = searchUsersData?.pages
    .flatMap(page => page.content)
    .filter(user => user.role === 'PHOTOGRAPHER' && user.userId !== userId) || [];

  // Mutations
  const toggleLikeMutation = useToggleLikeMutation();
  const createCommentMutation = useCreateCommentMutation(postId);
  const updateCommentMutation = useUpdateCommentMutation();
  const deleteCommentMutation = useDeleteCommentMutation();
  const { mutate: updatePostMutation, isPending: isUpdatePostPending } = useUpdatePostMutation();
  const deletePostMutation = useDeletePostMutation();
  const scrapPhotographerMutation = useTogglePhotographerScrapMutation();
  const blockUserMutation = useBlockUserMutation();

  useEffect(() => {
    if (!post) return;
    analytics().logEvent('community_post_view', {
      post_id: post.id,
      author_id: post.author.userId,
      category: post.categoryLabel,
      platform: Platform.OS,
      user_id: userId || 'anonymous',
      user_type: userType || 'guest',
    });
  }, [post, userId, userType]);

  // Update modal loading state
  useEffect(() => {
    setCommunityPostModalLoading(isUpdatePostPending);
  }, [isUpdatePostPending, setCommunityPostModalLoading]);

  const handlePressBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    }
  };

  const handlePressShare = () => {
    // setIsShareModalVisible(true);
    if (post) {
      Share.share({
        message: `${post.content.substring(0, 10) + "..."}\nhttps://link.snaplink.run/tab/community/post/${post.id}`,
      });
      // Firebase Analytics: 공유 이벤트
      analytics().logEvent('community_post_share', {
        post_id: post.id,
        user_id: userId || 'anonymous',
        user_type: userType || 'guest',
        platform: Platform.OS,
      });
    }
  };

  const handlePressLike = () => {
    toggleLikeMutation.mutate(postId, {
      onSuccess: () => {
        // Firebase Analytics: 좋아요 이벤트
        analytics().logEvent('community_post_like', {
          post_id: postId,
          user_id: userId || 'anonymous',
          user_type: userType || 'guest',
          platform: Platform.OS,
          liked: !(post?.isLiked), // liked 상태가 토글되므로 이전 상태의 반대
        });
      },
    });
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
            // Firebase Analytics: 댓글 수정 이벤트
            analytics().logEvent('community_comment_edit', {
              post_id: postId,
              user_id: userId || 'anonymous',
              user_type: userType || 'guest',
              platform: Platform.OS,
              comment_id: editingCommentId,
            });
          },
        }
      );
    } else {
      // Remove @nickname mention from content if replying
      let content = commentInput.trim();
      let isReply = false;
      let parentCommentId = null;
      if (replyTo) {
        const mentionText = `@${replyTo.nickname} `;
        if (content.startsWith(mentionText)) {
          content = content.substring(mentionText.length).trim();
        }
        isReply = true;
        parentCommentId = replyTo.parentId;
      }

      // Create new comment or reply
      createCommentMutation.mutate(
        {
          content,
          parentId: replyTo !== null ? replyTo.parentId : null, // 0 for top-level comments
        },
        {
          onSuccess: (data: any) => {
            setCommentInput('');
            setReplyTo(null);
            // Firebase Analytics: 댓글 작성 이벤트
            analytics().logEvent('community_comment_create', {
              post_id: postId,
              user_id: userId || 'anonymous',
              user_type: userType || 'guest',
              platform: Platform.OS,
              comment_id: data?.id,
              is_reply: isReply,
              parent_comment_id: parentCommentId,
            });
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
          content: params.content,
          deletePhotoIds: params.deletePhotoIds || [],
          taggedUserIds: params.taggedUserIds || [],
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
          showErrorAlert({
            title: '수정 실패',
            action: '게시글 수정',
            error,
          });
        },
      }
    );
  };

  const handlePressEdit = () => {
    setIsEditModalVisible(false);
    if (post) {
      // Firebase Analytics: 게시글 수정 이벤트
      analytics().logEvent('community_post_edit', {
        post_id: post.id,
        user_id: userId || 'anonymous',
        user_type: userType || 'guest',
        platform: Platform.OS,
      });
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
        {
          text: '삭제', onPress: () => {
            // Firebase Analytics: 게시글 삭제 이벤트
            analytics().logEvent('community_post_delete', {
              post_id: postId,
              user_id: userId || 'anonymous',
              user_type: userType || 'guest',
              platform: Platform.OS,
            });
            deletePostMutation.mutate(postId, {
              onSuccess: () => {
                Alert.show({
                  title: '삭제 완료',
                  message: '삭제되었습니다.',
                  buttons: [
                    { text: '완료', onPress: () => navigation.goBack() },
                  ]
                })
              },
            });
          }
        },
      ]
    })
  };

  const handlePressReply = (commentId: number, nickname: string) => {
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
        // Firebase Analytics: 댓글 삭제 이벤트
        analytics().logEvent('community_comment_delete', {
          post_id: postId,
          user_id: userId || 'anonymous',
          user_type: userType || 'guest',
          platform: Platform.OS,
          comment_id: commentId,
        });
      },
    });
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setCommentInput('');
    setReplyTo(null);
    commentInputRef.current?.blur();
  };

  const handlePressTag = () => {
    setIsTagModalVisible(true);
  }

  const handleCloseTagModal = () => {
    setIsTagModalVisible(false);
  }

  const handlePressTaggedPhotographer = () => {
    if (post?.taggedUsers && post?.taggedUsers.length > 0 && taggedPhotographer) {
      navigation.navigate('PhotographerDetails', { photographerId: post.taggedUsers[0].userId, source: 'community_tagged' });
    }
  }

  const handleToggleTaggedPhotographerScrap = () => {
    if (post?.taggedUsers && post?.taggedUsers.length > 0 && taggedPhotographer) {
      scrapPhotographerMutation.mutate(post.taggedUsers[0].userId);
    }
  }

  const handleAddTaggedUser = () => {
    setIsSearchingPhotographerModalVisible(true);
  }

  const handleCloseSearchingPhotographerModal = () => {
    setIsSearchingPhotographerModalVisible(false);
    setSearchPhotographerKey('');
  }

  const handleChangeTaggedPhotographer = (photographerId: string) => {
    if (post !== undefined) {
      updatePostMutation(
        {
          postId: post.id,
          request: {
            category: mappingCategory(post.categoryLabel),
            content: post.content,
            deletePhotoIds: [],
            taggedUserIds: [photographerId],
          },
          images: [],
        },
        {
          onSuccess: () => {
            setIsSearchingPhotographerModalVisible(false);
            setSearchPhotographerKey('');
          }
        }
      );
    }
  }

  const handleLoadMoreSearchedPhotographers = () => {
    if (hasNextSearchUsers && !isFetchingNextSearchUsers) {
      fetchNextSearchUsers();
    }
  }

  const handlePressReportPost = () => {
    if (post) {
      openReportModal(
        post.id,
        'POST',
        async ({ reason, description }) => {
          setReportModalLoading(true);
          try {
            await reportCommunityUser({
              targetId: post.id,
              targetType: 'POST',
              reason: reason as COMMUNITY_REASON,
              detailReason: description,
            });
            setReportModalLoading(false);
            Alert.show({
              title: '소중한 의견 감사합니다',
              message: '신고는 익명으로 처리됩니다. \n앞으로 더 나은 경험을 할 수 있도록 개선하겠습니다.',
              buttons: [
                {
                  text: '확인', onPress: () => {
                    closeReportModal();
                    setIsEditModalVisible(false);
                  }
                }
              ]
            });
          } catch (error) {
            setReportModalLoading(false);
            showErrorAlert({
              title: '신고 실패',
              action: '신고 처리',
              error,
            });
          }
        }
      );
    }
  }

  const handlePressReportComment = (commentId: number) => {
    if (post) {
      openReportModal(
        commentId,
        'COMMENT',
        async ({ reason, description }) => {
          setReportModalLoading(true);
          try {
            await reportCommunityUser({
              targetId: commentId,
              targetType: 'COMMENT',
              reason: reason as COMMUNITY_REASON,
              detailReason: description,
            });
            setReportModalLoading(false);
            Alert.show({
              title: '소중한 의견 감사합니다',
              message: '신고는 익명으로 처리됩니다. \n앞으로 더 나은 경험을 할 수 있도록 개선하겠습니다.',
              buttons: [
                {
                  text: '확인', onPress: () => {
                    closeReportModal();
                    setIsEditModalVisible(false);
                  }
                }
              ]
            });
          } catch (error) {
            setReportModalLoading(false);
            showErrorAlert({
              title: '신고 실패',
              action: '신고 처리',
              error,
            });
          }
        }
      );
    }
  }

  const handlePressBlock = () => {
    if (!post) return;
    setIsEditModalVisible(false);
    Alert.show({
      title: `${post.author.nickname}님을 차단하시겠습니까?`,
      message: "차단 시 상대방의 모든 게시물이 숨겨지며, 채팅을 주고받을 수 없습니다.",
      buttons: [
        { text: '취소', onPress: () => { }, type: 'cancel' },
        {
          text: '차단',
          type: 'destructive',
          onPress: () => {
            blockUserMutation.mutate(post.author.userId, {
              onSuccess: () => {
                Alert.show({
                  title: '차단 완료',
                  message: `${post.author.nickname}님이 차단되었습니다.`,
                  buttons: [{ text: '확인', onPress: () => navigation.goBack() }],
                });
              },
              onError: (error) => {
                showErrorAlert({
                  title: '차단 실패',
                  action: '차단 처리',
                  error,
                });
              },
            });
          },
        },
      ],
    });
  }

  const handlePressAuthor = () => {
    if (!post) return;
    navigation.navigate('PhotographerDetails', { photographerId: post.author.userId, source: 'community_author' });
  }

  const isMyPost = post?.author.userId === userId;

  return (
    <CommunityDetailsView
      post={post}
      comments={comments}
      isMyPost={isMyPost}
      userId={userId}
      isLoading={isLoadingPost || isLoadingComments}
      isError={isErrorPost}
      isCommentModalVisible={isCommentModalVisible}
      isEditModalVisible={isEditModalVisible}
      isTagModalVisible={isTagModalVisible}
      isSearchingPhotographerModalVisible={isSearchingPhotographerModalVisible}
      commentInput={commentInput}
      commentInputRef={commentInputRef}
      replyTo={replyTo}
      editingCommentId={editingCommentId}
      taggedPhotographer={taggedPhotographer}
      searchPhotographerKey={searchPhotographerKey}
      searchedPhotographers={searchedPhotographers}
      setSearchPhotographerKey={setSearchPhotographerKey}
      onChangeCommentInput={setCommentInput}
      onLoadMoreSearchedPhotographers={handleLoadMoreSearchedPhotographers}
      onLoadMoreComments={() => hasNextComments && !isFetchingNextComments && fetchNextComments()}
      hasMoreComments={hasNextComments ?? false}
      isFetchingMoreComments={isFetchingNextComments}
      onPressBack={handlePressBack}
      onPressShare={handlePressShare}
      onPressLike={handlePressLike}
      onPressChat={handlePressChat}
      onPressReportPost={handlePressReportPost}
      onPressReportComment={handlePressReportComment}
      onPressBlock={handlePressBlock}
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
      onPressTag={handlePressTag}
      onCloseTagModal={handleCloseTagModal}
      onPressTaggedPhotographer={handlePressTaggedPhotographer}
      onToggleTaggedPhotographerScrap={handleToggleTaggedPhotographerScrap}
      onAddTaggedUser={handleAddTaggedUser}
      onCloseSearchingPhotographerModal={handleCloseSearchingPhotographerModal}
      onChangeTaggedPhotographer={handleChangeTaggedPhotographer}
      onPressAuthor={handlePressAuthor}
    />
  );
}