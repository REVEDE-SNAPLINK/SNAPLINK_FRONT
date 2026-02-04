import styled from '@/utils/scale/CustomStyled';
import Typography from '@/components/theme/Typography';
import SocialLoginButton from '@/components/SocialLoginButton';
import ScreenContainer from '@/components/common/ScreenContainer';
import Icon from '@/components/Icon.tsx';
import Logo from '@/assets/imgs/logo.svg';
import Kakao from '@/assets/icons/kakao.svg';
import Apple from '@/assets/icons/apple.svg';
import { Platform } from 'react-native';
// import Naver from '@/assets/icons/naver.svg';
// import Google from '@/assets/icons/google.svg';

type LoginViewProps = {
  onKakaoLogin: () => void;
  onTest1Login: () => void;
  onTest2Login: () => void;
  onAppleLogin: () => void;
  // onNaverLogin: () => void;
  // onGoogleLogin: () => void;
}

export default function LoginView({
  onKakaoLogin,
  // onTest1Login,
  // onTest2Login,
  onAppleLogin,
  // onNaverLogin,
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
        {/* <SocialLoginButton
          backgroundColor="#FEE500"
          Icon={Kakao}
          text={`테스트 계정 1`}
          onPress={onTest1Login}
        /> */}
        {/* <SocialLoginButton
          backgroundColor="#FEE500"
          Icon={Kakao}
          text={`테스트 계정 2`}
          onPress={onTest2Login}
        /> */}
        {/* 실제 로그인 버튼 (주석 처리) */}
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
        {/* TODO: 비즈니스 문제로 추후 추가 */}
        {/*<SocialLoginButton*/}
        {/*  backgroundColor='#03C75A'*/}
        {/*  textColor="#fff"*/}
        {/*  Icon={Naver}*/}
        {/*  text='네이버'*/}
        {/*  onPress={onNaverLogin}*/}
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
