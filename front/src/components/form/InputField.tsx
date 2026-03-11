import { TextInputProps } from 'react-native';
import styled from '@/utils/scale/CustomStyled.ts';
import FormErrorMessage from '@/components/form/FormErrorMessage.tsx';

interface InputFieldProps extends TextInputProps {
  placeholder: string;
  errorMessage?: string;
}

const InputFieldWrapper = styled.View`
  width: 100%;
  background-color: #F9F9F9;
  border: 1px solid #E9E9E9;
  border-radius: 5px;
  height: 50px;
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

export default function InputField({ placeholder, errorMessage, ...rest }: InputFieldProps) {
  return (
    <>
      <InputFieldWrapper>
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