import { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Platform } from 'react-native';
import ScreenContainer from '@/components/common/ScreenContainer';
import styled from '@/utils/scale/CustomStyled';
import { SubmitButton } from '@/components/theme';
import FormInput from '@/components/form/FormInput';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@/types/navigation.ts';
import { useMeQuery } from '@/queries/user.ts';
import { usePatchMyEmailMutation } from '@/mutations/user.ts';

type EmailEditFormData = {
  email: string;
};

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function EmailEditScreen() {
  const navigation = useNavigation<MainNavigationProp>();
  const { data: meData } = useMeQuery();
  const patchMyEmailMutation = usePatchMyEmailMutation();

  const defaultValues = useMemo<EmailEditFormData>(() => ({
    email: meData?.email || ''
  }), [meData?.email]);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<EmailEditFormData>({
    defaultValues,
    mode: 'onChange',
  });

  const isSubmitDisabled = !isValid;
  const submitButtonText = '저장';

  const handlePressBack = () => navigation.goBack();

  const handleSubmitEmail = async (data: EmailEditFormData) => {
    const trimmedEmail = data.email.trim();

    try {
      await patchMyEmailMutation.mutateAsync(trimmedEmail);
      navigation.goBack();
    } catch (error) {
      console.error('Failed to update email:', error);
    }
  };

  const handlePressSubmit = handleSubmit(handleSubmitEmail);

  return (
    <ScreenContainer
      headerShown={true}
      headerTitle="이메일"
      onPressBack={handlePressBack}
    >
      <KeyboardFormView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollContainer>
          <Content>

            <Controller
              control={control}
              name="email"
              rules={{
                required: '이메일을 입력해주세요.',
                validate: {
                  notEmpty: (value) => value.trim() !== '' || '이메일을 입력해주세요.',
                  validFormat: (value) => EMAIL_REGEX.test(value.trim()) || '올바른 이메일 형식이 아닙니다.',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  placeholder="이메일 *"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorMessage={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            />
          </Content>
        </ScrollContainer>

        <Footer>
          <SubmitButton
            onPress={handlePressSubmit}
            width={327}
            disabled={isSubmitDisabled}
            text={submitButtonText}
            bottom={33}
          />
        </Footer>
      </KeyboardFormView>
    </ScreenContainer>
  );
}

const KeyboardFormView = styled.KeyboardAvoidingView`
  flex: 1;
  width: 100%;
`;

const ScrollContainer = styled.ScrollView`
  flex: 1;
  width: 100%;
  padding-bottom: 82px;
`;

const Content = styled.View`
  padding: 0 40px;
  margin-top: 40px;
`;

const Footer = styled.View`
  width: 100%;
  height: 82px;
  align-items: center;
  justify-content: flex-end;
`;