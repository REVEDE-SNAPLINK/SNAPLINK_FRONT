import { useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Platform } from 'react-native';
import ScreenContainer from '@/components/ScreenContainer';
import styled from '@/utils/scale/CustomStyled';
import { SubmitButton, Typography } from '@/components/theme';
import FormInput from '@/components/form/FormInput';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@/types/navigation.ts';

type NicknameEditFormData = {
  nickname: string;
};

export default function NicknameEditScreen() {
  const navigation = useNavigation<MainNavigationProp>();

  const defaultValues = useMemo<NicknameEditFormData>(() => ({ nickname: '' }), []);

  const [nicknameError, setNicknameError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm<NicknameEditFormData>({
    defaultValues,
    mode: 'onChange',
  });

  const isSubmitDisabled = !isValid;
  const submitButtonText = '저장';

  const handlePressBack = () => navigation.goBack();

  const handleChangeNickname = (text: string, onChange: (v: string) => void) => {
    // 서버에서 온 에러(중복 등)를 사용자가 수정하면 지워주기
    if (nicknameError) setNicknameError(null);
    if (errors.nickname) clearErrors('nickname');
    onChange(text);
  };

  const handleSubmitNickname = async (data: NicknameEditFormData) => {
    const value = data.nickname.trim();

    // 1) 클라이언트 1차 검증(필요하면 더 추가)
    if (!value) {
      setError('nickname', { type: 'validate', message: '닉네임을 입력해주세요.' });
      return;
    }

    try {
      // TODO: API 호출로 닉네임 수정(예: patchUserProfile)
      // await patchNickname(value)

      console.log('submit nickname:', value);
      // 성공 시 goBack()
    } catch (e: any) {
      // 2) 서버 에러(중복 닉네임 등) 표기 예시
      // - 서버 에러 메시지를 그대로 쓰거나 매핑
      const message = e?.message ?? '닉네임을 저장할 수 없어요. 잠시 후 다시 시도해주세요.';
      setNicknameError(message);
    }
  };

  const handlePressSubmit = handleSubmit(handleSubmitNickname);

  return (
    <ScreenContainer
      headerShown={true}
      headerTitle="닉네임"
      onPressBack={handlePressBack}
    >
      <KeyboardFormView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollContainer>
          <Content>
            <Controller
              control={control}
              name="nickname"
              rules={{
                required: '닉네임을 입력해주세요.',
                validate: (value) => value.trim() !== '' || '닉네임을 입력해주세요.',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  placeholder="닉네임 *"
                  value={value}
                  onChangeText={(text) => handleChangeNickname(text, onChange)}
                  onBlur={onBlur}
                  errorMessage={nicknameError || errors.nickname?.message}
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