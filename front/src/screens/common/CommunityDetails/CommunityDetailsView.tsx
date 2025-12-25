import { RefObject } from 'react';
import BackButton from '@/components/BackButton.tsx';
import styled from '@/utils/scale/CustomStyled.ts';
import { Dimensions, Modal, Platform, Pressable, TextInput, ScrollView } from 'react-native';
import IconButton from '@/components/IconButton.tsx';
import UploadIcon from '@/assets/icons/upload.svg';
import { Typography } from '@/components/theme';
import HeartIcon from '@/assets/icons/heart-black.svg';
import HeartRedIcon from '@/assets/icons/heart-red.svg';
import ChatIcon from '@/assets/icons/chat-blank-black.svg';
import MoreCircleIcon from '@/assets/icons/more-circle.svg';
import SendIcon from '@/assets/icons/send.svg';
import { theme } from '@/theme';
import { CommunityPost } from '@/api/community.ts';

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

interface CommunityDetailsViewProps {
  post?: CommunityPost;
  comments: Comment[];
  isMyPost: boolean;
  isCommentModalVisible: boolean;
  isEditModalVisible: boolean;
  commentInput: string;
  commentInputRef: RefObject<TextInput | null>;
  onChangeCommentInput: (text: string) => void;
  onPressBack: () => void;
  onPressShare: () => void;
  onPressLike: () => void;
  onPressChat: () => void;
  onPressMoreComments: () => void;
  onPressWriteComment: () => void;
  onCloseCommentModal: () => void;
  onSubmitComment: () => void;
  onPressMore: () => void;
  onCloseEditModal: () => void;
  onPressEdit: () => void;
  onPressDelete: () => void;
}

