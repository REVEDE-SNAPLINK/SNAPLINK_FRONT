import { RefObject, useState, useRef, useCallback, createContext, useContext } from 'react';
import BackButton from '@/components/common/BackButton';
import styled from '@/utils/scale/CustomStyled.ts';
import {
  Dimensions,
  Platform,
  TextInput,
  ScrollView,
  Animated,
  View,
  FlatList,
} from 'react-native';
import IconButton from '@/components/IconButton.tsx';
import UploadIcon from '@/assets/icons/upload-white.svg';
import { Typography } from '@/components/theme';
import HeartIcon from '@/assets/icons/heart-black.svg';
import HeartRedIcon from '@/assets/icons/heart-red.svg';
import ChatIcon from '@/assets/icons/chat-blank-black.svg';
import MoreCircleIcon from '@/assets/icons/more-circle-white.svg';
import MoreIcon from '@/assets/icons/more.svg';
import SendIcon from '@/assets/icons/send.svg';
import { theme } from '@/theme';
import { Comment, CommunityPost, CommunityPostImage } from '@/api/community.ts';
import ServerImage from '@/components/ServerImage.tsx';
import LinearGradient from 'react-native-linear-gradient';
import ArrowLeftIcon from '@/assets/icons/arrow-left-white.svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SlideModal from '@/components/theme/SlideModal.tsx';
import { GetPhotographerProfileResponse } from '@/api/photographers.ts';
import AddTagIcon from '@/assets/icons/add-tag.svg';
import Icon from '@/components/Icon.tsx';
import SearchIcon from '@/assets/icons/search-white.svg';
import { GetSearchUserResponse } from '@/api/user.ts';
import LogoColorSmallIcon from '@/assets/icons/logo-color-icon-small.svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Portal Menu Context for z-index fix
interface MenuState {
  commentId: number;
  isMyComment: boolean;
  position: { x: number; y: number };
}

interface MenuContextType {
  showMenu: (commentId: number, isMyComment: boolean, buttonRef: View | null) => void;
  closeMenu: () => void;
  activeMenuId: number | null;
}

const MenuContext = createContext<MenuContextType | null>(null);

const useMenuContext = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenuContext must be used within MenuContext.Provider');
  }
  return context;
};

interface CommunityDetailsViewProps {
  post?: CommunityPost;
  comments: Comment[];
  isMyPost: boolean;
  userId: string;
  isLoading?: boolean;
  isError?: boolean;
  isCommentModalVisible: boolean;
  isEditModalVisible: boolean;
  isTagModalVisible: boolean;
  isSearchingPhotographerModalVisible: boolean;
  commentInput: string;
  commentInputRef: RefObject<TextInput | null>;
  replyTo: { parentId: number; nickname: string } | null;
  editingCommentId: number | null;
  taggedPhotographer?: GetPhotographerProfileResponse;
  searchPhotographerKey: string;
  searchedPhotographers: GetSearchUserResponse[];
  setSearchPhotographerKey: (searchPhotographerKey: string) => void;
  onChangeCommentInput: (text: string) => void;
  onLoadMoreSearchedPhotographers: () => void;
  onLoadMoreComments: () => void;
  hasMoreComments: boolean;
  isFetchingMoreComments: boolean;
  onPressBack: () => void;
  onPressShare: () => void;
  onPressLike: () => void;
  onPressChat: () => void;
  onPressReportPost: () => void;
  onPressReportComment: (commentId: number) => void;
  onPressBlock: () => void;
  onPressMoreComments: () => void;
  onPressWriteComment: () => void
  onCloseCommentModal: () => void;
  onSubmitComment: () => void;
  onPressMore: () => void;
  onCloseEditModal: () => void;
  onPressEdit: () => void;
  onPressDelete: () => void;
  onPressReply: (commentId: number, nickname: string) => void;
  onPressEditComment: (commentId: number, content: string) => void;
  onPressDeleteComment: (commentId: number) => void;
  onCancelEdit: () => void;
  onPressTag: () => void;
  onCloseTagModal: () => void;
  onPressTaggedPhotographer: () => void;
  onToggleTaggedPhotographerScrap: () => void;
  onAddTaggedUser: () => void;
  onCloseSearchingPhotographerModal: () => void;
  onChangeTaggedPhotographer: (photographerId: string) => void;
  onPressAuthor: () => void;
}

