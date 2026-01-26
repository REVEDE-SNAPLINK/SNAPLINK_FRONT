import React, { ReactNode, ComponentType } from 'react';
import { StatusBar, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgProps } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';
import styled from '@/utils/scale/CustomStyled';
import HeaderWithBackButton from '@/components/common/HeaderWithBackButton';

interface Props {
  children: ReactNode;
  barBackgroundColor?: string;
  backgroundColor?: string;
  paddingHorizontal?: number;
  alignItemsCenter?: boolean;
  // Header props
  headerShown?: boolean;
  headerTitle?: string;
  headerHeight?: number;
  isShowLogo?: boolean;
  onPressBack?: () => void;
  headerToolIcon?: ComponentType<SvgProps>;
  onPressTool?: () => void;
  onPressMore?: () => void;
  onPressTitle?: () => void;
  iconSize?: number;
  navigation?: any;
}

export default function ScreenContainer({
  children,
  onPressBack,
  onPressTool,
  onPressMore,
  onPressTitle,
  barBackgroundColor = "#fff",
  backgroundColor = "#fff",
  paddingHorizontal,
  alignItemsCenter = true,
  headerShown = true,
  headerTitle = "",
  headerHeight,
  isShowLogo = false,
  headerToolIcon,
  iconSize,
  navigation
}: Props) {
  // Default back handler
  const handleBack = React.useCallback(() => {
    if (navigation?.canGoBack()) {
      navigation.goBack();
    } else {
      BackHandler.exitApp();
    }
  }, [navigation]);

  // Use provided onPressBack or default handleBack
  const backHandler = onPressBack || (navigation ? handleBack : undefined);

  // Android hardware back button handler
  useFocusEffect(
      React.useCallback(() => {
        const onBackPress = () => {
          // 1. 만약 부모로부터 전달받은 onPressBack이 있다면 그것을 우선 실행
          if (onPressBack) {
            onPressBack();
            return true; // 시스템 종료 방지
          }

          // 2. onPressBack이 없고, navigation이 있다면 기본 handleBack(또는 goBack) 실행
          if (navigation && navigation.isFocused()) {
            if (navigation.canGoBack()) {
              navigation.goBack();
              return true;
            }
          }

          return false; // 더 이상 뒤로 갈 곳이 없으면 앱 종료 허용
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => subscription.remove();
      }, [navigation, onPressBack]) // onPressBack을 의존성 배열에 추가!
  );

  return (
    <StyledSafeAreaView backgroundColor={backgroundColor}>
      <StatusBar barStyle="dark-content" backgroundColor={barBackgroundColor} />
      {headerShown && (
        <HeaderWithBackButton
          onPressBack={backHandler}
          onPressTool={onPressTool}
          onPressTitle={onPressTitle}
          title={headerTitle}
          ToolIcon={headerToolIcon}
          isShowLogo={isShowLogo}
          height={headerHeight}
          iconSize={iconSize}
          onPressMore={onPressMore}
        />
      )}
      <Container
        backgroundColor={backgroundColor}
        paddingHorizontal={paddingHorizontal}
        alignItemsCenter={alignItemsCenter}
      >
        {children}
      </Container>
    </StyledSafeAreaView>
  )
}

const StyledSafeAreaView = styled(SafeAreaView)<{ backgroundColor: string }>`
  flex: 1;
  background-color: ${({ backgroundColor }) => backgroundColor};
`;

const Container = styled.View<{
  paddingHorizontal?: number,
  alignItemsCenter: boolean,
  backgroundColor: string,
}>`
  flex: 1;
  background-color: ${({ backgroundColor }) => backgroundColor};
  ${({ paddingHorizontal }) => paddingHorizontal !== undefined && `padding-horizontal: ${paddingHorizontal}px;`}
  ${({ alignItemsCenter }) => alignItemsCenter ? `align-items: center;` : ''}
`