import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@/types/navigation.ts';
import MyPostsView from '@/screens/common/MyPosts/MyPostsView.tsx';
import { useMyPostsInfiniteQuery } from '@/queries/community.ts';
import type { GetCommunityPostsResponse } from '@/api/community.ts';

export default function MyPostsContainer() {
  const navigation = useNavigation<MainNavigationProp>();

  // Fetch my posts
  const { data, isLoading, error } = useMyPostsInfiniteQuery({ size: 10 });

  console.log(data);

  const handlePressBack = () => {
    navigation.goBack();
  };

  const handlePressPost = (postId: number) => {
    navigation.navigate('CommunityDetails', { postId });
  };

  // Transform InfiniteQuery data
  const pages = (data?.pages || []) as GetCommunityPostsResponse[];
  const allPosts = pages.flatMap((page) => page.content);

  // 로딩 상태
  if (isLoading) {
    return (
      <MyPostsView
        posts={[]}
        onPressBack={handlePressBack}
        onPressPost={handlePressPost}
      navigation={navigation}
    />
    );
  }

  // 에러 상태
  if (error) {
    console.error('Failed to load my posts:', error);
  }

  return (
    <MyPostsView
      posts={allPosts}
      onPressBack={handlePressBack}
      onPressPost={handlePressPost}
      navigation={navigation}
    />
  );
}
