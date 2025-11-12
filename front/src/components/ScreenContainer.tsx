import { ReactNode } from 'react';
import { StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from '@/utils/scale/CustomStyled';

interface Props {
  children: ReactNode;
  barBackgroundColor?: string;
  backgroundColor?: string;
  paddingHorizontal?: number;
  alignItemsCenter?: boolean;
}

export default function ScreenContainer({
  children,
  barBackgroundColor = "#fff",
  backgroundColor = "#fff",
  paddingHorizontal,
  alignItemsCenter = true,
}: Props) {
  return (
    <StyledSafeAreaView
      backgroundColor={backgroundColor}
      android={Platform.OS === 'android'}
      paddingHorizontal={paddingHorizontal}
      alignItemsCenter={alignItemsCenter}
    >
      <StatusBar barStyle="dark-content" backgroundColor={barBackgroundColor} />
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