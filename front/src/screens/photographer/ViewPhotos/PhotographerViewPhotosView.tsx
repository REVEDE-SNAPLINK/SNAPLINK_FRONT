import ScreenContainer from '@/components/ScreenContainer.tsx';
import styled from '@/utils/scale/CustomStyled.ts';
import { theme } from '@/theme';
import Typography from '@/components/theme/Typography.tsx';
import SubmitButton from '@/components/theme/SubmitButton.tsx';
import CrossIcon from '@/assets/icons/cross.svg';
import Icon from '@/components/Icon.tsx';
import { Image } from 'react-native';
import Checkbox from '@/components/Checkbox.tsx';
import { Photo } from '@/types/booking';

const GRID_COLUMNS = 2;
const PHOTO_PADDING = 2;
const CONTAINER_WIDTH = 332;
const PHOTO_SIZE = (CONTAINER_WIDTH - (PHOTO_PADDING * 3)) / GRID_COLUMNS;

interface PhotographerViewPhotosViewProps {
  onPressBack: () => void;
  photos: Photo[];
  selectedPhotoIds: string[];
  onTogglePhotoSelection: (photoId: string) => void;
  onUploadPhotos: () => void;
  onDeletePhotos: () => void;
  isLoading?: boolean;
}

export default function PhotographerViewPhotosView({
  onPressBack,
  photos,
  selectedPhotoIds,
  onTogglePhotoSelection,
  onUploadPhotos,
  onDeletePhotos,
  isLoading = false,
}: PhotographerViewPhotosViewProps) {
  const noneSelected = selectedPhotoIds.length === 0;

  const getButtonText = () => {
    return noneSelected ? '사진 등록하기' : '선택 사진 삭제하기';
  };

  const handleButtonPress = () => {
    if (noneSelected) {
      onUploadPhotos();
    } else {
      onDeletePhotos();
    }
  };

  return (
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
        <PhotoScrollContainer
          nestedScrollEnabled={false}
        >
          <PhotoGrid>
            <PhotoWrapper isSelected={false}>
              <UploadPhotoButton onPress={onUploadPhotos}>
                <Icon width={20} height={20} Svg={CrossIcon} />
              </UploadPhotoButton>
            </PhotoWrapper>
            {photos.map((photo) => {
              const isSelected = selectedPhotoIds.includes(photo.id);
              return (
                <PhotoWrapper key={photo.id} isSelected={isSelected}>
                  <CheckboxWrapper>
                    <Checkbox
                      isChecked={isSelected}
                      onPress={() => onTogglePhotoSelection(photo.id)}
                    />
                  </CheckboxWrapper>
                  <PhotoImage
                    source={{ uri: photo.url }}
                    resizeMode="cover"
                  />
                </PhotoWrapper>
              );
            })}
          </PhotoGrid>
        </PhotoScrollContainer>
      </ContentContainer>
      <SubmitButtonWrapper>
        <SubmitButton
          text={getButtonText()}
          onPress={handleButtonPress}
          disabled={isLoading}
        />
      </SubmitButtonWrapper>
    </ScreenContainer>
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

const PhotoScrollContainer = styled.ScrollView`
  width: ${CONTAINER_WIDTH}px;
`

const PhotoGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-content: space-between;
  width: 100%;
  background-color: ${theme.colors.bgPrimary};
`

const PhotoWrapper = styled.View<{ isSelected: boolean }>`
  width: ${PHOTO_SIZE}px;
  height: ${PHOTO_SIZE}px;
  padding: ${PHOTO_PADDING}px 0;
  border-width: ${({ isSelected }) => isSelected ? '2px' : '0px'};
  border-style: solid;
  border-color: ${({ isSelected }) => isSelected ? theme.colors.primary : 'transparent'};
  border-radius: 4px;
  overflow: hidden;
`

const CheckboxWrapper = styled.View`
  position: absolute;
  top: 9px;
  left: 11px;
  width: 100%;
  height: 100%;
  z-index: 10;
`

const PhotoImage = styled(Image)`
  width: 100%;
  height: 100%;
`

const UploadPhotoButton = styled.TouchableOpacity`
  width: 100%;
  height: 100%;
  border-width: 1px;
  border-style: dashed;
  border-color: #C8C8C8;
  border-radius: 8px;
  justify-content: center;
  align-items: center;
`

const SubmitButtonWrapper = styled.View`
  height: 86px;
  width: 100%;
  justify-content: center;
  padding: 18px 25px;
`
