import ScreenContainer from '@/components/common/ScreenContainer';
import styled from '@/utils/scale/CustomStyled';
import Carousel from 'react-native-reanimated-carousel';
import { Typography } from '@/components/theme';
import { GetPortfolioResponse } from '@/api/photographers';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Dimensions, ScrollView } from 'react-native';
import SlideModal from '@/components/theme/SlideModal.tsx';
import Icon from '@/components/Icon.tsx';
import EditIcon from '@/assets/icons/edit.svg';
import DeleteIcon from '@/assets/icons/delete.svg';
import ServerImage from '@/components/ServerImage.tsx';
import UploadIcon from '@/assets/icons/upload.svg';
import LogoColorSmallIcon from '@/assets/icons/logo-color-icon-small.svg';
import MoreIcon from '@/assets/icons/more.svg';
import { theme } from '@/theme';

interface PostDetailViewProps {
  post?: GetPortfolioResponse;
  isMyPost: boolean;
  isLoading: boolean;
  onPressBack: () => void;
  profileImageURI: string;
  onPressMore: () => void;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  showMoreModal: boolean;
  onCloseMoreModal: () => void;

  navigation?: any;
}

export default function PostDetailView({
  post,
  isMyPost,
  isLoading,
  onPressBack,
  profileImageURI,
  onPressMore,
  currentIndex,
  setCurrentIndex,
  showMoreModal,
  onCloseMoreModal,
  navigation,}: PostDetailViewProps) {
  if (isLoading) {
    return (
      <ScreenContainer headerShown headerTitle="포트폴리오" onPressBack={onPressBack}
      navigation={navigation}>
        <LoadingSpinner visible={isLoading} />
      </ScreenContainer>
    );
  }

  if (!post) {
    return (
      <ScreenContainer headerShown headerTitle="포트폴리오" onPressBack={onPressBack}
      navigation={navigation}>
          <Typography fontSize={16} color="#999">
            포트폴리오를 불러올 수 없습니다.
          </Typography>
      </ScreenContainer>
    );
  }

  return (
    <>
      <ScreenContainer
        headerShown={true}
        headerTitle="게시물"
        onPressBack={onPressBack}
      
      navigation={navigation}>
        <Container>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Post Header */}
            <PostHeader>
              <AuthorInfo>
                <ProfileImageWrapper>
                  <ProfileImage uri={profileImageURI} />
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
                    {post.photographerName}
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
                data={post.photos}
                onSnapToItem={setCurrentIndex}
                renderItem={({ item }) => (
                  <PostImage uri={item.imageUrl} />
                )}
              />
            </CarouselContainer>

            {/* Pagination Dots */}
            {post.photos.length > 1 && (
              <PaginationContainer>
                {post.photos.map((_, index) => (
                  <PaginationDot key={index} isActive={index === currentIndex} />
                ))}
              </PaginationContainer>
            )}

            {/* Post Content */}
            <ContentSection>
              <Typography
                fontSize={14}
                fontWeight="semiBold"
                lineHeight="140%"
                letterSpacing="-2.5%"
              >
                {post.photographerName}
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

            <Spacer height={100} />
          </ScrollView>
        </Container>
      </ScreenContainer>

      <SlideModal
        visible={showMoreModal}
        onClose={onCloseMoreModal}
        title="더보기"
        headerAlign="center"
      >
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
        {isMyPost && (
          <>
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
          </>
        )}
      </SlideModal>
    </>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

const ProfileImage = styled(ServerImage)`
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

const PostImage = styled(ServerImage)`
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

const ModalButton = styled.TouchableOpacity`
  flex-direction: row;
  margin-bottom: 15px;
  align-items: center;
`

const ModalReserveTextWrapper = styled.View`
  margin-left: 8px;
`