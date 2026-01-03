import ScreenContainer from '@/components/common/ScreenContainer';
import styled from '@/utils/scale/CustomStyled.ts';
import { theme } from '@/theme';
import Typography from '@/components/theme/Typography.tsx';
import SubmitButton from '@/components/theme/SubmitButton.tsx';
import PhotoGrid from '@/components/PhotoGrid.tsx';
import LoadingSpinner from '@/components/LoadingSpinner.tsx';

interface PhotographerViewPhotosViewProps {
  onPressBack: () => void;
  imageURIs: string[];
  checkedImages: boolean[];
  setCheckedImages: (index: number) => void;
  onUploadPhotos: () => void;
  onDeletePhotos: () => void;
  onAddImages?: () => void;
  isLoading?: boolean;
}

export default function PhotographerViewPhotosView({
  onPressBack,
  imageURIs,
  checkedImages,
  setCheckedImages,
  onUploadPhotos,
  onDeletePhotos,
  onAddImages,
  isLoading = false,
}: PhotographerViewPhotosViewProps) {
  const getButtonText = () => {
    return imageURIs.length > 0 ? '선택 사진 삭제하기' : '사진 등록하기';
  };

  const handleButtonPress = () => {
    if (imageURIs.length > 0) {
      onDeletePhotos();
    } else {
      onUploadPhotos();
    }
  };

  const handleAddImage = () => {
    if (onAddImages) {
      onAddImages();
    } else {
      onUploadPhotos();
    }
  };

  return (
    <>
      <ScreenContainer
        headerShown={true}
        headerTitle="촬영 사진 관리"
        onPressBack={onPressBack}
      >
        <PageCaptionWrapper>
          <PageCaption>
            <Typography
              fontSize={11}
              lineHeight="160%"
              letterSpacing="-2.5%"
              color="textSecondary"
            >
              {' '}･ 사진을 업로드하면 고객이 다운로드할 수 있습니다.
            </Typography>
          </PageCaption>
        </PageCaptionWrapper>
        <ContentContainer>
          <PhotoGrid
            imageURIs={imageURIs}
            checkedImages={checkedImages}
            setCheckedImage={setCheckedImages}
            addable={imageURIs.length > 0 && !isLoading}
            onPressAddImage={handleAddImage}
            width={332}
          />
        </ContentContainer>
        <SubmitButtonWrapper>
          <SubmitButton
            text={getButtonText()}
            onPress={handleButtonPress}
            disabled={isLoading || (imageURIs.length > 0 && checkedImages.filter((v) => v).length === 0)}
          />
        </SubmitButtonWrapper>
      </ScreenContainer>
      <LoadingSpinner visible={isLoading} />
    </>
  )
}

const PageCaptionWrapper = styled.View`
  width: 100%;
  padding: 0 12px;
  padding-bottom: 19px;
`

const PageCaption = styled.View`
  width: 100%;
  height: 28px;
  background-color: ${theme.colors.bgSecondary};
  border-radius: 5px;
  justify-content: center;
  padding-left: 6px;
`

const ContentContainer = styled.View`
  flex: 1;
  width: 100%;
  background-color: ${theme.colors.bgSecondary};
  align-items: center;
  padding-vertical: 15px;
`

const SubmitButtonWrapper = styled.View`
  height: 86px;
  width: 100%;
  justify-content: center;
  padding: 18px 25px;
`