export default function CommunityDetailsView({
  post,
  comments,
  isMyPost,
  isCommentModalVisible,
  isEditModalVisible,
  commentInput,
  commentInputRef,
  onChangeCommentInput,
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
  onPressEdit,
  onPressDelete,
}: CommunityDetailsViewProps) {
  if (!post) {
    return (
      <Container>
        <BackButton onPress={onPressBack} />
      </Container>
    );
  }

  const hasInput = commentInput.trim().length > 0;

  return (
    <>
      <Container>
        <PostImageWrapper>
          <PostHeader>
            <BackButton onPress={onPressBack} />
            <PostHeaderRightWrapper>
              <IconButton width={24} height={24} Svg={UploadIcon} onPress={onPressShare} />
              {isMyPost && (
                <>
                  <PostHeaderRightSpacer />
                  <IconButton width={24} height={24} Svg={MoreCircleIcon} onPress={onPressMore} />
                </>
              )}
            </PostHeaderRightWrapper>
          </PostHeader>
          <PostImage source={post.imageUrls.length > 0 ? { uri: post.imageUrls[0] } : undefined} />
        </PostImageWrapper>
        <ContentContainer>
          <ContentHeader>
            <WriterProfileImage
              source={post.author.profileImageUrl ? { uri: post.author.profileImageUrl } : undefined}
            />
            <Typography fontSize={14} fontWeight="semiBold" letterSpacing="-2.5%" marginLeft={8}>
              {post.author.nickname}
            </Typography>
          </ContentHeader>
          <ContentWrapper>
            <Typography
              fontSize={16}
              fontWeight="bold"
              lineHeight="140%"
              letterSpacing="-2.5%"
              marginBottom={10}
            >
              {post.title}
            </Typography>
            <Typography fontSize={14} lineHeight="140%" letterSpacing="-2.5%" marginBottom={10}>
              {post.content}
            </Typography>
          </ContentWrapper>
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
              <IconButton width={24} height={24} Svg={ChatIcon} onPress={onPressChat} />
              <Typography fontSize={14} lineHeight="140%" letterSpacing="-2.5%" marginLeft={6}>
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
            {comments.slice(0, 3).map((comment) => (
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
            {post.commentCount > 3 && (
              <MoreCommentsButton onPress={onPressMoreComments}>
                <Typography
                  fontSize={12}
                  lineHeight="140%"
                  letterSpacing="-2.5%"
                  color="#A4A4A4"
                  style={{ textDecorationLine: "underline" }}
                >
                  댓글 더보기
                </Typography>
              </MoreCommentsButton>
            )}
            <WriteCommentButton onPress={onPressWriteComment}>
              <Typography fontSize={14} lineHeight="140%" letterSpacing="-2.5%" color="#A4A4A4">
                댓글을 남겨주세요.
              </Typography>
            </WriteCommentButton>
          </CommentSectionWrapper>
        </ContentContainer>
      </Container>

      {/* Comment Modal */}
      <Modal visible={isCommentModalVisible} animationType="slide" transparent>
        <CommentModalOverlay>
          <CommentModalContainer behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <CommentModalHeader>
              <Typography fontSize={18} fontWeight="bold" letterSpacing="-2.5%">
                댓글 {post.commentCount}
              </Typography>
              <CloseButton onPress={onCloseCommentModal}>
                <Typography fontSize={16} letterSpacing="-2.5%" color="#A4A4A4">
                  닫기
                </Typography>
              </CloseButton>
            </CommentModalHeader>
            <CommentListWrapper>
              <ScrollView showsVerticalScrollIndicator={false}>
                {comments.map((comment) => (
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
              </ScrollView>
            </CommentListWrapper>
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
                  maxHeight: 100,
                  padding: 10,
                  paddingHorizontal: 15,
                  marginRight: 10,
                  borderRadius: 20,
                  backgroundColor: '#f5f5f5',
                  fontSize: 14,
                  fontFamily: 'Pretendard-Regular',
                  color: '#000',
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
          </CommentModalContainer>
        </CommentModalOverlay>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={isEditModalVisible} animationType="fade" transparent>
        <EditModalOverlay onPress={onCloseEditModal}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <EditModalContainer>
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
            </EditModalContainer>
          </Pressable>
        </EditModalOverlay>
      </Modal>
    </>
  );
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const Container = styled.ScrollView`
  flex: 1;
  background-color: #fff;
`;

const PostImageWrapper = styled.View`
  width: 100%;
  height: ${SCREEN_WIDTH}px;
`

const PostHeader = styled.View`
  position: absolute;
  top: ${Platform.OS === 'ios' ? 42 : 15}px;
  left: 0;
  right: 0;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  z-index: 10;
`;

const PostHeaderRightWrapper = styled.View`
  flex-direction: row;
  align-items: center;
`;

const PostHeaderRightSpacer = styled.View`
  width: 15px;
`;

const PostImage = styled.Image`
  width: 100%;
  height: 100%;
  background-color: #e0e0e0;
`;

const ContentContainer = styled.View`
  padding: 20px;
`;

const ContentHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 15px;
`;

const WriterProfileImage = styled.Image`
  width: 40px;
  height: 40px;
  border-radius: 40px;
  background-color: #e0e0e0;
`;

const ContentWrapper = styled.View`
  margin-bottom: 20px;
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
  padding-vertical: 10px;
  align-items: center;
`

const WriteCommentButton = styled.TouchableOpacity`
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-top: 10px;
`;

// Comment Modal Styles
const CommentModalOverlay = styled.Pressable`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
`;

const CommentModalContainer = styled.KeyboardAvoidingView`
  background-color: #fff;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  max-height: ${SCREEN_HEIGHT * 0.8}px;
  position: absolute;
  width: ${SCREEN_WIDTH}px;
  bottom: 0;
`;

const CommentModalHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: #e0e0e0;
`;

const CloseButton = styled.TouchableOpacity`
  padding: 5px;
`;

const CommentListWrapper = styled.View`
  flex: 1;
  padding: 20px;
`;

const CommentInputWrapper = styled.View<{ hasInput: boolean }>`
  flex-direction: row;
  align-items: flex-end;
  padding: 15px 20px;
  border-top-width: 1px;
  border-top-style: solid;
  border-top-color: ${({ hasInput }) => (hasInput ? theme.colors.primary : '#e0e0e0')};
  background-color: #fff;
`;

// Edit Modal Styles
const EditModalOverlay = styled.Pressable`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
`;

const EditModalContainer = styled.View`
  background-color: #fff;
  border-radius: 12px;
  width: 280px;
  overflow: hidden;
`;

const EditModalButton = styled.TouchableOpacity`
  padding: 18px;
  align-items: center;
`;

const EditModalDivider = styled.View`
  height: 1px;
  background-color: #e0e0e0;
`;
