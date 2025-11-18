import ScreenContainer from '@/components/ScreenContainer.tsx';
import styled from '@/utils/scale/CustomStyled.ts';
import { theme } from '@/theme';
import Typography from '@/components/theme/Typography.tsx';
import ToggleButton from '@/components/theme/ToggleButton.tsx';
import Icon from '@/components/Icon.tsx';
import CameraIcon from '@/assets/icons/camera-white.svg'
import ChatIcon from '@/assets/icons/chat-black.svg'
import HeartIcon from '@/assets/icons/heart-black.svg'
import NotificationIcon from '@/assets/icons/notification.svg'
import ArrowRightIcon from '@/assets/icons/arrow-right2-gray.svg'

interface ProfileViewProps {
  onPressBack: () => void;
  onToggleExpertMode: () => void;
  onPressProfile: () => void;
  onPressMyReviews: () => void;
  onPressLikedPhotographers: () => void;
  onPressNotificationSettings: () => void;
  onPressEditNickname: () => void;
  onPressEditName: () => void;
  onPressEditEmail: () => void;
  onPressEditPassword: () => void;
  onPressBookingHistory: () => void;
  onPressRecentPhotographers: () => void;
  onPressSnaplinkGuide: () => void;
  onPressCustomerCenter: () => void;
  onPressNotice: () => void;
  onPressFAQ: () => void;
  onPressTerms: () => void;
  isExpertMode: boolean;
  profileImageURI: string;
  nickname: string;
  name: string;
  email: string;
}

export default function ProfileView({
  onPressBack,
  onToggleExpertMode,
  onPressProfile,
  onPressMyReviews,
  onPressLikedPhotographers,
  onPressNotificationSettings,
  onPressEditNickname,
  onPressEditName,
  onPressEditEmail,
  onPressEditPassword,
  onPressBookingHistory,
  onPressRecentPhotographers,
  onPressSnaplinkGuide,
  onPressCustomerCenter,
  onPressNotice,
  onPressFAQ,
  onPressTerms,
  isExpertMode,
  profileImageURI,
  nickname,
  name,
  email,
}:  ProfileViewProps) {
  return (
    <ScreenContainer
      headerShown={true}
      headerTitle="마이페이지"
      onPressBack={onPressBack}
    >
      <ChangeModeWrapper>
        <Typography
          fontSize={14}
          fontWeight="semiBold"
          lineHeight="100%"
          letterSpacing="-2.5%"
          color="#fff"
        >
          전문가로 전환
        </Typography>
        <ToggleButton
          value={isExpertMode}
          onToggle={onToggleExpertMode}
        />
      </ChangeModeWrapper>
      <ContentContainer>
        <UploadProfileButtonWrapper>
          <UploadProfileButton onPress={onPressProfile}>
            <ProfileImageWrapper>
              {profileImageURI && <ProfileImage source={{ uri: profileImageURI }} />}
            </ProfileImageWrapper>
            <UploadProfileIconWrapper>
              <Icon width={18} height={18} Svg={CameraIcon} />
            </UploadProfileIconWrapper>
          </UploadProfileButton>
        </UploadProfileButtonWrapper>
        <IconNavigationButtonWrapper>
          <IconNavigationButton
            onPress={onPressMyReviews}
          >
            <Icon
              width={24}
              height={24}
              Svg={ChatIcon}
            />
            <Typography
              fontSize={12}
              lineHeight="140%"
              letterSpacing="-2.5%"
              color={theme.colors.textSecondary}
            >
              내가 쓴 리뷰
            </Typography>
          </IconNavigationButton>
          <Divider/>
          <IconNavigationButton
            onPress={onPressLikedPhotographers}
          >
            <Icon
              width={24}
              height={24}
              Svg={HeartIcon}
            />
            <Typography
              fontSize={12}
              lineHeight="140%"
              letterSpacing="-2.5%"
              color={theme.colors.textSecondary}
            >
              찜한 작가
            </Typography>
          </IconNavigationButton>
          <Divider/>
          <IconNavigationButton
            onPress={onPressNotificationSettings}
          >
            <Icon
              width={24}
              height={24}
              Svg={NotificationIcon}
            />
            <Typography
              fontSize={12}
              lineHeight="140%"
              letterSpacing="-2.5%"
              color={theme.colors.textSecondary}
            >
              알림 설정
            </Typography>
          </IconNavigationButton>
        </IconNavigationButtonWrapper>
        <InfoContainer>
          <InfoButton
            onPress={onPressEditNickname}
            name="닉네임"
            value={nickname}
          />
          <InfoButton
            onPress={onPressEditName}
            name="이름"
            value={name}
          />
          <InfoButton
            onPress={onPressEditEmail}
            name="이메일"
            value={email}
          />
          <InfoButton
            onPress={onPressEditPassword}
            name="비밀번호 변경"
            isLast
          />
        </InfoContainer>
        <InfoContainer>
          <InfoButton
            onPress={onPressBookingHistory}
            name="촬영 내역"
          />
          <InfoButton
            onPress={onPressRecentPhotographers}
            name="최근 본 작가"
          />
          <InfoButton
            onPress={onPressSnaplinkGuide}
            name="스냅링크 의뢰 가이드"
            isLast
          />
        </InfoContainer>
        <Typography
          fontSize={12}
          lineHeight="140%"
          letterSpacing="-2.5%"
          color="#000"
          marginTop={20}
          marginBottom={15}
        >
          문의 및 알림
        </Typography>
        <CustomerSupportButtonWrapper>
          <CustomerSupportButton
            onPress={onPressCustomerCenter}
            marginRight={102}
          >
            <Typography
              fontSize={14}
              fontWeight="semiBold"
              lineHeight="140%"
              letterSpacing="-2.5%"
              color="#000"
            >
              고객센터
            </Typography>
          </CustomerSupportButton>
          <CustomerSupportButton
            onPress={onPressFAQ}
          >
            <Typography
              fontSize={14}
              fontWeight="semiBold"
              lineHeight="140%"
              letterSpacing="-2.5%"
              color="#000"
            >
              자주 묻는 질문
            </Typography>
          </CustomerSupportButton>
        </CustomerSupportButtonWrapper>
        <CustomerSupportButtonWrapper>
          <CustomerSupportButton
            onPress={onPressNotice}
            marginRight={102}
          >
            <Typography
              fontSize={14}
              fontWeight="semiBold"
              lineHeight="140%"
              letterSpacing="-2.5%"
              color="#000"
            >
              공지사항
            </Typography>
          </CustomerSupportButton>
          <CustomerSupportButton
            onPress={onPressTerms}
          >
            <Typography
              fontSize={14}
              fontWeight="semiBold"
              lineHeight="140%"
              letterSpacing="-2.5%"
              color="#000"
            >
              약관 및 정책
            </Typography>
          </CustomerSupportButton>
        </CustomerSupportButtonWrapper>
      </ContentContainer>
    </ScreenContainer>
  );
}

