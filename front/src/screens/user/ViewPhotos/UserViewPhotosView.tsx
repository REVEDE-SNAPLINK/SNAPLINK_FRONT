import ScreenContainer from '@/components/common/ScreenContainer';
import styled from '@/utils/scale/CustomStyled.ts';
import { theme } from '@/theme';
import Typography from '@/components/theme/Typography.tsx';
import SubmitButton from '@/components/theme/SubmitButton.tsx';
import FolderIcon from '@/assets/icons/folder.svg'
import DownloadIcon from '@/assets/icons/download.svg'
import Icon from '@/components/Icon.tsx';
import PhotoGrid from '@/components/PhotoGrid.tsx';
import LoadingSpinner from '@/components/LoadingSpinner.tsx';
import { Dimensions } from 'react-native';

interface UserViewPhotosViewProps {
  onPressBack: () => void;
  imageURIs: string[];
  checkedImages: boolean[];
  setCheckedImages: (index: number) => void;
  onDownloadZip: () => void;
  onDownloadPhotos: () => void;
  isLoading?: boolean;

  navigation?: any;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCREEN_PADDING = 20;

export default function UserViewPhotosView({
  onPressBack,
  imageURIs,
  checkedImages,
  setCheckedImages,
  onDownloadZip,
  onDownloadPhotos,
  isLoading = false,
  navigation,}: UserViewPhotosViewProps) {
  const hasCheckedImages = checkedImages.filter((v) => v).length === 0;

  const getButtonText = () => {
    return imageURIs.length > 0 && hasCheckedImages ? '전체 사진 다운로드' : '선택 사진 다운로드';
  };

  return (
    <>
      <ScreenContainer
        headerShown={true}
        headerTitle="촬영 사진 보기"
        onPressBack={onPressBack}
      
      navigation={navigation}>
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
          <DownloadButton onPress={onDownloadZip} disabled={isLoading || imageURIs.length === 0}>
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
          <PhotoGrid
            imageURIs={imageURIs}
            checkedImages={checkedImages}
            setCheckedImage={setCheckedImages}
            width={SCREEN_WIDTH - SCREEN_PADDING * 2}
          />
        </ContentContainer>
        <SubmitButtonWrapper>
          <SubmitButton
            text={getButtonText()}
            onPress={onDownloadPhotos}
            disabled={isLoading || imageURIs.length === 0}
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

const DownloadButton = styled.TouchableOpacity`
  width: 339px;
  height: 43px;
  border-radius: 8px;
  background-color: ${theme.colors.bgPrimary};
  border-width: 1px;
  border-style: solid;
  border-color: ${theme.colors.disabled};
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

const SubmitButtonWrapper = styled.View`
  height: 86px;
  width: 100%;
  justify-content: center;
  padding: 18px 25px;
`
