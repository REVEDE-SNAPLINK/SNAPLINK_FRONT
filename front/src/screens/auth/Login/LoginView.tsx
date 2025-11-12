import React from 'react';
import styled from '@/utils/scale/CustomStyled';
import Typography from '@/components/theme/Typography';
import SocialLoginButton from '@/components/SocialLoginButton';
import Kakao from '@/assets/icons/kakao.svg';
import Naver from '@/assets/icons/naver.svg';
import Google from '@/assets/icons/google.svg';
import ScreenContainer from '@/components/ScreenContainer.tsx';

type LoginViewProps = {
  onKakaoLogin: () => void;
  onNaverLogin: () => void;
  onGoogleLogin: () => void;
}

export default function LoginView({
  onKakaoLogin,
  onNaverLogin,
  onGoogleLogin,
}: LoginViewProps) {
  return (
    <ScreenContainer>
      <LogoContainer>
        <LogoImageWrapper>
          <LogoImage source={require('@/assets/imgs/logo.png')} />
        </LogoImageWrapper>
      </LogoContainer>

      <SocialLoginContainer>
        <DescriptionWrapper>
          <Typography
            color="#545454"
            fontSize={14}
            fontWeight="medium"
            lineHeight={20}
          >
            간편하게 로그인하고 서비스를 이용해보세요.
          </Typography>
        </DescriptionWrapper>

        <SocialLoginButton
          backgroundColor='#FEE500'
          Icon={Kakao}
          text='카카오'
          onPress={onKakaoLogin}
        />
        <SocialLoginButton
          backgroundColor='#03C75A'
          Icon={Naver}
          text='네이버'
          onPress={onNaverLogin}
        />
        <SocialLoginButton
          backgroundColor='#EAEAEA'
          Icon={Google}
          text='구글'
          onPress={onGoogleLogin}
        />
      </SocialLoginContainer>
    </ScreenContainer>
  );
}

const LogoContainer = styled.View`
  flex: 0.8;
  justify-content: flex-end;
`

const LogoImageWrapper = styled.View`
  width: 223px;
  height: 40px;
`;

const LogoImage = styled.Image`
  max-width: 100%;
  max-height: 100%;
`

const SocialLoginContainer = styled.View`
  flex: 1;
  justify-content: center;
`

const DescriptionWrapper = styled.View`
  margin-top: 14px;
  margin-bottom: 30px;
  align-items: center;
`;
