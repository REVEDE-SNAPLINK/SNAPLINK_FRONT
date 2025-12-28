import ScreenContainer from '@/components/common/ScreenContainer';
import styled from '@/utils/scale/CustomStyled.ts';
import { Dimensions, FlatList } from 'react-native';
import ServerImage from '@/components/ServerImage.tsx';
import PhotoViewerModal from '@/components/common/PhotoViewerModal.tsx';
import LoadingSpinner from '@/components/LoadingSpinner.tsx';

interface ReviewPhotosViewProps {
  photos: string[];
  onPressBack: () => void;
  onPressPhoto: (photoUrl: string) => void;
  selectedPhotoIndex: number | null;
  onCloseModal: () => void;
  onLoadMore: () => void;
  isFetchingNextPage: boolean;
  isLoading: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const IMAGE_SIZE = SCREEN_WIDTH / NUM_COLUMNS;

export default function ReviewPhotosView({
  photos,
  onPressBack,
  onPressPhoto,
  selectedPhotoIndex,
  onCloseModal,
  onLoadMore,
  isFetchingNextPage,
  isLoading,
}: ReviewPhotosViewProps) {
  return (
    <>
      <ScreenContainer
        onPressBack={onPressBack}
        headerShown={true}
        headerTitle="포토 리뷰 전체보기"
      >
        <FlatList
          data={photos}
          keyExtractor={(item, index) => `${item}-${index}`}
          numColumns={NUM_COLUMNS}
          renderItem={({ item }) => (
            <PhotoButton onPress={() => onPressPhoto(item)}>
              <Photo uri={item} />
            </PhotoButton>
          )}
          showsVerticalScrollIndicator={false}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.5}
        />
      </ScreenContainer>

      <PhotoViewerModal
        visible={selectedPhotoIndex !== null}
        photos={photos}
        initialIndex={selectedPhotoIndex ?? 0}
        onClose={onCloseModal}
        onLoadMore={onLoadMore}
        isLoading={isFetchingNextPage}
      />

      <LoadingSpinner visible={isLoading} />
    </>
  );
}

const PhotoButton = styled.TouchableOpacity`
  width: ${IMAGE_SIZE}px;
  height: ${IMAGE_SIZE}px;
`;

const Photo = styled(ServerImage)`
  width: 100%;
  height: 100%;
  background-color: #cccccc;
`;