// Image Carousel Component
function ImageCarousel({ images }: { images: CommunityPostImage[] }) {
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  if (images.length === 0) {
    return (
      <ImageSlide>
        <PostImage />
      </ImageSlide>
    );
  }

  return (
    <>
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH}
        snapToAlignment="start"
      >
        {images.map((img, index) => (
          <ImageSlide key={index}>
            <PostImage uri={img.urls} />
          </ImageSlide>
        ))}
      </Animated.ScrollView>

      {images.length > 1 && (
        <DotContainer>
          {images.map((_, index) => (
            <AnimatedDot
              key={index}
              index={index}
              scrollX={scrollX}
            />
          ))}
        </DotContainer>
      )}
    </>
  );
}

// Animated Dot Component with scroll-based interpolation
function AnimatedDot({
  index,
  scrollX,
}: {
  index: number;
  scrollX: Animated.Value;
}) {
  // Calculate input range for smooth interpolation
  const inputRange = [
    (index - 1) * SCREEN_WIDTH,
    index * SCREEN_WIDTH,
    (index + 1) * SCREEN_WIDTH,
  ];

  // Scale: 1.5 when active, 1.2 when adjacent, 1 when far
  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [1.2, 1.5, 1.2],
    extrapolate: 'clamp',
  });

  // Opacity: 1 when active, 0.5 when not
  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.5, 1, 0.5],
    extrapolate: 'clamp',
  });

  return (
    <AnimatedDotView
      style={{
        transform: [{ scale }],
        opacity,
        backgroundColor: '#fff',
      }}
    />
  );
}

// Comment Item Component with more menu and replies
function CommentItemWithMenu({
  comment,
  replies,
  userId,
  onPressReply,
  onPressEditComment,
  onPressReportComment,
  onPressDeleteComment,
}: {
  comment: Comment;
  replies: Comment[];
  userId: string;
  onPressReply: (commentId: number, nickname: string) => void;
  onPressReportComment: (commentId: number) => void;
  onPressEditComment: (commentId: number, content: string) => void;
  onPressDeleteComment: (commentId: number) => void;
}) {
  const { showMenu, closeMenu, activeMenuId } = useMenuContext();
  const buttonRef = useRef<View>(null);
  const [showReplies, setShowReplies] = useState(false);
  const isMyComment = comment.userId === userId;
  const isReply = comment.parentId !== null;
  const isMenuActive = activeMenuId === comment.id;

  // Do not render deleted comments
  if (comment.isDeleted) return null;
  const visibleReplies = (replies || []).filter(r => !r.isDeleted);

  const handleToggleMenu = () => {
    if (isMenuActive) {
      closeMenu();
    } else {
      showMenu(comment.id, isMyComment, buttonRef.current);
    }
  };

  return (
    <CommentItem isReply={isReply}>
      <CommentContentWrapper>
        <CommentAuthorProfileImage
          uri={comment?.profileImageUrl || ''}
        />

        <CommentContent>
          <Typography
            fontSize={12}
            fontWeight="semiBold"
            lineHeight="140%"
            letterSpacing="-2.5%"
          >
            {comment.nickname}
          </Typography>
          <Typography fontSize={12} lineHeight="140%" letterSpacing="-2.5%">
            {comment.content}
          </Typography>
        </CommentContent>

        <View ref={buttonRef} collapsable={false} style={{ marginLeft: 10 }}>
          <IconButton
            width={16}
            height={16}
            Svg={MoreIcon}
            onPress={handleToggleMenu}
          />
        </View>
      </CommentContentWrapper>

      <ReplyActionsWrapper>
        {!isReply && visibleReplies.length > 0 && (
          <ViewRepliesButton onPress={() => setShowReplies(!showReplies)}>
            <Typography
              fontSize={12}
            >
              {showReplies ? '답글 숨기기' : `⤷ 답글 ${visibleReplies.length}개 보기`}
            </Typography>
          </ViewRepliesButton>
        )}
        {!isReply && (
          <ReplyButton onPress={() => onPressReply(comment.id, comment.nickname)}>
            <Typography
              fontSize={12}
              style={{ textDecorationLine: 'underline' }}
            >
              답글 달기
            </Typography>
          </ReplyButton>
        )}
      </ReplyActionsWrapper>

      {/* Show all replies if not a reply itself and showReplies is true */}
      {!isReply && showReplies && visibleReplies.length > 0 && (
        <RepliesContainer>
          {visibleReplies.map(reply => (
            <CommentItemWithMenu
              key={reply.id}
              comment={reply}
              replies={reply.replies || []}
              userId={userId}
              onPressReply={onPressReply}
              onPressReportComment={onPressReportComment}
              onPressEditComment={onPressEditComment}
              onPressDeleteComment={onPressDeleteComment}
            />
          ))}
        </RepliesContainer>
      )}
    </CommentItem>
  );
}

