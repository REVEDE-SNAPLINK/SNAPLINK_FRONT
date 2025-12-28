import React, { useState } from 'react';
import { ScrollView, Dimensions, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Carousel from 'react-native-reanimated-carousel';
import ScreenContainer from '@/components/common/ScreenContainer';
import styled from '@/utils/scale/CustomStyled';
import Typography from '@/components/theme/Typography';
import Icon from '@/components/Icon';
import { theme } from '@/theme';
import BookmarkIcon from '@/assets/icons/bookmark-white.svg';
import BookmarkFilledIcon from '@/assets/icons/bookmark-color.svg';
import ChatIcon from '@/assets/icons/chat-white.svg';
import HeartIcon from '@/assets/icons/heart-black.svg';
import HeartFilledIcon from '@/assets/icons/heart-color.svg';
import MoreIcon from '@/assets/icons/more.svg';
import SubmitButton from '@/components/theme/SubmitButton';
import LogoColorSmallIcon from '@/assets/icons/logo-color-icon-small.svg';
import UploadIcon from '@/assets/icons/upload.svg';
import EditIcon from '@/assets/icons/edit.svg';
import DeleteIcon from '@/assets/icons/delete.svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PostData {
  id: string;
  author: {
    id: string;
    name: string;
    profileImage: string;
  };
  images: string[];
  content: string;
  likeCount: number;
  createdAt: string;
}

interface PostDetailViewProps {
  post: PostData;
  isLiked: boolean;
  isFavorite: boolean;
  showMoreModal: boolean;
  onPressBack: () => void;
  onPressMore: () => void;
  onCloseMoreModal: () => void;
  onPressLike: () => void;
  onPressFavorite: () => void;
  onPressInquiry: () => void;
  onPressReservation: () => void;
}

export default function PostDetailView({
  post,
  isLiked,
  isFavorite,
  showMoreModal,
  onPressBack,
  onPressMore,
  onCloseMoreModal,
  onPressLike,
  onPressFavorite,
  onPressInquiry,
  onPressReservation,
}: PostDetailViewProps) {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <ScreenContainer
      headerShown={true}
      headerTitle="게시물"
      onPressBack={onPressBack}
    >
      <Container>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Post Header */}
          <PostHeader>
            <AuthorInfo>
              <ProfileImageWrapper>
                <ProfileImage source={{ uri: post.author.profileImage }} />
              </ProfileImageWrapper>
              <NameWrapper>
                <Icon width={12} height={12} Svg={LogoColorSmallIcon} />
                <Typography
                  fontSize={14}
                  fontWeight="semiBold"
                  lineHeight="140%"
                  letterSpacing="-2.5%"
                  marginLeft={2}
                >
                  {post.author.name}
                </Typography>
              </NameWrapper>
            </AuthorInfo>
            <MoreButton onPress={onPressMore}>
              <Icon width={24} height={24} Svg={MoreIcon} />
            </MoreButton>
          </PostHeader>

          {/* Image Carousel */}
          <CarouselContainer>
            <Carousel
              width={SCREEN_WIDTH}
              height={SCREEN_WIDTH}
              data={post.images}
              onSnapToItem={setCurrentIndex}
              renderItem={({ item }) => (
                <PostImage source={{ uri: item }} />
              )}
            />
          </CarouselContainer>

          {/* Pagination Dots */}
          {post.images.length > 1 && (
            <PaginationContainer>
              {post.images.map((_, index) => (
                <PaginationDot key={index} isActive={index === currentIndex} />
              ))}
            </PaginationContainer>
          )}

          {/* Like Section */}
          <LikeSection>
            <LikeButton onPress={onPressLike}>
              <Icon
                width={24}
                height={24}
                Svg={isLiked ? HeartFilledIcon : HeartIcon}
              />
            </LikeButton>
            <Typography
              fontSize={14}
              fontWeight="semiBold"
              lineHeight="140%"
              letterSpacing="-2.5%"
              marginLeft={8}
            >
              좋아요 {post.likeCount}개
            </Typography>
          </LikeSection>

          {/* Post Content */}
          <ContentSection>
            <Typography
              fontSize={14}
              fontWeight="semiBold"
              lineHeight="140%"
              letterSpacing="-2.5%"
            >
              {post.author.name}
            </Typography>
            <ContentWrapper>
              <Typography
                fontSize={14}
                lineHeight="140%"
                letterSpacing="-2.5%"
              >
                {post.content}
              </Typography>
            </ContentWrapper>
          </ContentSection>

          <Spacer height={100 + insets.bottom} />
        </ScrollView>
      </Container>

      {/* Bottom Action Buttons */}
      <BottomActionContainer style={{ paddingBottom: 22 + insets.bottom }}>
        <ActionButton onPress={onPressFavorite}>
          <Icon
            width={24}
            height={24}
            Svg={isFavorite ? BookmarkFilledIcon : BookmarkIcon}
          />
        </ActionButton>
        <ActionButton onPress={onPressInquiry}>
          <Icon width={24} height={24} Svg={ChatIcon} />
        </ActionButton>
        <SubmitButton text="예약하기" onPress={onPressReservation} />
      </BottomActionContainer>

      {/* More Options Modal */}
      <Modal
        visible={showMoreModal}
        transparent
        animationType="slide"
        onRequestClose={onCloseMoreModal}
      >
        <ModalOverlay activeOpacity={1} onPress={onCloseMoreModal}>
          <ModalContainer>
            <ModalSlideBarWrapper>
              <ModalSlideBar />
            </ModalSlideBarWrapper>
            <ModalHeader>
              <Typography
                fontSize={14}
                fontWeight="bold"
                letterSpacing="-2.5%"
              >
                더보기
              </Typography>
            </ModalHeader>
            <ModalContent>
              <ModalButton>
                <Icon width={18} height={18} Svg={UploadIcon} />
                <Typography
                  fontSize={14}
                  lineHeight="140%"
                  letterSpacing="-2.5%"
                  marginLeft={8}
                >
                  open.kakao.com/abcdefg
                </Typography>
              </ModalButton>
              <ModalButton>
                <Icon width={18} height={18} Svg={UploadIcon} />
                <ModalReserveTextWrapper>
                  <Typography
                    fontSize={14}
                    lineHeight="140%"
                    letterSpacing="-2.5%"
                  >
                    예약하기 전용 링크
                  </Typography>
                  <Typography
                    fontSize={10}
                    lineHeight="140%"
                    letterSpacing="-2.5%"
                  >
                    snaplink.run/artists/abcdefg
                  </Typography>
                </ModalReserveTextWrapper>
              </ModalButton>
              <ModalButton>
                <Icon width={18} height={18} Svg={EditIcon} />
                <Typography
                  fontSize={14}
                  lineHeight="140%"
                  letterSpacing="-2.5%"
                  marginLeft={8}
                >
                  게시글 수정
                </Typography>
              </ModalButton>
              <ModalButton>
                <Icon width={18} height={18} Svg={DeleteIcon} />
                <Typography
                  fontSize={14}
                  lineHeight="140%"
                  letterSpacing="-2.5%"
                  marginLeft={8}
                >
                  삭제
                </Typography>
              </ModalButton>
            </ModalContent>
          </ModalContainer>
        </ModalOverlay>
      </Modal>
    </ScreenContainer>
  );
}

