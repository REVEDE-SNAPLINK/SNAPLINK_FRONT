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
  onPressBackButton?: () => void;
  headerToolIcon?: ComponentType<SvgProps>;
  onPressToolButton?: () => void;
}

export default function ScreenContainer({
  children,
  barBackgroundColor = "#fff",
  backgroundColor = "#fff",
  paddingHorizontal,
  alignItemsCenter = true,
  headerShown = true,
  headerTitle = "",
  onPressBackButton,
  headerToolIcon,
  onPressToolButton,
}: Props) {
  return (
    <StyledSafeAreaView
      backgroundColor={backgroundColor}
      android={Platform.OS === 'android'}
      paddingHorizontal={paddingHorizontal}
      alignItemsCenter={alignItemsCenter}
    >
      <StatusBar barStyle="dark-content" backgroundColor={barBackgroundColor} />
      {headerShown && onPressBackButton && (
        <HeaderWithBackButton
          onPressBackButton={onPressBackButton}
          title={headerTitle}
          ToolIcon={headerToolIcon}
          onPressToolButton={onPressToolButton}
        />
      )}
      {children}
    </StyledSafeAreaView>
  )
}

const StyledSafeAreaView = styled(SafeAreaView)<{
  backgroundColor: string,
  android: boolean,
  paddingHorizontal?: number,
  alignItemsCenter: boolean,
}>`
  flex: 1;
  background-color: ${({ backgroundColor }) => backgroundColor};
  box-sizing: border-box;
  ${({ android }) => android && `padding-top: 10px;`}
  ${({ paddingHorizontal }) => paddingHorizontal !== undefined && `padding-horizontal: ${paddingHorizontal}px;`}
  ${({ alignItemsCenter }) => alignItemsCenter ? `align-items: center;` : ''}
`