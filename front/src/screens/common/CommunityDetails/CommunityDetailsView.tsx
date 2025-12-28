import { RefObject, useState, useRef, useEffect } from 'react';
import BackButton from '@/components/common/BackButton';
import styled from '@/utils/scale/CustomStyled.ts';
import {
  Dimensions,
  Platform,
  TextInput,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
  Linking,
} from 'react-native';
import IconButton from '@/components/IconButton.tsx';
import UploadIcon from '@/assets/icons/upload-white.svg';
import { Typography } from '@/components/theme';
import HeartIcon from '@/assets/icons/heart-black.svg';
import HeartRedIcon from '@/assets/icons/heart-red.svg';
import ChatIcon from '@/assets/icons/chat-blank-black.svg';
import MoreCircleIcon from '@/assets/icons/more-circle.svg';
import SendIcon from '@/assets/icons/send.svg';
import { theme } from '@/theme';
import { CommunityPost } from '@/api/community.ts';
import ServerImage from '@/components/ServerImage.tsx';
import LinearGradient from 'react-native-linear-gradient';
import ArrowLeftIcon from '@/assets/icons/arrow-left-white.svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SlideModal from '@/components/theme/SlideModal.tsx';
import Icon from '@/components/Icon.tsx';
import UploadBlackIcon from '@/assets/icons/upload.svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// TODO: Define proper Comment interface when API is available
interface Comment {
  id: string;
  content: string;
  author?: {
    userId: string;
    nickname: string;
    profileImageUrl: string;
  };
  // Legacy fields for compatibility
  authorNickname?: string;
  authorProfileImage?: string;
  createdAt: string;
}

export interface ShareLink {
  name: string;
  url: string;
}

interface CommunityDetailsViewProps {
  post?: CommunityPost;
  comments: Comment[];
  isMyPost: boolean;
  isCommentModalVisible: boolean;
  isEditModalVisible: boolean;
  isShareModalVisible: boolean;
  commentInput: string;
  commentInputRef: RefObject<TextInput | null>;
  onChangeCommentInput: (text: string) => void;
  shareLinks: ShareLink[];
  onPressBack: () => void;
  onPressShare: () => void;
  onPressLike: () => void;
  onPressChat: () => void;
  onPressMoreComments: () => void;
  onPressWriteComment: () => void
  onCloseCommentModal: () => void;
  onSubmitComment: () => void;
  onPressMore: () => void;
  onCloseEditModal: () => void;
  onCloseShreModal: () => void;
  onPressEdit: () => void;
  onPressDelete: () => void;
}

// Image Carousel Component
function ImageCarousel({ imageUrls }: { imageUrls: string[] }) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  if (imageUrls.length === 0) {
    return (
      <ImageSlide>
        <PostImage />
      </ImageSlide>
    );
  }

  return (
    <>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH}
        snapToAlignment="start"
      >
        {imageUrls.map((uri, index) => (
          <ImageSlide key={index}>
            <PostImage uri={uri} />
          </ImageSlide>
        ))}
      </ScrollView>

      {imageUrls.length > 1 && (
        <DotContainer>
          {imageUrls.map((_, index) => (
            <AnimatedDot key={index} index={index} activeIndex={currentIndex} />
          ))}
        </DotContainer>
      )}
    </>
  );
}

// Animated Dot Component
function AnimatedDot({ index, activeIndex }: { index: number; activeIndex: number }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const distance = Math.abs(index - activeIndex);
    let targetScale = 1;

    if (distance === 0) targetScale = 1.5;
    else if (distance === 1) targetScale = 1.2;
    else targetScale = 1;

    Animated.spring(scaleAnim, {
      toValue: targetScale,
      useNativeDriver: true,
      friction: 7,
      tension: 40,
    }).start();
  }, [activeIndex, index, scaleAnim]);

  const isActive = index === activeIndex;

  return (
    <AnimatedDotView
      style={{
        transform: [{ scale: scaleAnim }],
        backgroundColor: isActive ? '#fff' : '#aaa',
      }}
    />
  );
}

