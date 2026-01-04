import ScreenContainer from '@/components/common/ScreenContainer';
import { SubmitButton, TextInput, Typography } from '@/components/theme';
import ImageUploadInput from '@/components/form/ImageUploadInput.tsx';
import { UploadImageFile } from '@/api/photographers.ts';
import {
  // Dimensions,
  Platform
} from 'react-native';
import styled from '@/utils/scale/CustomStyled.ts';

interface AIRecommdationFormViewProps {
  onPressBack: () => void;
  images: UploadImageFile[];
  onRemoveImage: (index: number) => void;
  onAddImages: (newImages: UploadImageFile[]) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  onPressSubmit: () => void;

  navigation?: any;
}

// const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCREEN_PADDING = 33;

export default function AIRecommdationFormView({
  onPressBack,
  images,
  onRemoveImage,
  onAddImages,
  prompt,
  setPrompt,
  onPressSubmit,
  navigation,
}: AIRecommdationFormViewProps) {
  return (
    <ScreenContainer
      headerTitle="AI 작가 추천"
      onPressBack={onPressBack}
      paddingHorizontal={SCREEN_PADDING}
      alignItemsCenter={false}
      navigation={navigation}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollContainer
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <Typography
            fontSize={16}
            fontWeight="semiBold"
          >
            어떤 컨셉의 사진을 촬영하고 싶나요?
          </Typography>
          <Typography
            fontSize={11}
            marginBottom={11}
          >
            • 촬영과 무관한 내용 등이 나오지 않게 유의해 주세요.
          </Typography>
          <ImageUploadInput
            images={images}
            onRemoveImage={onRemoveImage}
            onAddImages={onAddImages}
            maxLength={1}
            width={337}
          />
          <CaptionWrapper>
            <Typography
              fontSize={16}
              fontWeight="semiBold"
            >
              원하는 촬영 컨셉을 작성해주세요.
            </Typography>
            <Typography
              fontSize={12}
              marginLeft={2}
            >
              (최소 30자)
            </Typography>
          </CaptionWrapper>
          <TextInput
            placeholder="예) 바다나 들판, 공원과 같은 자연 배경에서 일상 스냅 사진을 찍고 싶은데 큰 소품없이 그냥 혼자 인물만 나오게 찍고 싶어요!"
            value={prompt}
            onChangeText={setPrompt}
            maxLength={1000}
            multiline
            height={170}
          />
          <ScrollSpacer />
        </ScrollContainer>
        <SubmitButton
          width="100%"
          text="추천 작가 확인하기"
          onPress={onPressSubmit}
          marginBottom={20}
        />
      </KeyboardAvoidingView>
    </ScreenContainer>
  )
}

const KeyboardAvoidingView = styled.KeyboardAvoidingView`
  flex: 1;
  width: 100%;
`

const ScrollContainer = styled.ScrollView`
  width: 100%;
`

const ScrollSpacer = styled.View`
  height: 50px;
`

const CaptionWrapper = styled.View`
  flex-direction: row;
  align-items: flex-end;
  margin-top: 30px;
  margin-bottom: 16px;
`