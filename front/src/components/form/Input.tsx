import { TextInputProps, Platform } from 'react-native';
import styled from "styled-components/native";
import { theme } from '@/constants/theme.ts';
import { ReactElement } from 'react';

const StyledInput = styled.TextInput<{ width: number | string, height?: number | string, marginBottom?: number, multiline?: boolean }>`
  background-color: ${theme.colors.inputBackground};
  border-radius: ${theme.moderateScale(10)}px;
  height: ${({ height }) => height ? typeof height === 'string' ? height : theme.verticalScale(height) : theme.verticalScale(36)};
  width: ${({ width }) => typeof width === 'string' ? width : theme.horizontalScale(width)};
  color: ${theme.colors.black};
  padding-left: ${theme.horizontalScale(15)};
  padding-right: ${theme.horizontalScale(15)};
  ${({ multiline }) => multiline ? `
    padding-top: ${Platform.OS === 'ios' ? theme.verticalScale(12) : theme.verticalScale(8)}px;
    padding-bottom: ${theme.verticalScale(8)}px;
  ` : ''}
  box-sizing: border-box;
  font-family: "Pretendard-Medium";
  font-size: ${theme.moderateScale(16)}px;
  font-weight: 500;
  ${({ marginBottom }) => marginBottom && `margin-bottom: ${theme.verticalScale(marginBottom)};`}
`

const IconInputWrapper = styled.TouchableOpacity<{ width: number | string, marginBottom?: number }>`
  width: ${({ width }) => typeof width === 'string' ? width : theme.horizontalScale(width)};
  ${({ marginBottom }) => marginBottom && `margin-bottom: ${theme.verticalScale(marginBottom)};`}
  height: ${theme.verticalScale(36)};
`

const IconWrapper = styled.View`
  justify-content: center;
  position: absolute;
  top: 0;
  right: ${theme.horizontalScale(22)}px;
  height: 100%;
`

type InputProps = TextInputProps & {
  width?: number | string;
  height?: number | string;
  marginBottom?: number;
}

function Input ({
  width = "100%",
  marginBottom,
  multiline,
  ...rest
}: InputProps){
  return (
    <StyledInput
      width={width}
      marginBottom={marginBottom}
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
      {...rest}
      placeholderTextColor={theme.colors.placeholder}
    />
  );
}

type IconInputProps = InputProps & {
  Icon: ReactElement;
  onPress: () => void;
}

function IconInput({
  width = "100%",
  marginBottom,
  Icon,
  onPress,
  ...rest
}:  IconInputProps) {
  return (
    <IconInputWrapper
      width={width}
      marginBottom={marginBottom}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Input
        width="100%"
        editable={false}
        pointerEvents="none"
        {...rest}
      />
      <IconWrapper pointerEvents="none">{Icon}</IconWrapper>
    </IconInputWrapper>
  );
}

export {
  Input,
  IconInput
}