import { StyleSheet, TouchableOpacityProps } from 'react-native';
import styled from 'styled-components/native';
import { theme, boxShadow } from '@/constants/theme.ts';
import AppText from '@/components/AppText.tsx';

type StyledSubmitButtonProps =  {
  disabled: boolean;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  marginHorizontal?: number;
  marginVertical?: number;
}

type SubmitButtonProps = TouchableOpacityProps & StyledSubmitButtonProps & {
  text: string;
}

export default function SubmitButton({
  text,
  disabled,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,
  marginHorizontal,
  marginVertical,
  ...rest
}:  SubmitButtonProps) {
  return (
    <StyledSubmitButton
      disabled={disabled}
      marginTop={marginTop}
      marginBottom={marginBottom}
      marginLeft={marginLeft}
      marginRight={marginRight}
      marginHorizontal={marginHorizontal}
      marginVertical={marginVertical}
      {...rest}
    >
      <AppText
        color="white"
        textAlign='center'
        fontSize={16}
        fontWeight={700}
        lineHeight={24}
      >{text}</AppText>
    </StyledSubmitButton>
  )
}

const StyledSubmitButton = styled.TouchableOpacity<StyledSubmitButtonProps>`
  width: 100%;
  height: ${theme.verticalScale(45)}px;
  background: ${({ disabled }) => disabled ? theme.colors.disabled : theme.colors.primary};
  ${({ marginTop }) => marginTop !== undefined && `margin-top: ${theme.verticalScale(marginTop)}px;`}
  ${({ marginBottom }) => marginBottom !== undefined && `margin-bottom: ${theme.verticalScale(marginBottom)}px;`}
  ${({ marginLeft }) => marginLeft !== undefined && `margin-left: ${theme.horizontalScale(marginLeft)}px;`}
  ${({ marginRight }) => marginRight !== undefined && `margin-right: ${theme.horizontalScale(marginRight)}px;`}
  ${({ marginHorizontal }) => marginHorizontal !== undefined && `margin-horizontal: ${theme.horizontalScale(marginHorizontal)}px;`}
  ${({ marginVertical }) => marginVertical !== undefined && `margin-vertical: ${theme.verticalScale(marginVertical)}px;`}
  ${StyleSheet.flatten(boxShadow.default)};
  flex-shrink: 0;
  border-radius: ${theme.moderateScale(10)}px;
  justify-content: center;
  align-items: center;
`