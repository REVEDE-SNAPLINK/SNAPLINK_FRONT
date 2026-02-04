import { Control, Controller } from 'react-hook-form';
import styled from '@/utils/scale/CustomStyled';
import ScreenContainer from '@/components/common/ScreenContainer';
import { SubmitButton, Typography } from '@/components/theme';
import ImageUploadInput from '@/components/form/ImageUploadInput';
import { TextInput } from '@/components/theme';
import Checkbox from '@/components/theme/Checkbox';
import { UploadImageFile } from '@/api/photographers';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export interface PortfolioFormData {
  portfolioDescription: string;
  portfolioIsLinked: boolean;
}

interface PortfolioFormViewProps {
  control: Control<PortfolioFormData>;
  photoURIs: UploadImageFile[];
  onRemoveImage: (index: number) => void;
  onAddImages: (images: UploadImageFile[]) => void;
  onPressBack: () => void;
  onPressSubmit: () => void;
  isSubmitDisabled: boolean;
  isEditMode?: boolean;

  navigation?: any;
}

export default function PortfolioFormView({
  control,
  photoURIs,
  onRemoveImage,
  onAddImages,
  onPressBack,
  onPressSubmit,
  isSubmitDisabled,
  isEditMode = false,
  navigation,}: PortfolioFormViewProps) {
  return (
    <ScreenContainer
      headerShown
      headerTitle="포트폴리오 등록"
      onPressBack={onPressBack}
      paddingHorizontal={40}
      iconSize={20}
    
      navigation={navigation}>
      <Container>
        <KeyboardAwareScrollView
          enableOnAndroid
          keyboardShouldPersistTaps="handled"
          extraScrollHeight={100}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <FormContainer>
            <Typography fontSize={18} lineHeight="140%" marginBottom={20}>
              <Typography fontSize={18} fontWeight="semiBold" lineHeight="140%">
                포트폴리오 사진
              </Typography>
              을 등록해 주세요.
            </Typography>
            <ImageUploadInput
              images={photoURIs}
              onRemoveImage={onRemoveImage}
              onAddImages={onAddImages}
            />
            <Typography
              fontSize={16}
              letterSpacing="-2.5%"
              marginBottom={10}
              marginTop={22}
            >
              포트폴리오 게시글 내용을 작성해주세요.
            </Typography>
            <Controller
              control={control}
              name="portfolioDescription"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder="게시글에 작성할 내용을 자유롭게 작성해 주세요."
                  maxLength={200}
                  multiline
                  value={value}
                  onChangeText={onChange}
                  height={115}
                />
              )}
            />
            {!isEditMode && (
              <CheckOptionWrapper>
                <Controller
                  control={control}
                  name="portfolioIsLinked"
                  render={({ field: { onChange, value } }) => (
                    <Checkbox
                      isChecked={value}
                      onPress={() => onChange(!value)}
                    />
                  )}
                />
                <Typography
                  fontSize={12}
                  color="#767676"
                  marginLeft={12}
                >
                  커뮤니티에 함께 게시하기
                </Typography>
              </CheckOptionWrapper>
            )}
            <ScrollViewSpacer />
          </FormContainer>
        </KeyboardAwareScrollView>
        <Footer>
          <SubmitButton
            onPress={onPressSubmit}
            width="100%"
            disabled={isSubmitDisabled}
            text="등록하기"
            marginBottom={10}
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

const FormContainer = styled.View`
  flex: 1;
  width: 100%;
`;

const Footer = styled.View`
  width: 100%;
  padding-top: 20px;
  padding-bottom: 20px;
  align-items: center;
  justify-content: center;
`;

const ScrollViewSpacer = styled.View`
  height: 50px;
`;

const CheckOptionWrapper = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  margin-top: 15px;
`;
