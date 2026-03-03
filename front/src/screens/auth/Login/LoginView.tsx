import styled from '@/utils/scale/CustomStyled';
import Typography from '@/components/ui/Typography';
import SocialLoginButton from '@/components/domain/auth/SocialLoginButton';
import ScreenContainer from '@/components/layout/ScreenContainer';
import Icon from '@/components/ui/Icon.tsx';
import Logo from '@/assets/imgs/logo.svg';
import Kakao from '@/assets/icons/kakao.svg';
import Apple from '@/assets/icons/apple.svg';
import { Platform } from 'react-native';
import Naver from '@/assets/icons/naver.svg';
// import Google from '@/assets/icons/google.svg';

type LoginViewProps = {
  isReviewMode: boolean;
  onKakaoLogin: () => void;
  onTest1Login: () => void;
  onTest2Login: () => void;
  onAppleLogin: () => void;
  onNaverLogin: () => void;
  // onGoogleLogin: () => void;
}

export default function LoginView({
  isReviewMode,
  onKakaoLogin,
  onTest1Login,
  onTest2Login,
  onAppleLogin,
  onNaverLogin,
  // onGoogleLogin,
}: LoginViewProps) {
  return (
    <ScreenContainer>
      <LogoContainer>
        <Icon width={220} height={40} Svg={Logo} />
        <Typography
          fontSize={11}
          lineHeight="140%"
          letterSpacing="-2.5%"
          color="#9D9D9D"
          marginTop={12}
        >
          스냅사진을 더욱 간편하게 경험하세요!
        </Typography>
      </LogoContainer>

      <SocialLoginContainer>
        {/* 테스트 계정 버튼 */}
        {isReviewMode && (
          <>
            <SocialLoginButton
              backgroundColor="#FEE500"
              Icon={Kakao}
              text={`테스트 계정 1`}
              onPress={onTest1Login}
            />
            <SocialLoginButton
              backgroundColor="#FEE500"
              Icon={Kakao}
              text={`테스트 계정 2`}
              onPress={onTest2Login}
            />
          </>
        )}
        <SocialLoginButton
          backgroundColor="#FEE500"
          Icon={Kakao}
          text="카카오"
          onPress={onKakaoLogin}
        />
        {Platform.OS === 'ios' &&
          <SocialLoginButton
            backgroundColor="#000"
            Icon={Apple}
            text="Apple"
            textColor="#fff"
            onPress={onAppleLogin}
          />
        }
        <SocialLoginButton
          backgroundColor='#03C75A'
          textColor="#fff"
          Icon={Naver}
          text='네이버'
          onPress={onNaverLogin}
        />
        {/* TODO: 비즈니스 문제로 추후 추가 */}
        {/*/>*/}
        {/*<SocialLoginButton*/}
        {/*  backgroundColor='#EAEAEA'*/}
        {/*  Icon={Google}*/}
        {/*  text='구글'*/}
        {/*  onPress={onGoogleLogin}*/}
        {/*/>*/}
      </SocialLoginContainer>
    </ScreenContainer>
  );
}

const LogoContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`

const SocialLoginContainer = styled.View`
  flex: 1;
  justify-content: center;
`
