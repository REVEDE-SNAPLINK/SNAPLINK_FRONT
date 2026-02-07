import { useCallback, useState, useEffect } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation';
import PostDetailView from './PostDetailView';
import { usePortfolioPostQuery } from '@/queries/photographers';
import { useAuthStore } from '@/store/authStore.ts';
import { useDeletePortfolioMutation } from '@/mutations/photographers';
import { Alert } from '@/components/theme';
import { showErrorAlert } from '@/utils/error';

import analytics from '@react-native-firebase/analytics';
import { Share } from 'react-native';

type PostDetailRouteProp = RouteProp<MainStackParamList, 'PostDetail'>;

export default function PostDetailContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<PostDetailRouteProp>();
  const { postId, profileImageURI, source } = route.params;
  const { userId, userType } = useAuthStore();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isMoreModalVisible, setIsMoreModalVisible] = useState<boolean>(false);

  const { data: post, isLoading } = usePortfolioPostQuery(postId);
  const { mutate: deletePortfolio } = useDeletePortfolioMutation(postId, post?.photographerId);

  const isMyPost = userId === post?.photographerId;

  useEffect(() => {
    if (!post) return;

    analytics().logEvent('portfolio_post_view', {
      screen_name: 'PostDetail',
      user_id: userId || 'anonymous',
      user_type: userType || 'guest',
      post_id: postId,
      photographer_id: post.photographerId,
      source: source || 'unknown', // 유입 경로 로깅
    });
  }, [post, postId, userId, userType, source]);

  const handlePressBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.reset({ index: 1, routes: [{ name: 'Home' }, { name: 'PhotographerDetails', params: { photographerId: post?.photographerId ?? '', source: source ? `post_detail_via_${source}` : 'post_detail' } }] });
    }
  }, [navigation, post, source]);

  const handlePressMore = () => {
    setIsMoreModalVisible(true);
  }

  const handleCloseMoreModal = () => {
    setIsMoreModalVisible(false);
  }

  const handleEditPost = () => {
    setIsMoreModalVisible(false);
    navigation.navigate('PortfolioForm', { postId });
  }

  const handleDeletePost = () => {
    setIsMoreModalVisible(false);

    Alert.show({
      title: '포트폴리오 삭제',
      message: '정말로 이 포트폴리오를 삭제하시겠습니까?',
      buttons: [
        { text: '취소', type: 'cancel', onPress: () => { } },
        {
          text: '삭제',
          type: 'destructive',
          onPress: () => {
            deletePortfolio(undefined, {
              onSuccess: () => {
                analytics().logEvent('portfolio_post_deleted', {
                  user_id: userId || '',
                  user_type: userType || 'guest',
                  post_id: postId,
                });

                Alert.show({
                  title: '삭제 완료',
                  message: '포트폴리오가 삭제되었습니다.',
                  buttons: [
                    {
                      text: '확인',
                      onPress: () => navigation.goBack(),
                    },
                  ],
                });
              },
              onError: (error) => {
                showErrorAlert({
                  title: '삭제 실패',
                  action: '포트폴리오 삭제',
                  error,
                });
              },
            });
          },
        },
      ],
    });
  }

  const handleSharePost = () => {
    const params = new URLSearchParams();
    params.append('profileImageURI', profileImageURI);
    if (post) {
      Share.share({
        message: `${post.content.substring(0, 10) + "..."}\nhttps://link.snaplink.run/tab/home/portfolio/${postId}?${params}`,
      });
    }
  }

  return (
    <PostDetailView
      post={post}
      isMyPost={isMyPost}
      isLoading={isLoading}
      onPressBack={handlePressBack}
      profileImageURI={profileImageURI}
      currentIndex={currentIndex}
      setCurrentIndex={setCurrentIndex}
      showMoreModal={isMoreModalVisible}
      onPressMore={handlePressMore}
      onCloseMoreModal={handleCloseMoreModal}
      onSharePost={handleSharePost}
      onEditPost={handleEditPost}
      onDeletePost={handleDeletePost}
      navigation={navigation}
    />
  );
}
