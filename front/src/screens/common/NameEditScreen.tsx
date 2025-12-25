import { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Platform } from 'react-native';
import ScreenContainer from '@/components/ScreenContainer';
import styled from '@/utils/scale/CustomStyled';
import { SubmitButton, Typography } from '@/components/theme';
import FormInput from '@/components/form/FormInput';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@/types/navigation.ts';

type NameEditFormData = {
  name: string;
};

export default function NameEditScreen() {
  const navigation = useNavigation<MainNavigationProp>();

  const defaultValues = useMemo<NameEditFormData>(() => ({ name: '' }), []);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<NameEditFormData>({
    defaultValues,
    mode: 'onChange',
  });

  const isSubmitDisabled = !isValid;
  const submitButtonText = '저장';

  const handlePressBack = () => navigation.goBack();

  const handleSubmitName = (data: NameEditFormData) => {
    // TODO: API 호출로 이름 수정(예: patchUserProfile)
    // 성공 시 navigation.goBack() 등
    console.log('submit name:', data.name);
  };

  const handlePressSubmit = handleSubmit(handleSubmitName);

  return (
    <ScreenContainer
      headerShown={true}
      headerTitle="이름"
      onPressBack={handlePressBack}
    >
      <KeyboardFormView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollContainer>
          <Content>
            <Controller
              control={control}
              name="name"
              rules={{
                required: '이름을 입력해주세요.',
                validate: (value) => value.trim() !== '' || '이름을 입력해주세요.',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  placeholder="이름 *"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorMessage={errors.name?.message}
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