const ChangeModeWrapper = styled.View`
  height: 50px;
  width: 100%;
  background-color: ${theme.colors.textPrimary};
  padding-left: 23px;
  padding-right: 19px;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
`

const UploadProfileButtonWrapper = styled.View`
  width: 100%;
  align-items: center;
`

const UploadProfileButton = styled.TouchableOpacity`
  width: 110px;
  height: 110px;
  margin-top: 27px;
  margin-bottom: 32px;
`

const ProfileImageWrapper = styled.View`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  background-color: ${theme.colors.disabled};
`

const ProfileImage = styled.Image`
  max-width: 100%;
  max-height: 100%;
  resize-mode: cover;
`

const UploadProfileIconWrapper = styled.View`
  width: 30px;
  height: 30px;
  background-color: ${theme.colors.disabled};
  border-radius: 50%;
  border: 2px solid #fff;
  justify-content: center;
  align-items: center;
  position: absolute;
  bottom: -1px;
  right: 4px;
`

const ContentContainer = styled.ScrollView`
  width: 100%;
  padding-horizontal: 33px;
`

const IconNavigationButtonWrapper = styled.View`
  width: 100%;
  height: 93px;
  margin-bottom: 20px;
  border-radius: 8px;
  border: 1px solid ${theme.colors.bgSecondary};
  padding-horizontal: 23px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

const IconNavigationButton = styled.TouchableOpacity`
  height: 48px;
  justify-content: space-between;
  align-items: center;
`

const Divider = styled.View`
  background-color: #EAEAEA;
  width: 1px;
  height: 32px;
`;

const InfoContainer = styled.View`
  width: 100%;
  border-radius: 8px;
  border: 1px solid #EAEAEA;
  margin-bottom: 20px;
`

const InfoWrapper = styled.TouchableOpacity<{ isLast: boolean }>`
  width: 100%;
  height: 42px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-horizontal: 10px;
  ${({ isLast }) => !isLast && `
    border-bottom-width: 1px;
    border-bottom-color: #EAEAEA;
  `}
`

const InfoValueWrapper = styled.View`
  flex-direction: row;
  height: 100%;
  align-items: center;
`

interface InfoButtonProps {
  onPress: () => void;
  name: string;
  value?: string;
  isLast?: boolean;
}

const InfoButton = ({
  onPress,
  name,
  value,
  isLast = false,
}: InfoButtonProps) => {
  return (
    <InfoWrapper onPress={onPress} isLast={isLast}>
      <Typography
        fontSize={12}
        fontWeight="semiBold"
        lineHeight="140%"
        letterSpacing="-2.5%"
      >
        {name}
      </Typography>
      <InfoValueWrapper>
        {value !== undefined && (
          <Typography
            fontSize={12}
            lineHeight="140%"
            letterSpacing="-2.5%"
            color={theme.colors.disabled}
          >
            {value}
          </Typography>
        )}
        <Icon
          width={15}
          height={15}
          Svg={ArrowRightIcon}
        />
      </InfoValueWrapper>
    </InfoWrapper>
  );
}

const CustomerSupportButtonWrapper = styled.View`
  flex-direction: row;
  margin-bottom: 27px;
  align-items: center;
`

const CustomerSupportButton = styled.TouchableOpacity<{ marginRight?: number }>`
  ${({ marginRight }) => marginRight && `margin-right: ${marginRight}px;`}
`

