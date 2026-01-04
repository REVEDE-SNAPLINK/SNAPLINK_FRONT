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
  iconSize?: number;
  navigation?: any;
}

export default function ScreenContainer({
  children,
  onPressBack,
  onPressTool,
  onPressMore,
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
      if (!navigation) return;

      const onBackPress = () => {
        if (navigation.canGoBack()) {
          navigation.goBack();
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [navigation])
  );

  return (
    <StyledSafeAreaView backgroundColor={backgroundColor}>
      <StatusBar barStyle="dark-content" backgroundColor={barBackgroundColor} />
      {headerShown && (
        <HeaderWithBackButton
          onPressBack={backHandler}
          onPressTool={onPressTool}
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