export default function CommunityDetailsView({
  post,
  comments,
  isMyPost,
  isCommentModalVisible,
  isEditModalVisible,
  isShareModalVisible,
  commentInput,
  commentInputRef,
  onChangeCommentInput,
  shareLinks,
  onPressBack,
  onPressShare,
  onPressLike,
  onPressChat,
  onPressMoreComments,
  onPressWriteComment,
  onCloseCommentModal,
  onSubmitComment,
  onPressMore,
  onCloseEditModal,
  onCloseShreModal,
  onPressEdit,
  onPressDelete,
}: CommunityDetailsViewProps) {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'ios' ? insets.top : 0;

  if (!post) {
    return (
      <Container snapToOffsets={[]} snapToAlignment="start" decelerationRate="fast">
        <BackButton onPress={onPressBack} />
      </Container>
    );
  }

  const hasInput = commentInput.trim().length > 0;

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
            <ImageCarousel imageUrls={post.imageUrls} />
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
              {isMyPost && (
                <>
                  <PostHeaderRightSpacer />
                  <IconButton
                    width={24}
                    height={24}
                    Svg={MoreCircleIcon}
                    onPress={onPressMore}
                  />
                </>
              )}
            </PostHeaderRightWrapper>
          </PostHeader>
          <ContentHeader>
            {post.author.profileImageUrl ? (
              <WriterProfileImage uri={post.author.profileImageUrl} />
            ) : (
              <WriterProfileImage />
            )}
            <Typography
              fontSize={14}
              fontWeight="semiBold"
              letterSpacing="-2.5%"
              marginLeft={8}
            >
              {post.author.nickname}
            </Typography>
          </ContentHeader>
          <ContentContainer>
            <Typography
              fontSize={16}
              fontWeight="bold"
              lineHeight="140%"
              letterSpacing="-2.5%"
              marginBottom={10}
            >
              {post.title}
            </Typography>
            <Typography
              fontSize={14}
              lineHeight="140%"
              letterSpacing="-2.5%"
              marginBottom={10}
            >
              {post.content}
            </Typography>
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
                  {post.commentCount}
                </Typography>
              </ActionButton>
            </ActionWrapper>
            <CommentSectionWrapper>
              <Typography
                fontSize={14}
                fontWeight="bold"
                lineHeight="140%"
                letterSpacing="-2.5%"
                marginBottom={9}
              >
                댓글 {post.commentCount}
              </Typography>
              {comments.slice(0, 3).map(comment => (
                <CommentItem key={comment.id}>
                  <CommentAuthorProfileImage
                    source={
                      comment.author?.profileImageUrl
                        ? { uri: comment.author.profileImageUrl }
                        : comment.authorProfileImage
                        ? { uri: comment.authorProfileImage }
                        : undefined
                    }
                  />
                  <CommentContent>
                    <Typography
                      fontSize={12}
                      fontWeight="semiBold"
                      lineHeight="140%"
                      letterSpacing="-2.5%"
                    >
                      {comment.author?.nickname || comment.authorNickname}
                    </Typography>
                    <Typography
                      fontSize={12}
                      lineHeight="140%"
                      letterSpacing="-2.5%"
                    >
                      {comment.content}
                    </Typography>
                  </CommentContent>
                </CommentItem>
              ))}
              {post.commentCount > 3 && (
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
      </Container>

      {/* Comment Modal */}
      <SlideModal
        visible={isCommentModalVisible}
        onClose={onCloseCommentModal}
        showHeader
        title={`댓글 ${post.commentCount}`}
        headerAlign="left"
        scrollable
        autoGrowToMax
        maxHeight={SCREEN_HEIGHT * 0.8}
        footerHeight={75}
        keyboardAvoid
        footer={
          <CommentInputWrapper hasInput={hasInput}>
            <TextInput
              ref={commentInputRef}
              value={commentInput}
              onChangeText={onChangeCommentInput}
              placeholder="댓글을 입력하세요"
              placeholderTextColor="#A4A4A4"
              multiline
              style={{
                flex: 1,
                color: '#000',
                fontSize: 14,
                fontFamily: 'Pretendard-Regular',
                marginRight: 10,
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
        {comments.map(comment => (
          <CommentItem key={comment.id}>
            <CommentAuthorProfileImage
              source={
                comment.author?.profileImageUrl
                  ? { uri: comment.author.profileImageUrl }
                  : comment.authorProfileImage
                  ? { uri: comment.authorProfileImage }
                  : undefined
              }
            />
            <CommentContent>
              <Typography
                fontSize={12}
                fontWeight="semiBold"
                lineHeight="140%"
                letterSpacing="-2.5%"
              >
                {comment.author?.nickname || comment.authorNickname}
              </Typography>
              <Typography fontSize={12} lineHeight="140%" letterSpacing="-2.5%">
                {comment.content}
              </Typography>
            </CommentContent>
          </CommentItem>
        ))}
      </SlideModal>

      {/* Edit Modal */}
      <SlideModal
        visible={isEditModalVisible}
        onClose={onCloseEditModal}
      >
        <EditModalWrapper>
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
          <EditModalDivider />
          <EditModalButton onPress={onCloseEditModal}>
            <Typography fontSize={16} letterSpacing="-2.5%" color="#A4A4A4">
              닫기
            </Typography>
          </EditModalButton>
        </EditModalWrapper>
      </SlideModal>

      <SlideModal
        visible={isShareModalVisible}
        onClose={onCloseShreModal}
        title="Links"
        minHeight={SCREEN_HEIGHT * 0.25}
      >
        {shareLinks.map((v, i) => (
          <ShareLink
            key={i}
            onPress={() => {
              (async () => {
                const supported = await Linking.canOpenURL(v.url);

                if (supported) {
                  Linking.openURL(v.url);
                }
              })();
            }}
          >
            <Icon width={18} height={18} Svg={UploadBlackIcon} />
            <Typography
              fontSize={14}
              marginLeft={15}
            >
              카카오톡 오픈 채팅
            </Typography>
          </ShareLink>
        ))}
      </SlideModal>
    </>
  );
}

const Container = styled.ScrollView`
  flex: 1;
  background-color: #fff;
`;

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

const ContentHeader = styled.View`
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

const WriterProfileImage = styled(ServerImage)`
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

const CommentSectionWrapper = styled.View`
  width: 100%;
`;

const CommentItem = styled.View`
  flex-direction: row;
  margin-bottom: 15px;
`;

const CommentAuthorProfileImage = styled.Image`
  width: 32px;
  height: 32px;
  border-radius: 32px;
  margin-right: 10px;
  background-color: #e0e0e0;
`;

const CommentContent = styled.View`
  flex: 1;
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
`

const EditModalButton = styled.TouchableOpacity`
  padding: 18px;
  align-items: center;
`;

const EditModalDivider = styled.View`
  height: 1px;
  background-color: #e0e0e0;
`;

const ShareLink = styled.Pressable`
  flex-direction: row;
  align-items: center;
  margin-bottom: 15px;
`