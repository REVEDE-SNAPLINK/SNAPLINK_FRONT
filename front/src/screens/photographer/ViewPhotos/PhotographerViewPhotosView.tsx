import ScreenContainer from '@/components/common/ScreenContainer';
import styled from '@/utils/scale/CustomStyled.ts';
import { theme } from '@/theme';
import Typography from '@/components/theme/Typography.tsx';
import SubmitButton from '@/components/theme/SubmitButton.tsx';
import PhotoGrid from '@/components/PhotoGrid.tsx';
import LoadingSpinner from '@/components/LoadingSpinner.tsx';
import { Dimensions } from 'react-native';
import FolderIcon from '@/assets/icons/folder.svg';
import UploadIcon from '@/assets/icons/upload.svg';
import TrashIcon from '@/assets/icons/delete.svg';
import Icon from '@/components/Icon.tsx';
import { BookingZip } from '@/api/bookings.ts';

interface PhotographerViewPhotosViewProps {
  onPressBack: () => void;
  imageURIs: string[];
  checkedImages: boolean[];
  setCheckedImages: (index: number) => void;
  onCheckAllPhotos: () => void;
  onDeletePhotos: () => void;
  onAddImages: () => void;
  onUploadOriginalZip: () => void;
  onDeleteOriginalZip: () => void;
  isLoading?: boolean;
  isDelivered: boolean;
  zipData: BookingZip | null;
  selectedCount: number;
  navigation?: any;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCREEN_PADDING = 20;

export default function PhotographerViewPhotosView({
  onPressBack,
  imageURIs,
  checkedImages,
  setCheckedImages,
  onCheckAllPhotos,
  onDeletePhotos,
  onAddImages,
  onUploadOriginalZip,
  onDeleteOriginalZip,
  isLoading = false,
  isDelivered,
  zipData,
  selectedCount,
  navigation,
}: PhotographerViewPhotosViewProps) {
  const hasPhotos = imageURIs.length > 0;
  const allChecked = checkedImages.length > 0 && checkedImages.every(v => v);

  return (
    <>
      <ScreenContainer
        headerShown={true}
        headerTitle="촬영 사진 관리"
        onPressBack={onPressBack}
        navigation={navigation}
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
          {/* 원본/보정본.zip 업로드 버튼 */}
          <ZipUploadRow>
            <ZipUploadButton onPress={onUploadOriginalZip} disabled={isLoading}>
              <ZipButtonTextWrapper>
                <Icon width={20} height={21} Svg={FolderIcon} />
                <Typography
                  fontSize={12}
                  lineHeight="140%"
                  letterSpacing="-2.5%"
                  marginLeft={10}
                >
                  {zipData ? '원본/보정본.zip (업로드됨)' : '원본/보정본.zip 업로드'}
                </Typography>
              </ZipButtonTextWrapper>
              <Icon width={20} height={21} Svg={UploadIcon} />
            </ZipUploadButton>
            {zipData && (
              <ZipDeleteButton onPress={onDeleteOriginalZip} disabled={isLoading}>
                <Icon width={18} height={18} Svg={TrashIcon} color={theme.colors.error} />
              </ZipDeleteButton>
            )}
          </ZipUploadRow>

          <PhotoGrid
            imageURIs={imageURIs}
            checkedImages={checkedImages}
            setCheckedImage={setCheckedImages}
            addable={hasPhotos || isDelivered}
            onPressAddImage={onAddImages}
            width={SCREEN_WIDTH - SCREEN_PADDING * 2}
          />
        </ContentContainer>

        <SubmitButtonWrapper>
          {!isDelivered ? (
            // 최초 업로드 (사진 없음)
            <SubmitButton
              text="사진 등록하기"
              onPress={onAddImages}
              disabled={isLoading}
            />
          ) : (
            // 업로드 후 or 사진 있음
            <ButtonRow>
              <HalfButton
                onPress={onCheckAllPhotos}
                disabled={isLoading || !hasPhotos}
                $variant="secondary"
              >
                <Typography
                  fontSize={14}
                  fontWeight="bold"
                  color={!hasPhotos ? 'disabled' : 'textPrimary'}
                >
                  {allChecked ? '전체 해제' : '전체 선택'}
                </Typography>
              </HalfButton>
              <HalfButton
                onPress={onDeletePhotos}
                disabled={isLoading || selectedCount === 0}
                $variant="primary"
                $isDisabled={selectedCount === 0}
              >
                <Typography
                  fontSize={14}
                  fontWeight="bold"
                  color={selectedCount === 0 ? 'disabled' : 'white'}
                >
                  선택 사진 삭제
                </Typography>
              </HalfButton>
            </ButtonRow>
          )}
        </SubmitButtonWrapper>
      </ScreenContainer>
      <LoadingSpinner visible={isLoading} />
    </>
  );
}

const PageCaptionWrapper = styled.View`
  width: 100%;
  padding: 0 12px;
  padding-bottom: 19px;
`;

const PageCaption = styled.View`
  width: 100%;
  height: 28px;
  background-color: ${theme.colors.bgSecondary};
  border-radius: 5px;
  justify-content: center;
  padding-left: 6px;
`;

const ContentContainer = styled.View`
  flex: 1;
  width: 100%;
  background-color: ${theme.colors.bgSecondary};
  align-items: center;
  padding-vertical: 15px;
`;

const ZipUploadRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 13px;
  padding-horizontal: ${SCREEN_PADDING}px;
  width: 100%;
`;

const ZipUploadButton = styled.TouchableOpacity`
  flex: 1;
  height: 43px;
  border-radius: 8px;
  background-color: ${theme.colors.bgPrimary};
  border-width: 1px;
  border-style: solid;
  border-color: ${theme.colors.disabled};
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
`;

const ZipButtonTextWrapper = styled.View`
  height: 100%;
  flex-direction: row;
  align-items: center;
`;

const ZipDeleteButton = styled.TouchableOpacity`
  width: 43px;
  height: 43px;
  border-radius: 8px;
  background-color: ${theme.colors.bgPrimary};
  border-width: 1px;
  border-style: solid;
  border-color: ${theme.colors.error};
  align-items: center;
  justify-content: center;
  margin-left: 8px;
`;

const SubmitButtonWrapper = styled.View`
  height: 86px;
  width: 100%;
  justify-content: center;
  padding: 18px 25px;
`;

const ButtonRow = styled.View`
  flex-direction: row;
  gap: 10px;
`;

const HalfButton = styled.TouchableOpacity<{ $variant: 'primary' | 'secondary'; $isDisabled?: boolean }>`
  flex: 1;
  height: 50px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $variant, $isDisabled }) =>
    $isDisabled
      ? theme.colors.bgSecondary
      : $variant === 'primary'
        ? theme.colors.primary
        : theme.colors.bgPrimary};
  border-width: ${({ $variant }) => ($variant === 'secondary' ? '1px' : '0')};
  border-color: ${theme.colors.disabled};
`;
