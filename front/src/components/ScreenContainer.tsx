import { ReactNode, ComponentType } from 'react';
import { StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgProps } from 'react-native-svg';
import styled from '@/utils/scale/CustomStyled';
import HeaderWithBackButton from './HeaderWithBackButton';

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
}

export default function ScreenContainer({
  children,
  onPressBack,
  onPressTool,
  barBackgroundColor = "#fff",
  backgroundColor = "#fff",
  paddingHorizontal,
  alignItemsCenter = true,
  headerShown = true,
  headerTitle = "",
  headerHeight,
  isShowLogo = false,
  headerToolIcon,
}: Props) {
  return (
    <StyledSafeAreaView>
      <StatusBar barStyle="dark-content" backgroundColor={barBackgroundColor} />
      {headerShown && (
        <HeaderWithBackButton
          onPressBack={onPressBack}
          onPressTool={onPressTool}
          title={headerTitle}
          ToolIcon={headerToolIcon}
          isShowLogo={isShowLogo}
          height={headerHeight}
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

const StyledSafeAreaView = styled(SafeAreaView)`
  flex: 1;
  box-sizing: border-box;
`

const Container = styled.View<{
  paddingHorizontal?: number,
  alignItemsCenter: boolean,
  backgroundColor: string,
}>`
  flex: 1;
  width: 100%;
  background-color: ${({ backgroundColor }) => backgroundColor};
  ${({ paddingHorizontal }) => paddingHorizontal !== undefined && `padding-horizontal: ${paddingHorizontal}px;`}
  ${({ alignItemsCenter }) => alignItemsCenter ? `align-items: center;` : ''}
`