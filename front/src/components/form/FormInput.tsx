import { TextInputProps } from 'react-native';
import styled from '@/utils/scale/CustomStyled.ts';
import FormErrorMessage from '@/components/form/FormErrorMessage';

interface FormInputProps extends TextInputProps {
  placeholder: string;
  errorMessage?: string;
  height?: number;
}

const InputFieldWrapper = styled.View<{ height: number }>`
  width: 100%;
  background-color: #F9F9F9;
  border: 1px solid #E9E9E9;
  border-radius: 5px;
  height: ${({ height }) => height}px;
  padding: 0 21px;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
`;

const StyledInputField = styled.TextInput`
  flex: 1;
  height: 100%;
  font-size: 14px;
  font-family: Pretendard-Regular;
  letter-spacing: 0.2px;
  color: #000;
`;

const FormErrorMessageSpacer = styled.View`
  height: 10px;
`;

export default function FormInput({ placeholder, errorMessage, height = 50, ...rest }: FormInputProps) {
  return (
    <>
      <InputFieldWrapper height={height}>
        <StyledInputField
          placeholder={placeholder}
          placeholderTextColor="#737373"
          {...rest}
        />
      </InputFieldWrapper>
      {errorMessage && (
        <>
          <FormErrorMessageSpacer />
          <FormErrorMessage message={errorMessage} />
        </>
      )}
    </>
  );
}
