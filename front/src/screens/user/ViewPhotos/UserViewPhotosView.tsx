import ScreenContainer from '@/components/layout/ScreenContainer';
import styled from '@/utils/scale/CustomStyled.ts';
import { theme } from '@/theme';
import Typography from '@/components/ui/Typography.tsx';
import FolderIcon from '@/assets/icons/folder.svg';
import DownloadIcon from '@/assets/icons/download.svg';
import Icon from '@/components/ui/Icon.tsx';
import PhotoGrid from '@/components/media/PhotoGrid.tsx';
import LoadingSpinner from '@/components/feedback/LoadingSpinner.tsx';
import { Dimensions } from 'react-native';
import { BookingZip } from '@/api/bookings.ts';

interface UserViewPhotosViewProps {
  onPressBack: () => void;
  imageURIs: string[];
  checkedImages: boolean[];
  setCheckedImages: (index: number) => void;
  onCheckAllPhotos: () => void;
  onDownloadZip: () => void;
  onDownloadPhotos: () => void;
  isLoading?: boolean;
  isExpired?: boolean;
  zipData: BookingZip | null;
  hasPhotos: boolean;
  allChecked: boolean;
  selectedCount: number;
  navigation?: any;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCREEN_PADDING = 20;

export default function UserViewPhotosView({
  onPressBack,
  imageURIs,
  checkedImages,
  setCheckedImages,
  onCheckAllPhotos,
  onDownloadZip,
  onDownloadPhotos,
  isLoading = false,
  isExpired = false,
  zipData,
  hasPhotos,
  allChecked,
  selectedCount,
  navigation,
}: UserViewPhotosViewProps) {
  const getCaptionText = () => {
    if (isExpired) {
      return ' ･ 다운로드 기간이 만료되었습니다. 촬영한 작가님에게 문의해주세요.';
    }
    return ' ･ 사진 관련 문의는 촬영한 작가님에게 연락해주세요.';
  };

  const hasZip = zipData !== null;

  return (
    <>
      <ScreenContainer
        headerShown={true}
        headerTitle="촬영 사진 보기"
        onPressBack={onPressBack}
        navigation={navigation}
      >
        <PageCaptionWrapper>
          <PageCaption $isExpired={isExpired}>
            <Typography
              fontSize={11}
              lineHeight="160%"
              letterSpacing="-2.5%"
              color={isExpired ? 'error' : 'textSecondary'}
            >
              {getCaptionText()}
            </Typography>
          </PageCaption>
        </PageCaptionWrapper>
        <ContentContainer>
          {/* 원본/보정본.zip 다운로드 버튼 */}
          <ZipDownloadRow>
            <ZipDownloadButton
              onPress={onDownloadZip}
              disabled={isLoading || !hasZip || isExpired}
              $isDisabled={!hasZip}
            >
              <ZipButtonTextWrapper>
                <Icon
                  width={20}
                  height={21}
                  Svg={FolderIcon}
                  color={!hasZip ? theme.colors.disabled : undefined}
                />
                <Typography
                  fontSize={12}
                  lineHeight="140%"
                  letterSpacing="-2.5%"
                  marginLeft={10}
                  color={!hasZip ? 'disabled' : 'textPrimary'}
                >
                  {hasZip ? '원본/보정본.zip' : '원본/보정본.zip (없음)'}
                </Typography>
              </ZipButtonTextWrapper>
              <Icon
                width={20}
                height={21}
                Svg={DownloadIcon}
                color={!hasZip ? theme.colors.disabled : undefined}
              />
            </ZipDownloadButton>
          </ZipDownloadRow>

          <PhotoGrid
            imageURIs={imageURIs}
            checkedImages={checkedImages}
            setCheckedImage={setCheckedImages}
            width={SCREEN_WIDTH - SCREEN_PADDING * 2}
          />
        </ContentContainer>

        <SubmitButtonWrapper>
          <ButtonRow>
            <HalfButton
              onPress={onCheckAllPhotos}
              disabled={isLoading || !hasPhotos || isExpired}
              $variant="secondary"
            >
              <Typography
                fontSize={14}
                fontWeight="bold"
                color={!hasPhotos || isExpired ? 'disabled' : 'textPrimary'}
              >
                {allChecked ? '전체 해제' : '전체 선택'}
              </Typography>
            </HalfButton>
            <HalfButton
              onPress={onDownloadPhotos}
              disabled={isLoading || !hasPhotos || isExpired || selectedCount === 0}
              $variant="primary"
              $isDisabled={!hasPhotos || isExpired || selectedCount === 0}
            >
              <Typography
                fontSize={14}
                fontWeight="bold"
                color={!hasPhotos || isExpired || selectedCount === 0 ? 'disabled' : 'white'}
              >
                선택 사진 다운로드
              </Typography>
            </HalfButton>
          </ButtonRow>
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

const PageCaption = styled.View<{ $isExpired?: boolean }>`
  width: 100%;
  height: 28px;
  background-color: ${({ $isExpired }) => ($isExpired ? '#FFF0F0' : theme.colors.bgSecondary)};
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

const ZipDownloadRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 13px;
  padding-horizontal: ${SCREEN_PADDING}px;
  width: 100%;
`;

const ZipDownloadButton = styled.TouchableOpacity<{ $isDisabled?: boolean }>`
  flex: 1;
  height: 43px;
  border-radius: 8px;
  background-color: ${({ $isDisabled }) =>
    $isDisabled ? theme.colors.bgSecondary : theme.colors.bgPrimary};
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
