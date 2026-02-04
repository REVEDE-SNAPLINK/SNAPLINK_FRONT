import { useMemo, useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import ScreenContainer from '@/components/common/ScreenContainer';
import styled from '@/utils/scale/CustomStyled';
import { Alert, SubmitButton } from '@/components/theme';
import FormInput from '@/components/form/FormInput';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@/types/navigation.ts';
import { useMeQuery } from '@/queries/user.ts';
import { usePatchMyEmailMutation } from '@/mutations/user.ts';
import { checkEmail } from '@/api/user.ts';
import { isNetworkError } from '@/utils/error';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

type EmailEditFormData = {
  email: string;
};

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function EmailEditScreen() {
  const navigation = useNavigation<MainNavigationProp>();
  const { data: meData } = useMeQuery();
  const patchMyEmailMutation = usePatchMyEmailMutation();

  const [emailError, setEmailError] = useState<string | null>(null);

  const defaultValues = useMemo<EmailEditFormData>(() => ({
    email: meData?.email || ''
  }), [meData?.email]);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<EmailEditFormData>({
    defaultValues,
    mode: 'onChange',
  });

  const watchedEmail = watch('email');

  // 이메일이 변경되면 중복 에러 초기화
  useEffect(() => {
    setEmailError(null);
  }, [watchedEmail]);

  const isSubmitDisabled = !isValid || (meData?.email !== undefined && meData?.email === watchedEmail);
  const submitButtonText = '저장';

  const handlePressBack = () => navigation.goBack();

  const handleSubmitEmail = (data: EmailEditFormData) => {
    Alert.show({
      title: '이메일 변경',
      message: '해당 이메일로 변경하시겠습니까?',
      buttons: [
        { text: '취소', type: 'cancel', onPress: () => { } },
        {
          text: '변경', onPress: async () => {
            const trimmedEmail = data.email.trim();

            // 이메일 중복 체크
            try {
              const isDuplicate = await checkEmail(trimmedEmail);
              if (isDuplicate) {
                setEmailError('이미 사용 중인 이메일이에요!');
                return;
              }
            } catch (error) {
              console.error('Failed to check email:', error);
              const errorMsg = isNetworkError(error)
                ? '네트워크 연결을 확인해주세요.'
                : '이메일 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
              setEmailError(errorMsg);
              return;
            }

            try {
              await patchMyEmailMutation.mutateAsync(trimmedEmail);
              navigation.goBack();
            } catch (error) {
              console.error('Failed to update email:', error);
              const errorMsg = isNetworkError(error)
                ? '네트워크 연결을 확인해주세요.'
                : '이메일 저장에 실패했습니다. 잠시 후 다시 시도해주세요.';
              setEmailError(errorMsg);
            }
          }
        },
      ]
    })
  };

  const handlePressSubmit = handleSubmit(handleSubmitEmail);

  return (
    <ScreenContainer
      headerShown={true}
      headerTitle="이메일"
      onPressBack={handlePressBack}
    >
      <Container>
        <KeyboardAwareScrollView
          enableOnAndroid
          keyboardShouldPersistTaps="handled"
          extraScrollHeight={100}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
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
                  errorMessage={emailError || errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            />
          </Content>
        </KeyboardAwareScrollView>

        <Footer>
          <SubmitButton
            onPress={handlePressSubmit}
            width={327}
            disabled={isSubmitDisabled}
            text={submitButtonText}
            bottom={33}
          />
        </Footer>
      </Container>
    </ScreenContainer>
  );
}

const Container = styled.View`
  flex: 1;
  width: 100%;
`;

const Content = styled.View`
  padding: 0 20px;
  margin-top: 20px;
`;

const Footer = styled.View`
  width: 100%;
  height: 82px;
  align-items: center;
  justify-content: flex-end;
`;