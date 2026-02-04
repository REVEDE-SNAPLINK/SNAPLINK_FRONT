import { useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import ScreenContainer from '@/components/common/ScreenContainer';
import styled from '@/utils/scale/CustomStyled';
import { Alert, SubmitButton } from '@/components/theme';
import FormInput from '@/components/form/FormInput';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@/types/navigation.ts';
import { useMeQuery } from '@/queries/user.ts';
import { usePatchMyNicknameMutation } from '@/mutations/user.ts';
import { checkNickname } from '@/api/user.ts';
import { isNetworkError } from '@/utils/error';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

type NicknameEditFormData = {
  nickname: string;
};

export default function NicknameEditScreen() {
  const navigation = useNavigation<MainNavigationProp>();
  const { data: meData } = useMeQuery();
  const patchMyNicknameMutation = usePatchMyNicknameMutation();

  const defaultValues = useMemo<NicknameEditFormData>(() => ({
    nickname: meData?.nickname || ''
  }), [meData?.nickname]);

  const [nicknameError, setNicknameError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    watch,
    formState: { errors, isValid },
  } = useForm<NicknameEditFormData>({
    defaultValues,
    mode: 'onChange',
  });

  const watchedNickname = watch('nickname')

  const isSubmitDisabled = !isValid || (meData?.nickname !== undefined && meData?.nickname === watchedNickname);
  const submitButtonText = '저장';

  const handlePressBack = () => navigation.goBack();

  const handleChangeNickname = (text: string, onChange: (v: string) => void) => {
    // 서버에서 온 에러(중복 등)를 사용자가 수정하면 지워주기
    if (nicknameError) setNicknameError(null);
    if (errors.nickname) clearErrors('nickname');
    onChange(text);
  };

  const handleSubmitNickname = (data: NicknameEditFormData) => {
    Alert.show({
      title: '닉네임 변경',
      message: '해당 닉네임으로 변경하시겠습니까?',
      buttons: [
        { text: '취소', type: 'cancel', onPress: () => { } },
        {
          text: '변경', onPress: async () => {
            const value = data.nickname.trim();

            if (!value) {
              setError('nickname', { type: 'validate', message: '닉네임을 입력해주세요.' });
              return;
            }

            // 닉네임 중복 체크
            try {
              const isDuplicate = await checkNickname(value);
              if (isDuplicate) {
                setNicknameError('이미 사용 중인 닉네임이에요!');
                return;
              }
            } catch (error) {
              console.error('Failed to check nickname:', error);
              const errorMsg = isNetworkError(error)
                ? '네트워크 연결을 확인해주세요.'
                : '닉네임 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
              setNicknameError(errorMsg);
              return;
            }

            try {
              await patchMyNicknameMutation.mutateAsync(value);
              navigation.goBack();
            } catch (e: any) {
              const errorMsg = isNetworkError(e)
                ? '네트워크 연결을 확인해주세요.'
                : '닉네임 저장에 실패했습니다. 잠시 후 다시 시도해주세요.';
              setNicknameError(errorMsg);
            }
          }
        },
      ]
    })
  };

  const handlePressSubmit = handleSubmit(handleSubmitNickname);

  return (
    <ScreenContainer
      headerShown={true}
      headerTitle="닉네임"
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