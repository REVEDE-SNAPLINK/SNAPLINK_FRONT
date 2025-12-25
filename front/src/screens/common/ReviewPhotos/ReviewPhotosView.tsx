import ScreenContainer from '@/components/ScreenContainer.tsx';
import styled from '@/utils/scale/CustomStyled.ts';
import { Dimensions, FlatList } from 'react-native';
import { ReviewPhoto } from '@/api/review.ts';

interface ReviewPhotosViewProps {
  photos: ReviewPhoto[];
  onPressBack: () => void;
  onPressPhoto: (photoId: string) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const IMAGE_SIZE = SCREEN_WIDTH / NUM_COLUMNS;

export default function ReviewPhotosView({
  photos,
  onPressBack,
  onPressPhoto,
}: ReviewPhotosViewProps) {
  return (
    <ScreenContainer
      onPressBack={onPressBack}
      headerShown={true}
      headerTitle="포토 리뷰 전체보기"
    >
      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLUMNS}
        renderItem={({ item }) => (
          <PhotoButton onPress={() => onPressPhoto(item.id)}>
            <Photo source={{ uri: item.url }} />
          </PhotoButton>
        )}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

const PhotoButton = styled.TouchableOpacity`
  width: ${IMAGE_SIZE}px;
  height: ${IMAGE_SIZE}px;
`;

const Photo = styled.Image`
  width: 100%;
  height: 100%;
  background-color: #cccccc;
`;