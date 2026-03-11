import styled from '@/utils/scale/CustomStyled.ts';
import { theme } from '@/theme';
import Typography from '@/components/ui/Typography.tsx';
import ToggleButton from '@/components/ui/ToggleButton.tsx';
import Icon from '@/components/ui/Icon.tsx';
import ProfileImageUpload from '@/components/media/ProfileImageUpload.tsx';
import ChatIcon from '@/assets/icons/chat-black.svg'
import ActivityIcon from '@/assets/icons/activity.svg'
import DocumentIcon from '@/assets/icons/document.svg'
import NotificationIcon from '@/assets/icons/notification.svg'
import ArrowRightIcon from '@/assets/icons/arrow-right2-gray.svg'
import HeaderWithBackButton from '@/components/layout/HeaderWithBackButton.tsx';

interface ProfileViewProps {
  onToggleExpertMode: () => void;
  onPressProfile: () => void;
  onPressMyReviews: () => void;
  onPressMyPosts: () => void;
  onPressNotificationSettings: () => void;
  onPressEditNickname: () => void;
  onPressEditEmail: () => void;
  onPressManageAccount: () => void;
  onPressBookingHistory: () => void;
  onPressManageBooking: () => void;
  onPressManagePortfolio: () => void;
  onPressManageBlock: () => void;
  onPressManageShootService: () => void;
  onPressCustomerCenter: () => void;
  onPressNotice: () => void;
  onPressFAQ: () => void;
  onPressTerms: () => void;
  onPressOpenSource: () => void;
  isExpertMode: boolean;
  isPhotographer: boolean;
  profileImageURI: string;
  nickname: string;
  name: string;
  email: string;
}

export default function ProfileView({
  onToggleExpertMode,
  onPressProfile,
  onPressMyReviews,
  onPressMyPosts,
  onPressNotificationSettings,
  onPressEditNickname,
  onPressEditEmail,
  onPressManageAccount,
  onPressBookingHistory,
  onPressManageBooking,
  onPressManagePortfolio,
  onPressManageBlock,
  onPressManageShootService,
  onPressCustomerCenter,
  onPressNotice,
  onPressFAQ,
  onPressTerms,
  onPressOpenSource,
  isExpertMode,
  isPhotographer,
  profileImageURI,
  nickname,
  name,
  email,
}:  ProfileViewProps) {
  return (
    <Container>
      <HeaderWithBackButton title="마이페이지" />
      {isPhotographer && (
        <ChangeModeWrapper isExpertMode={isExpertMode}>
          <Typography
            fontSize={14}
            fontWeight="semiBold"
            lineHeight="100%"
            letterSpacing="-2.5%"
            color="#fff"
          >
            {isExpertMode ? '고객으로 전환' : '전문가로 전환'}
          </Typography>
          <ToggleButton value={isExpertMode} onToggle={onToggleExpertMode} />
        </ChangeModeWrapper>
      )}
      <ContentContainer>
        <ProfileImageUpload
          imageURI={profileImageURI}
          onPress={onPressProfile}
          marginTop={27}
          marginBottom={32}
        />
        <IconNavigationButtonWrapper>
          {((isPhotographer && !isExpertMode) || !isPhotographer) ? (
            <IconNavigationButton onPress={onPressMyReviews}>
              <Icon width={24} height={24} Svg={ChatIcon} />
              <Typography
                fontSize={12}
                lineHeight="140%"
                letterSpacing="-2.5%"
                color={theme.colors.textSecondary}
              >
                내 리뷰
              </Typography>
            </IconNavigationButton>
          ) : (
            <IconNavigationButton onPress={onPressManagePortfolio}>
              <Icon width={24} height={24} Svg={ActivityIcon} />
              <Typography
                fontSize={12}
                lineHeight="140%"
                letterSpacing="-2.5%"
                color={theme.colors.textSecondary}
              >
                포트폴리오
              </Typography>
            </IconNavigationButton>
          )}
          <Divider />
          <IconNavigationButton onPress={onPressMyPosts}>
            <Icon width={24} height={24} Svg={DocumentIcon} />
            <Typography
              fontSize={12}
              lineHeight="140%"
              letterSpacing="-2.5%"
              color={theme.colors.textSecondary}
            >
              내 게시글
            </Typography>
          </IconNavigationButton>
          <Divider />
          <IconNavigationButton onPress={onPressNotificationSettings}>
            <Icon width={24} height={24} Svg={NotificationIcon} />
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
          <InfoButton name="이름" value={name} />
          <InfoButton
            onPress={onPressEditNickname}
            name="닉네임"
            value={nickname}
          />
          <InfoButton onPress={onPressEditEmail} name="이메일" value={email} />
          <InfoButton onPress={onPressManageAccount} name="계정 관리" isLast />
        </InfoContainer>
        <InfoContainer>
          {isPhotographer && isExpertMode ? (
            <>
              <InfoButton
                onPress={onPressManageBooking}
                name="촬영 예약 관리"
              />
              <InfoButton
                onPress={onPressManageShootService}
                name="판매 관리"
              />
            </>
          ) : (
            <InfoButton onPress={onPressBookingHistory} name="촬영 내역"/>
          )}
          <InfoButton onPress={onPressManageBlock} name="차단 관리" isLast />
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
          <CustomerSupportButton onPress={onPressFAQ}>
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
          <CustomerSupportButton onPress={onPressNotice} marginRight={102}>
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
          <CustomerSupportButton onPress={onPressTerms}>
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
        <CustomerSupportButtonWrapper>
          <CustomerSupportButton onPress={onPressOpenSource} marginRight={102}>
            <Typography
              fontSize={14}
              fontWeight="semiBold"
              lineHeight="140%"
              letterSpacing="-2.5%"
              color="#000"
            >
              오픈소스 라이선스
            </Typography>
          </CustomerSupportButton>
        </CustomerSupportButtonWrapper>
        <Typography
          fontSize={12}
          color="#C8C8C8"
          marginTop={20}
          marginBottom={20}
        >
          Copyright Revede, All Rights Reserved.
        </Typography>
      </ContentContainer>
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
`

const ChangeModeWrapper = styled.View<{ isExpertMode: Boolean }>`
  height: 50px;
  width: 100%;
  background-color: ${({ isExpertMode }) => isExpertMode ? theme.colors.primary : theme.colors.textPrimary};
  padding-left: 23px;
  padding-right: 19px;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
`

const ContentContainer = styled.ScrollView`
  width: 100%;
  padding-horizontal: 20px;
`

const IconNavigationButtonWrapper = styled.View`
  width: 100%;
  height: 93px;
  margin-bottom: 20px;
  border-radius: 8px;
  border: 1px solid ${theme.colors.bgSecondary};
  padding-horizontal: 23px;
  flex-direction: row;
  justify-content: space-around;
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
  onPress?: () => void;
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
    <InfoWrapper {...(onPress !== undefined ? { onPress } : {})} isLast={isLast} disabled={onPress === undefined}>
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
        {onPress !== undefined ? (
          <Icon
            width={15}
            height={15}
            Svg={ArrowRightIcon}
          />
        ) : (
          <EmptyIcon />
        )}
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

const EmptyIcon = styled.View`
  width: 5px;
  height: 15px;
`
