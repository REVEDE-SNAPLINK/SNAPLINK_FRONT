import ScreenContainer from '@/components/ScreenContainer.tsx';
import styled from '@/utils/scale/CustomStyled.ts';
import { theme } from '@/theme';
import Typography from '@/components/theme/Typography.tsx';
import SubmitButton from '@/components/theme/SubmitButton.tsx';
import FolderIcon from '@/assets/icons/folder.svg'
import DownloadIcon from '@/assets/icons/download.svg'
import Icon from '@/components/Icon.tsx';
import { Image } from 'react-native';

const GRID_COLUMNS = 2;
const PHOTO_PADDING = 2;
const CONTAINER_WIDTH = 332;
const PHOTO_SIZE = (CONTAINER_WIDTH - (PHOTO_PADDING * 3)) / GRID_COLUMNS;

export interface Photo {
  id: string;
  url: string;
  type: 'original' | 'edited';
}

interface ViewPhotosViewProps {
  onPressBack: () => void;
  photos: Photo[];
  onDownloadZip: () => void;
  onDownloadAll: () => void;
  isLoading?: boolean;
}

export default function ViewPhotosView({
  onPressBack,
  photos,
  onDownloadZip,
  onDownloadAll,
  isLoading = false,
}: ViewPhotosViewProps) {
  return (
    <ScreenContainer
      headerShown={true}
      headerTitle="촬영 사진 보기"
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
            {' '}･ 사진 관련 문의는 촬영한 작가님에게 연락해주세요.
          </Typography>
        </PageCaption>
      </PageCaptionWrapper>
      <ContentContainer>
        <DownloadButton onPress={onDownloadZip} disabled={isLoading || photos.length === 0}>
          <DownloadButtonTextWrapper>
            <Icon
              width={20}
              height={21}
              Svg={FolderIcon}
            />
            <Typography
              fontSize={12}
              lineHeight="140%"
              letterSpacing="-2.5%"
              marginLeft={10}
            >
              원본/보정본 모음.zip
            </Typography>
          </DownloadButtonTextWrapper>
          <Icon
            width={20}
            height={21}
            Svg={DownloadIcon}
          />
        </DownloadButton>
        <PhotoScrollContainer
          nestedScrollEnabled={false}
        >
          <PhotoGrid>
            {photos.map((photo) => (
              <PhotoWrapper key={photo.id}>
                <PhotoImage
                  source={{ uri: photo.url }}
                  resizeMode="cover"
                />
              </PhotoWrapper>
            ))}
          </PhotoGrid>
        </PhotoScrollContainer>
      </ContentContainer>
      <SubmitButtonWrapper>
        <SubmitButton
          text="사진 전체 다운로드"
          onPress={onDownloadAll}
          disabled={isLoading || photos.length === 0}
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

const DownloadButton = styled.TouchableOpacity`
  width: 339px;
  height: 43px;
  border-radius: 8px;
  background-color: ${theme.colors.bgPrimary};
  border: 1px solid ${theme.colors.disabled};
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 13px;
  padding: 0 15px;
`

const DownloadButtonTextWrapper = styled.View`
  height: 100%;
  flex-direction: row;
  align-items: center;
`

const PhotoScrollContainer = styled.ScrollView`
  width: ${CONTAINER_WIDTH}px;
`

const PhotoGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;
  align-content: space-between;
  width: 100%;
  background-color: ${theme.colors.bgPrimary};
`

const PhotoWrapper = styled.View`
  width: ${PHOTO_SIZE}px;
  height: ${PHOTO_SIZE}px;
  padding: ${PHOTO_PADDING}px 0;
`

const PhotoImage = styled(Image)`
  width: 100%;
  height: 100%;
  border-radius: 4px;
`

const SubmitButtonWrapper = styled.View`
  height: 86px;
  width: 100%;
  justify-content: center;
  padding: 18px 25px;
`