export default function CommunityDetailsView({
  post,
  comments,
  isMyPost,
  userId,
  // isLoading,
  isError,
  isCommentModalVisible,
  isEditModalVisible,
  isTagModalVisible,
  isSearchingPhotographerModalVisible,
  commentInput,
  commentInputRef,
  replyTo,
  editingCommentId,
  taggedPhotographer,
  searchPhotographerKey,
  searchedPhotographers,
  setSearchPhotographerKey,
  onChangeCommentInput,
  onLoadMoreSearchedPhotographers,
  onLoadMoreComments,
  hasMoreComments,
  isFetchingMoreComments,
  onPressBack,
  onPressShare,
  onPressLike,
  onPressChat,
  onPressReportPost,
  onPressReportComment,
  onPressBlock,
  onPressMoreComments,
  onPressWriteComment,
  onCloseCommentModal,
  onSubmitComment,
  onPressMore,
  onCloseEditModal,
  onPressEdit,
  onPressDelete,
  onPressReply,
  onPressEditComment,
  onPressDeleteComment,
  onCancelEdit,
  onPressTag,
  onCloseTagModal,
  onPressTaggedPhotographer,
  onToggleTaggedPhotographerScrap,
  onAddTaggedUser,
  onCloseSearchingPhotographerModal,
  onChangeTaggedPhotographer,
  onPressAuthor
}: CommunityDetailsViewProps) {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'ios' ? insets.top : 0;

  // Portal Menu State - menu is rendered at modal level to avoid z-index issues
  const [menuState, setMenuState] = useState<MenuState | null>(null);
  const modalContentRef = useRef<View>(null);

  // Reset menu when comment modal closes
  const prevCommentModalVisible = useRef(isCommentModalVisible);
  if (!isCommentModalVisible && prevCommentModalVisible.current !== isCommentModalVisible) {
    setTimeout(() => setMenuState(null), 0);
  }
  prevCommentModalVisible.current = isCommentModalVisible;

  // Show menu with position measurement
  const showMenu = useCallback((commentId: number, isMyComment: boolean, buttonRef: View | null) => {
    if (!buttonRef || !modalContentRef.current) {
      // Fallback position if measurement fails
      setMenuState({ commentId, isMyComment, position: { x: SCREEN_WIDTH - 100, y: 50 } });
      return;
    }

    buttonRef.measureLayout(
      modalContentRef.current as any,
      (x, y, width, height) => {
        setMenuState({
          commentId,
          isMyComment,
          position: { x: x + width - 80, y: y + height + 4 }, // Position below button, aligned right
        });
      },
      () => {
        // Fallback on measurement error
        setMenuState({ commentId, isMyComment, position: { x: SCREEN_WIDTH - 100, y: 50 } });
      }
    );
  }, []);

  const closeMenu = useCallback(() => {
    setMenuState(null);
  }, []);

  const menuContextValue = {
    showMenu,
    closeMenu,
    activeMenuId: menuState?.commentId ?? null,
  };

  if (isError || !post) {
    return (
      <Container snapToOffsets={[]} snapToAlignment="start" decelerationRate="fast">
        <ErrorWrapper>
          <BackButton onPress={onPressBack} />
          {isError && (
            <ErrorTextWrapper>
              <Typography fontSize={16} color={theme.colors.disabled}>
                게시글을 불러올 수 없습니다.{'\n'}
                다시 시도해주세요.
              </Typography>
            </ErrorTextWrapper>
          )}
        </ErrorWrapper>
      </Container>
    );
  }

  const hasInput = commentInput.trim().length > 0;

  // ✅ 서버가 top-level comment 아래에 replies 트리로 내려줌
  const topLevelComments = comments.filter(c => c.parentId === null && !c.isDeleted);

  // 삭제되지 않은 실제 댓글 수 계산 (최상위 댓글 + 모든 답글)
  const countVisibleComments = (comments: Comment[]): number => {
    let count = 0;
    for (const comment of comments) {
      if (!comment.isDeleted) {
        count += 1;
        if (comment.replies && comment.replies.length > 0) {
          count += countVisibleComments(comment.replies);
        }
      }
    }
    return count;
  };

  const actualCommentCount = countVisibleComments(comments);

  // 프리뷰 영역(상단 3개)은 top-level만 보여주기
  const filteredComments = topLevelComments;

  // Helper to find comment by ID (including in replies)
  const findCommentById = (commentList: Comment[], id: number): Comment | null => {
    for (const comment of commentList) {
      if (comment.id === id) return comment;
      if (comment.replies?.length) {
        const found = findCommentById(comment.replies, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Handle @ mention deletion
  const handleKeyPress = ({ nativeEvent }: any) => {
    if (nativeEvent.key === 'Backspace' && replyTo) {
      const mentionText = `@${replyTo.nickname} `;
      if (commentInput === mentionText || commentInput.startsWith(mentionText)) {
        // If backspace is pressed and input starts with mention, remove entire mention
        onChangeCommentInput('');
      }
    }
  };

  // Handle blur - cancel editing if in edit mode
  const handleBlur = () => {
    if (editingCommentId) {
      onCancelEdit();
    }
  };

  return (
    <>
      <Container
        snapToOffsets={Platform.OS === 'ios' ? [statusBarHeight] : []}
        snapToAlignment="start"
        decelerationRate="fast"
      >
        <ContentWrapper>
          {Platform.OS === 'ios' && (
            <StatusBarSpacer height={statusBarHeight} />
          )}
          <PostImageWrapper>
            <TopGradient
              colors={[
                'rgba(0, 0, 0, 0.6)',
                'rgba(0, 0, 0, 0.4)',
                'rgba(0, 0, 0, 0)',
              ]}
              locations={[0, 0.3, 1]}
            />
            <ImageCarousel images={post.images} />
            {isMyPost && (
              <AddTagButton onPress={onAddTaggedUser}>
                <Icon width={35} height={35} Svg={AddTagIcon} />
              </AddTagButton>
            )}
          </PostImageWrapper>
          <PostHeader statusBarHeight={statusBarHeight}>
            <IconButton
              width={24}
              height={24}
              Svg={ArrowLeftIcon}
              onPress={onPressBack}
            />
            <PostHeaderRightWrapper>
              <IconButton
                width={24}
                height={24}
                Svg={UploadIcon}
                onPress={onPressShare}
                color="#fff"
              />
              <PostHeaderRightSpacer />
              <IconButton
                width={24}
                height={24}
                Svg={MoreCircleIcon}
                onPress={onPressMore}
              />
            </PostHeaderRightWrapper>
          </PostHeader>
          <ContentHeader {...(post.isisPhotographer ? { onPress: onPressAuthor } : {})}>
            {post.categoryLabel !== '스냅소식' && (
              <WriterProfileImage uri={post.author.profileImageUrl} requestWidth={80} />
            )}
            <Typography
              fontSize={14}
              fontWeight="semiBold"
              letterSpacing="-2.5%"
              marginLeft={8}
              marginRight={5}
            >
              {post.categoryLabel === '스냅소식'
                ? '스냅링크 관리자'
                : post.author.nickname}
            </Typography>
            <Icon width={12} height={12} Svg={LogoColorSmallIcon} />
          </ContentHeader>
          <ContentContainer>
            <ContentTextWrapper>
              {post.taggedUsers.length > 0 && (
                <TagButton onPress={onPressTag}>
                  <Typography
                    fontSize={14}
                    lineHeight="140%"
                    letterSpacing="-2.5%"
                    color="primary"
                    style={{ textDecorationLine: 'underline' }}
                  >
                    @{post.taggedUsers[0].nickname}
                  </Typography>
                </TagButton>
              )}
              <Typography fontSize={14} lineHeight="140%" letterSpacing="-2.5%">
                {post.content}
              </Typography>
            </ContentTextWrapper>
            <ActionWrapper>
              <ActionButton onPress={onPressLike}>
                <IconButton
                  width={24}
                  height={24}
                  Svg={post.isLiked ? HeartRedIcon : HeartIcon}
                  onPress={onPressLike}
                />
                <Typography
                  fontSize={14}
                  lineHeight="140%"
                  letterSpacing="-2.5%"
                  marginLeft={6}
                  marginRight={20}
                >
                  {post.likeCount}
                </Typography>
              </ActionButton>
              <ActionButton onPress={onPressChat}>
                <IconButton
                  width={24}
                  height={24}
                  Svg={ChatIcon}
                  onPress={onPressChat}
                />
                <Typography
                  fontSize={14}
                  lineHeight="140%"
                  letterSpacing="-2.5%"
                  marginLeft={6}
                >
                  {actualCommentCount}
                </Typography>
              </ActionButton>
            </ActionWrapper>
            <CommentSectionWrapper onPress={onPressMoreComments}>
              <Typography
                fontSize={14}
                fontWeight="bold"
                lineHeight="140%"
                letterSpacing="-2.5%"
                marginBottom={9}
              >
                댓글 {actualCommentCount}
              </Typography>
              {filteredComments.slice(0, 3).map(comment => (
                <CommentItem key={comment.id}>
                  <CommentContentWrapper>
                    <CommentAuthorProfileImage
                      uri={comment.profileImageUrl || ''}
                      requestWidth={64}
                    />
                    <CommentContent>
                      <Typography
                        fontSize={12}
                        fontWeight="semiBold"
                        lineHeight="140%"
                        letterSpacing="-2.5%"
                      >
                        {comment.nickname}
                      </Typography>
                      <Typography
                        fontSize={12}
                        lineHeight="140%"
                        letterSpacing="-2.5%"
                      >
                        {comment.content}
                      </Typography>
                    </CommentContent>
                  </CommentContentWrapper>
                </CommentItem>
              ))}
              {topLevelComments.length > 3 && (
                <MoreCommentsButton onPress={onPressMoreComments}>
                  <Typography
                    fontSize={12}
                    lineHeight="140%"
                    letterSpacing="-2.5%"
                    color="#A4A4A4"
                    style={{ textDecorationLine: 'underline' }}
                  >
                    댓글 더보기
                  </Typography>
                </MoreCommentsButton>
              )}
              <WriteCommentButton onPress={onPressWriteComment}>
                <Typography
                  fontSize={14}
                  lineHeight="140%"
                  letterSpacing="-2.5%"
                  color="#A4A4A4"
                >
                  댓글을 남겨주세요.
                </Typography>
              </WriteCommentButton>
            </CommentSectionWrapper>
          </ContentContainer>
        </ContentWrapper>
        <ScrollSpacer />
      </Container>

      {/* Comment Modal */}
      <SlideModal
        visible={isCommentModalVisible}
        onClose={onCloseCommentModal}
        showHeader
        title={`댓글  ${actualCommentCount}`}
        headerAlign="left"
        scrollable
        minHeight={SCREEN_HEIGHT * 0.6}
        maxHeight={SCREEN_HEIGHT * 0.6}
        footerHeight={75}
        keyboardAvoid
        autoGrowToMax
        onEndReached={hasMoreComments && !isFetchingMoreComments ? onLoadMoreComments : undefined}
        onEndReachedThreshold={0.2}
        footer={
          <CommentInputWrapper hasInput={hasInput}>
            <TextInput
              ref={commentInputRef}
              value={commentInput}
              onChangeText={onChangeCommentInput}
              onKeyPress={handleKeyPress}
              onBlur={handleBlur}
              placeholder="댓글을 입력하세요"
              placeholderTextColor="#A4A4A4"
              textAlignVertical="center"
              multiline
              style={{
                flex: 1,
                color: '#000',
                fontSize: 14,
                fontFamily: 'Pretendard-Regular',
                marginRight: 10,
                paddingTop: Platform.OS === 'ios' ? 10 : 8,
                paddingBottom: Platform.OS === 'ios' ? 10 : 8,
              }}
            />
            <IconButton
              width={24}
              height={24}
              Svg={SendIcon}
              onPress={onSubmitComment}
              disabled={!hasInput}
            />
          </CommentInputWrapper>
        }
      >
        <MenuContext.Provider value={menuContextValue}>
          <View ref={modalContentRef} collapsable={false} style={{ flex: 1, position: 'relative' }}>
            {/* Transparent overlay to close menu when clicking outside */}
            {menuState !== null && (
              <MenuOverlay onPress={closeMenu} />
            )}
            {topLevelComments.map((comment) => (
              <CommentItemWithMenu
                key={comment.id}
                comment={comment}
                replies={comment.replies || []}
                userId={userId}
                onPressReply={onPressReply}
                onPressReportComment={onPressReportComment}
                onPressEditComment={onPressEditComment}
                onPressDeleteComment={onPressDeleteComment}
              />
            ))}

            {/* Loading indicator at bottom */}
            {isFetchingMoreComments && (
              <View style={{ padding: 16, alignItems: 'center' }}>
                <Typography fontSize={14} color="#AAAAAA">
                  로딩 중...
                </Typography>
              </View>
            )}

            <View style={{ height: 150 }} />

            {/* Portal MoreMenu - rendered at top level for proper z-index */}
            {menuState !== null && (
              <PortalMoreMenu
                style={{
                  top: menuState.position.y - 20,
                  left: menuState.position.x,
                }}
              >
                {menuState.isMyComment ? (
                  <>
                    <MoreMenuItem onPress={() => {
                      const comment = findCommentById(comments, menuState.commentId);
                      closeMenu();
                      if (comment) onPressEditComment(comment.id, comment.content);
                    }}>
                      <Typography fontSize={14} letterSpacing="-2.5%">
                        수정
                      </Typography>
                    </MoreMenuItem>
                    <MoreMenuDivider />
                    <MoreMenuItem onPress={() => {
                      closeMenu();
                      onPressDeleteComment(menuState.commentId);
                    }}>
                      <Typography fontSize={14} letterSpacing="-2.5%" color="#FF0000">
                        삭제
                      </Typography>
                    </MoreMenuItem>
                  </>
                ) : (
                  <MoreMenuItem onPress={() => {
                    closeMenu();
                    onPressReportComment(menuState.commentId);
                  }}>
                    <Typography fontSize={14} letterSpacing="-2.5%" color="#FF0000">
                      신고
                    </Typography>
                  </MoreMenuItem>
                )}
              </PortalMoreMenu>
            )}
          </View>
        </MenuContext.Provider>
      </SlideModal>

      {/* Edit Modal */}
      <SlideModal
        visible={isEditModalVisible}
        onClose={onCloseEditModal}
        showHeader={false}
        scrollable={false}
      >
        <EditModalWrapper>
          {isMyPost ? (
            <>
              <EditModalButton onPress={onPressEdit}>
                <Typography fontSize={16} letterSpacing="-2.5%">
                  수정
                </Typography>
              </EditModalButton>
              <EditModalDivider />
              <EditModalButton onPress={onPressDelete}>
                <Typography fontSize={16} letterSpacing="-2.5%" color="#FF0000">
                  삭제
                </Typography>
              </EditModalButton>
            </>
          ) : (
            <>
              <EditModalButton onPress={onPressBlock}>
                <Typography fontSize={16} letterSpacing="-2.5%">
                  차단하기
                </Typography>
              </EditModalButton>
              <EditModalDivider />
              <EditModalButton onPress={onPressReportPost}>
                <Typography fontSize={16} letterSpacing="-2.5%" color="#FF0000">
                  신고하기
                </Typography>
              </EditModalButton>
            </>
          )}
          <EditModalDivider />
          <EditModalButton onPress={onCloseEditModal}>
            <Typography fontSize={16} letterSpacing="-2.5%" color="#A4A4A4">
              닫기
            </Typography>
          </EditModalButton>
        </EditModalWrapper>
      </SlideModal>

      <SlideModal
        visible={isSearchingPhotographerModalVisible}
        onClose={onCloseSearchingPhotographerModal}
        showHeader={false}
        scrollable={false}
        minHeight={SCREEN_HEIGHT * 0.8}
      >
        <SearchHeaderWrapper>
          <SearchInputWrapper>
            <SearchInput
              value={searchPhotographerKey}
              onChangeText={setSearchPhotographerKey}
              placeholder="작가 검색"
              placeholderTextColor="#A4A4A4"
            />
            <Icon width={24} height={24} Svg={SearchIcon} />
          </SearchInputWrapper>
          <CancelSearchButton onPress={onCloseSearchingPhotographerModal}>
            <Typography
              fontSize={18}
            >취소</Typography>
          </CancelSearchButton>
        </SearchHeaderWrapper>
        <FlatList
          data={searchedPhotographers}
          keyExtractor={(item) => item.userId}
          renderItem={({ item }) => (
            <TaggedPhotographerButton onPress={() => onChangeTaggedPhotographer(item.userId)}>
              <TaggedPhotographerInfo>
                <TaggedPhotographerProfileImageWrapper>
                  <TaggedPhotographerProfileImage uri={item.profileImageUrl} requestWidth={100} />
                </TaggedPhotographerProfileImageWrapper>
                <Typography
                  fontSize={14}
                  fontWeight="semiBold"
                  marginLeft={4}
                >
                  {item.nickname}
                </Typography>
              </TaggedPhotographerInfo>
            </TaggedPhotographerButton>
          )}
          onEndReached={onLoadMoreSearchedPhotographers}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            searchPhotographerKey.trim().length > 0 ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Typography fontSize={14} color="#A4A4A4">
                  검색 결과가 없습니다
                </Typography>
              </View>
            ) : null
          }
        />
      </SlideModal>

      {taggedPhotographer !== undefined &&
        <SlideModal
          visible={isTagModalVisible}
          onClose={onCloseTagModal}
          showHeader={true}
          scrollable={false}
          minHeight={200}
          title="이 사진에 태그된 작가"
        >
          <TaggedPhotographerButton onPress={onPressTaggedPhotographer}>
            <TaggedPhotographerInfo>
              <TaggedPhotographerProfileImageWrapper>
                <TaggedPhotographerProfileImage uri={taggedPhotographer.profileImageUrl} requestWidth={100} />
              </TaggedPhotographerProfileImageWrapper>
              <Typography
                fontSize={14}
                fontWeight="semiBold"
                marginLeft={4}
              >
                {taggedPhotographer.nickname}
              </Typography>
            </TaggedPhotographerInfo>
            <ScrapButton isChecked={taggedPhotographer.scrapped} onPress={(e) => {
              e.stopPropagation();
              onToggleTaggedPhotographerScrap();
            }}>
              <Typography
                fontSize={12}
                fontWeight="bold"
                color={taggedPhotographer.scrapped ? "#fff" : "#000"}
              >스크랩</Typography>
            </ScrapButton>
          </TaggedPhotographerButton>
        </SlideModal>
      }
    </>
  );
}

const Container = styled.ScrollView`
  flex: 1;
  background-color: #fff;
`;

const ScrollSpacer = styled.View`
  height: 50px;
`

const ContentWrapper = styled.View`
  position: relative;
  flex: 1;
`;

const StatusBarSpacer = styled.View<{ height: number }>`
  width: 100%;
  height: ${({ height }) => height}px;
  background-color: #fff;
`;

const PostImageWrapper = styled.View`
  width: 100%;
  height: ${SCREEN_WIDTH}px;
  position: relative;
`

const TopGradient = styled(LinearGradient)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 30%;
  z-index: 5;
`;

const PostHeader = styled.View<{ statusBarHeight: number }>`
  position: absolute;
  top: ${({ statusBarHeight }) => statusBarHeight + 10}px;
  left: 0;
  right: 0;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  z-index: 100;
`;

const PostHeaderRightWrapper = styled.View`
  flex-direction: row;
  align-items: center;
`;

const PostHeaderRightSpacer = styled.View`
  width: 15px;
`;

const ImageSlide = styled.View`
  width: ${SCREEN_WIDTH}px;
  height: ${SCREEN_WIDTH}px;
`;

const PostImage = styled(ServerImage)`
  width: 100%;
  height: 100%;
  background-color: #e0e0e0;
`;

const DotContainer = styled.View`
  position: absolute;
  bottom: 16px;
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

const AnimatedDotView = styled(Animated.View)`
  width: 6px;
  height: 6px;
  border-radius: 3px;
  margin-horizontal: 3px;
`;

const AddTagButton = styled.TouchableOpacity`
  position: absolute;
  z-index: 5;
  left: 20px;
  bottom: 10px;
`

const ContentHeader = styled.Pressable`
  flex-direction: row;
  align-items: center;
  margin-bottom: 15px;
  height: 70px;
  padding: 0 20px;
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: #C8C8C8;
`;

const ContentContainer = styled.View`
  padding: 0 20px;
`;

const ContentTextWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
`;

const TagButton = styled.Pressable`
  margin-right: 5px;
`

const WriterProfileImage = styled(ServerImage).attrs({ type: 'profile' })`
  width: 40px;
  height: 40px;
  border-radius: 40px;
  background-color: #e0e0e0;
`;

const ActionWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: #e0e0e0;
`;

const ActionButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
`;

const CommentSectionWrapper = styled.Pressable`
  width: 100%;
`;

const MenuOverlay = styled.Pressable`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9998;
`;

const CommentItem = styled.View<{ isReply?: boolean }>`
  position: relative;
  margin-bottom: 15px;
  ${({ isReply }) => isReply && 'margin-left: 42px;'}
`;

const CommentContentWrapper = styled.View`
  flex-direction: row;
  position: relative;
`

const CommentAuthorProfileImage = styled(ServerImage).attrs({ type: 'profile' })`
  width: 32px;
  height: 32px;
  border-radius: 32px;
  margin-right: 10px;
  background-color: #e0e0e0;
`;

const CommentContent = styled.View`
  flex: 1;
`;

// Portal MoreMenu - positioned absolutely at container level
const PortalMoreMenu = styled.View`
  position: absolute;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #EAEAEA;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.15;
  shadow-radius: 8px;
  z-index: 99999;
  min-width: 80px;
  ${Platform.OS === 'android' ? 'elevation: 20;' : ''}
`;

const MoreMenuItem = styled.TouchableOpacity`
  padding: 12px 16px;
  align-items: center;
`;

const MoreMenuDivider = styled.View`
  height: 1px;
  background-color: #e0e0e0;
`;

const ReplyActionsWrapper = styled.View`
  flex-direction: row;
  padding-left: 42px;
  margin-top: 8px;
  gap: 16px;
`;

const ViewRepliesButton = styled.TouchableOpacity``;

const ReplyButton = styled.TouchableOpacity``;

const RepliesContainer = styled.View`
  margin-top: 12px;
`;

const MoreCommentsButton = styled.TouchableOpacity`
  width: 100%;
  padding-vertical: 10px;
`

const WriteCommentButton = styled.TouchableOpacity`
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-top: 10px;
`;

const CommentInputWrapper = styled.View<{ hasInput: boolean }>`
  flex-direction: row;
  padding-horizontal: 12px;
  border: 1px solid ${({ hasInput }) => (hasInput ? theme.colors.primary : theme.colors.disabled)};
  border-radius: 8px;
  height: 41px;
  align-items: center;
`;

const EditModalWrapper = styled.View`
  width: 100%;
  border: 1px solid #EAEAEA;
  border-radius: 4px;
  margin-vertical: 20px;
`

const EditModalButton = styled.TouchableOpacity`
  padding: 18px;
  align-items: center;
`;

const EditModalDivider = styled.View`
  height: 1px;
  background-color: #e0e0e0;
`;

const TaggedPhotographerButton = styled.Pressable`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 80px;
`

const TaggedPhotographerInfo = styled.View`
  flex-direction: row;
  align-items: center;
`

const ScrapButton = styled.TouchableOpacity<{ isChecked: boolean }>`
  width: 97px;
  height: 28px;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background-color: ${({ isChecked }) => (isChecked ? theme.colors.primary : theme.colors.disabled)};
`

const TaggedPhotographerProfileImageWrapper = styled.View`
  width: 50px;
  height: 50px;
  border-radius: 50px;
  overflow: hidden;
  background-color: #aaa;
`

const TaggedPhotographerProfileImage = styled(ServerImage).attrs({ type: 'profile' })`
  width: 100%;
  height: 100%;
`

const SearchHeaderWrapper = styled.View`
  flex-direction: row;
  align-items: center;
`

const SearchInputWrapper = styled.View`
  flex: 1;
  flex-direction: row;
  padding-horizontal: 12px;
  border: 1px solid ${theme.colors.disabled};
  border-radius: 8px;
  height: 41px;
  margin-left: 13px;
  align-items: center;
  margin-right: 15px;
`;

const SearchInput = styled.TextInput`
  flex: 1;
  color: #000;
  font-size: 14px;
  font-family: Pretendard-Regular;
  margin-right: 10px;
`;

const CancelSearchButton = styled.TouchableOpacity`
  margin-left: 16px;
`

const ErrorWrapper = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`

const ErrorTextWrapper = styled.View`
  padding: 20px;
`