const Container = styled.View`
  flex: 1;
`;

const PostHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 12px 17px;
`;

const AuthorInfo = styled.View`
  flex-direction: row;
  align-items: center;
`;

const ProfileImageWrapper = styled.View`
  width: 45px;
  height: 45px;
  border-radius: 45px;
  overflow: hidden;
  background-color: #F4F4F4;
`

const ProfileImage = styled.Image`
  width: 100%;
  height: 100%;
`;

const NameWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  margin-left: 5px;
`

const MoreButton = styled.TouchableOpacity`
  padding: 4px;
`;

const CarouselContainer = styled.View`
  width: ${SCREEN_WIDTH}px;
  height: ${SCREEN_WIDTH}px;
  position: relative;
`;

const PostImage = styled.Image`
  width: ${SCREEN_WIDTH}px;
  height: ${SCREEN_WIDTH}px;
`;

const PaginationContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
`;

const PaginationDot = styled.View<{ isActive: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: ${({ isActive }) => isActive ? theme.colors.primary : '#D9D9D9'};
  margin: 0 4.5px;
`;

const LikeSection = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 12px 17px;
`;

const LikeButton = styled.TouchableOpacity``;

const ContentSection = styled.View`
  flex-direction: row;
  margin-top: 7px;
  padding-horizontal: 18px;
  flex: 1;
`;

const ContentWrapper = styled.View`
  flex: 1;
  margin-left: 5px;
`

const Spacer = styled.View<{ height: number }>`
  height: ${({ height }) => height}px;
`;

const BottomActionContainer = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  flex-direction: row;
  background-color: #fff;
  width: 100%;
  padding-horizontal: 17px;
  padding-top: 22px;
  justify-content: space-between;
`;

const ActionButton = styled.TouchableOpacity`
  width: 49px;
  height: 49px;
  border-radius: 8px;
  background-color: ${theme.colors.primary};
  justify-content: center;
  align-items: center;
  margin-right: 5px;
`;

const ModalOverlay = styled.TouchableOpacity`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: flex-end;
`;

const ModalContainer = styled.TouchableOpacity`
  width: 100%;
  height: 276px;
  background-color: #fff;
  border-top-left-radius: 35px;
  border-top-right-radius: 35px;
`;

const ModalSlideBarWrapper = styled.View`
  width: 100%;
  align-items: center;
  position: absolute;
  left: 0;
  top: 5px;
`

const ModalSlideBar = styled.View`
  width: 30px;
  height: 3px;
  border-radius: 100px;
  background-color: #AAAAAA;
`

const ModalHeader = styled.View`
  height: 57px;
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: #C8C8C8;
  justify-content: center;
  align-items: center;
`

const ModalContent = styled.View`
  flex: 1;
  width: 100%;
  padding: 24px 30px;
`

const ModalButton = styled.TouchableOpacity`
  flex-direction: row;
  margin-bottom: 15px;
  align-items: center;
`

const ModalReserveTextWrapper = styled.View`
  margin-left: 8px;
`