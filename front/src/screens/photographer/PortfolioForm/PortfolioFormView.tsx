import { Platform } from 'react-native';
import { Control, Controller } from 'react-hook-form';
import styled from '@/utils/scale/CustomStyled';
import ScreenContainer from '@/components/common/ScreenContainer';
import { SubmitButton, Typography } from '@/components/theme';
import ImageUploadInput from '@/components/form/ImageUploadInput';
import { TextInput } from '@/components/theme';
import Checkbox from '@/components/theme/Checkbox';
import { UploadImageFile } from '@/api/photographers';

export interface PortfolioFormData {
  portfolioTitle: string;
  portfolioDescription: string;
  portfolioIsLinked: boolean;
}

interface PortfolioFormViewProps {
  control: Control<PortfolioFormData>;
  photoURIs: UploadImageFile[];
  onRemoveImage: (index: number) => void;
  onAddImages: () => void;
  onPressBack: () => void;
  onPressSubmit: () => void;
  isSubmitDisabled: boolean;

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
  navigation,}: PortfolioFormViewProps) {
  return (
    <ScreenContainer
      headerShown
      headerTitle="포트폴리오 등록"
      onPressBack={onPressBack}
      paddingHorizontal={40}
      iconSize={20}
    
      navigation={navigation}>
      <KeyboardFormView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollContainer
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          scrollEventThrottle={16}
        >
          <FormContainer>
            <Typography fontSize={18} lineHeight="140%" marginBottom={20}>
              <Typography fontSize={18} fontWeight="semiBold" lineHeight="140%">
                포트폴리오 사진
              </Typography>
              을 등록해 주세요.
            </Typography>
            <Typography
              fontSize={12}
              letterSpacing={0.2}
              marginBottom={12}
              color="#737373"
            >
              *최초 등록은 1장만 업로드해도 포트폴리오 등록이 완료됩니다.
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
              커뮤니티 게시글 제목
            </Typography>
            <Controller
              control={control}
              name="portfolioTitle"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder="게시글 제목"
                  value={value}
                  onChangeText={onChange}
                />
              )}
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
            <ScrollViewSpacer />
          </FormContainer>
        </ScrollContainer>
        <Footer>
          <SubmitButton
            onPress={onPressSubmit}
            width="100%"
            disabled={isSubmitDisabled}
            text="등록하기"
            marginBottom={10}
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
  padding-bottom: 120px;
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
