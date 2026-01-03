import { ReactNode, ComponentType } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgProps } from 'react-native-svg';
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
  iconSize
}: Props) {
  return (
    <StyledSafeAreaView backgroundColor={backgroundColor}>
      <StatusBar barStyle="dark-content" backgroundColor={barBackgroundColor} />
      {headerShown && (
        <HeaderWithBackButton
          onPressBack={onPressBack}
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
  box-sizing: border-box;
  background-color: ${({ backgroundColor }) => backgroundColor};
`;

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