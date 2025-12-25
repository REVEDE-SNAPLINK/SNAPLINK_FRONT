import React, { useState, useCallback } from 'react';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { MainStackParamList, MainNavigationProp } from '@/types/navigation';
import PostDetailView from './PostDetailView';

type PostDetailRouteProp = RouteProp<MainStackParamList, 'PostDetail'>;

export default function PostDetailContainer() {
  const route = useRoute<PostDetailRouteProp>();
  const navigation = useNavigation<MainNavigationProp>();
  const { postId } = route.params;

  const [isLiked, setIsLiked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showMoreModal, setShowMoreModal] = useState(false);

  // TODO: API 연결 후 실제 데이터로 교체
  const tempPostData = {
    id: postId,
    author: {
      id: 'photographer-1',
      name: '작가 이름',
      profileImage: 'https://picsum.photos/100',
    },
    images: [
      'https://picsum.photos/400',
      'https://picsum.photos/401',
      'https://picsum.photos/402',
    ],
    content: '게시글 내용입니다. 이곳에 작가가 작성한 게시글 내용이 표시됩니다.',
    likeCount: 128,
    createdAt: '2025.12.25',
  };

  const handlePressBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handlePressMore = useCallback(() => {
    setShowMoreModal(true);
  }, []);

  const handleCloseMoreModal = useCallback(() => {
    setShowMoreModal(false);
  }, []);

  const handlePressLike = useCallback(() => {
    setIsLiked((prev) => !prev);
    // TODO: API call to toggle like
  }, []);

  const handlePressFavorite = useCallback(() => {
    setIsFavorite((prev) => !prev);
    // TODO: API call to toggle favorite
  }, []);

  const handlePressInquiry = useCallback(() => {
    // TODO: Navigate to inquiry screen
    console.log('Navigate to inquiry');
  }, []);

  const handlePressReservation = useCallback(() => {
    // TODO: Navigate to reservation screen
    console.log('Navigate to reservation');
  }, []);

  return (
    <PostDetailView
      post={tempPostData}
      isLiked={isLiked}
      isFavorite={isFavorite}
      showMoreModal={showMoreModal}
      onPressBack={handlePressBack}
      onPressMore={handlePressMore}
      onCloseMoreModal={handleCloseMoreModal}
      onPressLike={handlePressLike}
      onPressFavorite={handlePressFavorite}
      onPressInquiry={handlePressInquiry}
      onPressReservation={handlePressReservation}
    />
  );
}
