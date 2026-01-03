import { useCallback, useState } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation';
import PostDetailView from './PostDetailView';
import { usePortfolioPostQuery } from '@/queries/photographers';

type PostDetailRouteProp = RouteProp<MainStackParamList, 'PostDetail'>;

export default function PostDetailContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<PostDetailRouteProp>();
  const { postId, profileImageURI } = route.params;

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isMoreModalVisible, setIsMoreModalVisible] = useState<boolean>(false);

  const { data: post, isLoading } = usePortfolioPostQuery(postId);

  const handlePressBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handlePressMore = () => {
    setIsMoreModalVisible(true);
  }

  const handleCloseMoreModal = () => {
    setIsMoreModalVisible(false);
  }

  return (
    <PostDetailView
      post={post}
      isLoading={isLoading}
      onPressBack={handlePressBack}
      profileImageURI={profileImageURI}
      currentIndex={currentIndex}
      setCurrentIndex={setCurrentIndex}
      showMoreModal={isMoreModalVisible}
      onPressMore={handlePressMore}
      onCloseMoreModal={handleCloseMoreModal}
    />
  );
}
