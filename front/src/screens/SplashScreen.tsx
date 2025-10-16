import React from 'react';
import { StatusBar } from 'react-native';
import styled from 'styled-components/native';
import { theme } from '@/constants/theme';
import AppText from '@/components/AppText.tsx';
import Logo from '@/assets/icons/logo.svg'

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
  margin-right: ${theme.scale(11)}px;
`;

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
            <Logo width={theme.scale(41)} height={theme.scale(40)} />
          </LogoWrapper>
          <AppText
            size='xxl'
            weight={800}
            color='background'
            style={{
              lineHeight: theme.moderateScale(40)
            }}
          >Snaplink</AppText>
        </LogoContainer>
        <AppText
          size='md'
          weight={700}
          special='kboBold'
          color='background'
          style={{
            fontSize: theme.moderateScale(20),
            lineHeight: theme.moderateScale(40),
            letterSpacing: theme.scale(-0.8),
            position: 'absolute',
            bottom: theme.verticalScale(63),
          }}
        >Revede</AppText>
      </Container>
    </>
  );
}