import React from 'react';
import { StatusBar } from 'react-native';
import styled from 'styled-components/native';
import { theme } from '@/constants/theme';
import AppText from '@/components/AppText.tsx';
import Logo from '@/assets/icons/logo.svg'

export default function SplashScreen() {
  return (
    <>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <Container>
        <LogoContainer>
          <LogoWrapper>
            <Logo width={theme.horizontalScale(41.233)} height={theme.verticalScale(40)} />
          </LogoWrapper>
          <AppText
            color='white'
            fontSize={40}
            fontWeight={800}
            lineHeight={40}
          >Snaplink</AppText>
        </LogoContainer>
        <BottomText
          color='white'
          special='kboBold'
          fontSize={20}
          fontWeight={700}
          lineHeight={40}
          letterSpacing={-0.8}
        >Revede</BottomText>
      </Container>
    </>
  );
}

const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.secondary};
  justify-content: center;
  align-items: center;
`;

const LogoContainer = styled.View`
  flex-direction: row;
  width: 100%;
  justify-content: center;
  align-items: center;
  height: ${theme.verticalScale(40)}px;
  margin-bottom: ${theme.verticalScale(33)}px;
`;

const LogoWrapper = styled.View`
  margin-right: ${theme.horizontalScale(11)}px;
`;

const BottomText = styled(AppText)`
  position: absolute;
  bottom: ${theme.verticalScale(63)}px;
`;