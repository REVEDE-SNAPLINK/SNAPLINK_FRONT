import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context'
import styled from 'styled-components/native';
import {theme} from '@/constants/theme.ts';
import AppText from '@/components/AppText.tsx';
import Logo from '@/assets/icons/logo-color.svg';
import { SvgProps } from 'react-native-svg';
import Kakao from '@/assets/icons/kakao.svg';
import Naver from '@/assets/icons/naver.svg';
import Google from '@/assets/icons/google.svg';
import {TouchableOpacityProps} from "react-native";

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
    <Container>
      <LogoContainer>
        <LogoWrapper>
          <Logo
              width={theme.horizontalScale(41.233)}
              height={theme.verticalScale(40)}
              style={{ marginRight: theme.horizontalScale(11.77) }}
          />
          <AppText
            color='primary'
            special='kboBold'
            fontSize={40}
            fontWeight={700}
            lineHeight={40}
            letterSpacing={-1.6}
          >Snaplink</AppText>
        </LogoWrapper>
        <AppText
            color="black"
            textAlign='center'
            fontSize={14}
            fontWeight={500}
            lineHeight={20}
        >Snaplink와 함께 추억을 만들어보세요!</AppText>
      </LogoContainer>
      <LoginButtonWrapper>
        <AppText
          color='#545454'
          textAlign='center'
          fontSize={14}
          fontWeight={500}
          lineHeight={20}
          marginBottom={30}
        >SNS 계정으로 스냅링크를 이용해보세요</AppText>
        {/* social login buttons */}
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
      </LoginButtonWrapper>
    </Container>
  )
}

const Container = styled(SafeAreaView)`
    background-color: #E9E9E9;
`;

const LogoContainer = styled.View`
    justify-content: center;
    align-items: center;
    margin-top:  ${theme.verticalScale(100)};
    margin-bottom: ${theme.verticalScale(90)};
`

const LogoWrapper = styled.View`
    flex-direction: row;
    margin-bottom: ${theme.verticalScale(10)};
`

const LoginButtonWrapper = styled.View`
    height: 100%;
    background-color: ${theme.colors.white};
    border-top-left-radius: ${theme.moderateScale(50)};
    border-top-right-radius: ${theme.moderateScale(50)};
    padding-top: ${theme.verticalScale(47)};
    align-items: center;
`

const StyledSocialLoginButton = styled.TouchableOpacity<{ backgroundColor: string }>`
    width: ${theme.horizontalScale(335)};
    height: ${theme.verticalScale(55)};
    border-radius: ${theme.moderateScale(10)}px;
    margin-bottom: ${theme.verticalScale(15)};
    background-color: ${({ backgroundColor }) => backgroundColor};
    flex-direction: row;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
`;

type SocialLoginButtonProps = TouchableOpacityProps & {
    backgroundColor: string;
    Icon: React.FC<SvgProps>;
    text: string;
}

const SocialLoginButton = ({
    backgroundColor,
    Icon,
    text,
    ...rest
}: SocialLoginButtonProps) => (
  <StyledSocialLoginButton backgroundColor={backgroundColor} {...rest}>
    <Icon width={theme.horizontalScale(16)} height={theme.verticalScale(16)} />
    <AppText
        color="black"
        textAlign='center'
        fontSize={16}
        fontWeight={500}
        lineHeight={20}
        marginLeft={12}
    >{text} 계정으로 로그인</AppText>
  </StyledSocialLoginButton>
)
