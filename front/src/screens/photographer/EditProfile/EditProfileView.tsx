import React from 'react';
import { Control, Controller } from 'react-hook-form';
import styled from '@/utils/scale/CustomStyled.ts';
import { SubmitButton, Typography } from '@/components/ui';
import ScreenContainer from '@/components/layout/ScreenContainer';
import { Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import TextInput from '@/components/ui/TextInput.tsx';
import ProfileImageUpload from '@/components/media/ProfileImageUpload.tsx';

export interface EditProfileFormData {
  description: string;
}

interface EditProfileViewProps {
  control: Control<EditProfileFormData>;
  onPressBack: () => void;
  onPressSubmit: () => void;
  isSubmitDisabled: boolean;
  profileImageURI?: string;
  onProfileImageUpload: () => void;
  navigation?: any;
}

const TITLE_FONT_SIZE = 16;
const CAPTION_FONT_SIZE = 14;

export default function EditProfileView({
  control,
  onPressBack,
  onPressSubmit,
  isSubmitDisabled,
  profileImageURI,
  onProfileImageUpload,
  navigation,
}: EditProfileViewProps) {
  const scrollRef = React.useRef<any>(null);

  return (
    <ScreenContainer
      headerShown
      headerTitle="프로필 수정"
      onPressBack={onPressBack}
      paddingHorizontal={16}
      alignItemsCenter={false}
      navigation={navigation}
    >
      <KeyboardFormView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <KeyboardAwareScrollView
          ref={scrollRef}
          enableOnAndroid
          keyboardShouldPersistTaps="handled"
          extraScrollHeight={20}
          contentContainerStyle={{
            alignItems: 'stretch',
          }}
        >
          <FormContainer>
            <Typography fontSize={TITLE_FONT_SIZE} lineHeight="140%">
              <Typography fontSize={TITLE_FONT_SIZE} fontWeight="semiBold" lineHeight="140%">
                포트폴리오 프로필
              </Typography>
              을 채워주세요.
            </Typography>
            <ProfileImageUpload
              imageURI={profileImageURI}
              onPress={onProfileImageUpload}
              marginTop={40}
              marginBottom={40}
            />
            <Typography
              fontSize={CAPTION_FONT_SIZE}
              letterSpacing="-2.5%"
              marginBottom={10}
            >
              작가님을 표현할 한 줄 소개를 입력해주세요.
            </Typography>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder="작가님을 표현할 수 있는 주 촬영 컨셉, MBTI 등등 자유롭게 내용을 작성해 주세요."
                  value={value}
                  onChangeText={onChange}
                  multiline
                  height={115}
                  maxLength={200}
                />
              )}
            />
          </FormContainer>
        </KeyboardAwareScrollView>
      </KeyboardFormView>
      <Footer>
        <SubmitButton
          onPress={onPressSubmit}
          width="100%"
          disabled={isSubmitDisabled}
          text="완료하기"
          marginBottom={10}
        />
      </Footer>
    </ScreenContainer>
  );
}

const KeyboardFormView = styled.KeyboardAvoidingView`
  flex: 1;
  width: 100%;
`

const FormContainer = styled.View`
  width: 100%;
  align-self: stretch;
`;

const Footer = styled.View`
  width: 100%;
  padding-top: 20px;
  padding-bottom: 20px;
  align-items: center;
  justify-content: center;
`
