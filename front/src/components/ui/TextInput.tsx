import { forwardRef, useState, useEffect } from 'react';
import { TextInput as RNTextInput, TextInputProps } from 'react-native';
import styled from '@/utils/scale/CustomStyled';
import { theme } from '@/theme';
import Typography from '@/components/ui/Typography';

type Props = TextInputProps & {
  width?: number | string;
  height?: number;
  placeholder?: string;
  multiline?: boolean;
  error?: boolean;
  borderColor?: string;
}

const Container = styled.View<{ width: number | string }>`
  width: ${({ width }) => typeof width === 'string' ? width : width+'px'};
`;

const TextInputWrapper = styled.View<{
  width: number | string;
  height?: number;
  borderColor?: string;
  multiline?: boolean;
  error?: boolean;
}>`
  width: ${({ width }) => typeof width === 'string' ? width : width+'px'};
  height: ${({ height, multiline }) =>
    height !== undefined ? height : (multiline ? 100 : 43)
  }px;
  border-width: 1px;
  border-color: ${({ borderColor, error }) => {
    if (error) return '#FF3B30';
    return borderColor !== undefined ? borderColor : '#E5E5EA';
  }};
  border-radius: 8px;
  padding: ${({ multiline }) => multiline ? '13px 15px' : '0px 15px'};
`;

const StyledTextInput = styled(RNTextInput)<{ multiline?: boolean }>`
  flex: 1;
  font-size: 16px;
  line-height: 20px;
  color: #000000;
  padding: 0px;
  ${({ multiline }) => multiline && `
    text-align-vertical: top;
  `}
`;

const TextCounterWrapper = styled.View<{ width: number | string }>`
  width: ${({ width }) => typeof width === 'string' ? width : width + 'px'};
  align-items: flex-end;
`;

interface TextCounterProps {
  width: number | string;
  currentLength: number;
  maxLength: number;
}

const TextCounter = ({
  width,
  currentLength,
  maxLength,
}: TextCounterProps) => {
  return (
    <TextCounterWrapper width={width}>
      <Typography
        fontSize={12}
        lineHeight={16.8}
        letterSpacing={-0.3}
        color="#3C3C3C"
      >
        {currentLength}/{maxLength}
      </Typography>
    </TextCounterWrapper>
  );
};

/**
 * TextInput 컴포넌트
 * react-hook-form과 호환됩니다
 *
 * @example
 * ```tsx
 * // react-hook-form과 함께 사용
 * const { control } = useForm();
 *
 * <Controller
 *   control={control}
 *   name="email"
 *   render={({ field: { onChange, onBlur, value } }) => (
 *     <TextInput
 *       placeholder="이메일을 입력하세요"
 *       value={value}
 *       onChangeText={onChange}
 *       onBlur={onBlur}
 *     />
 *   )}
 * />
 *
 * // multiline 사용 (글자 수 카운터 포함)
 * <TextInput
 *   multiline
 *   maxLength={200}
 *   placeholder="내용을 입력하세요"
 *   value={text}
 *   onChangeText={setText}
 * />
 *
 * // error 상태
 * <TextInput
 *   error={!!errors.email}
 *   placeholder="이메일"
 * />
 * ```
 */
const TextInput = forwardRef<RNTextInput, Props>(({
  width = '100%',
  height,
  placeholder = '',
  multiline = false,
  error = false,
  borderColor,
  value = '',
  maxLength,
  ...rest
}, ref) => {
  const [textLength, setTextLength] = useState(0);

  // value가 외부에서 변경될 때 textLength 동기화
  useEffect(() => {
    if (value) {
      setTextLength(String(value).length);
    } else {
      setTextLength(0);
    }
  }, [value]);

  const handleChangeText = (text: string) => {
    setTextLength(text.length);
    rest.onChangeText?.(text);
  };

  return (
    <Container width={width}>
      <TextInputWrapper
        width={width}
        height={height}
        multiline={multiline}
        error={error}
        borderColor={borderColor}
      >
        <StyledTextInput
          ref={ref}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.disabled}
          multiline={multiline}
          maxLength={maxLength}
          value={value}
          onChangeText={handleChangeText}
          {...rest}
        />
      </TextInputWrapper>

      {multiline && maxLength && (
        <TextCounter
          width={width}
          currentLength={textLength}
          maxLength={maxLength}
        />
      )}
    </Container>
  );
});

TextInput.displayName = 'TextInput';

export default TextInput;
