import React from 'react';
import { StatusBar, Text, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext.tsx';
import AppText from '@/components/AppText.tsx';
import Logo from '@/assets/icons/logo.svg'

export default function SplashScreen() {
  const { theme } = useTheme();

  return (
    <>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.secondary,
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            height: theme.verticalScale(40),
            marginBottom: theme.verticalScale(33),
          }}
        >
          <Logo width={theme.scale(41)} height={theme.scale(40)} style={{ marginRight: theme.scale(11) }} />
          <AppText size='xxl' weight={800} color='background'>Snaplink</AppText>
        </View>
        <Text
          style={{
            fontSize: theme.moderateScale(20),
            color: theme.colors.background,
            fontWeight: 700,
            fontFamily: 'KBODiaGothic-Bold',
            lineHeight: theme.moderateScale(40),
            letterSpacing: theme.scale(-0.8),
            position: 'absolute',
            bottom: theme.verticalScale(63),
          }}
        >Revede</Text>
      </View>
    </>
  );
}