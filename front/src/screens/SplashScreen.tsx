import React from 'react';
import { StatusBar, StyleSheet, View, Text } from 'react-native';
import { useTheme } from '@/context/ThemeContext.tsx';

// 배경 이미지를 안 쓴다면 ImageBackground 대신 View+그라디언트로 대체해도 OK
export default function SplashScreen() {
  const { theme } = useTheme();

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <View style={styles.center}>
          <Text
            style={{
              color: '#FFF',
              fontFamily: theme.typography.fontFamily["800"],
              fontSize: 32,
            }}
          >
            SnapLink
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.85)', marginTop: 8 }}>
            가장 빠른 링크 공유
          </Text>
        </View>
    </>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});