import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@/types/navigation.ts';
import MyPostsView from '@/screens/common/MyPosts/MyPostsView.tsx';
import { useMyPostsQuery } from '@/queries/community.ts';

export default function MyPostsContainer() {
  const navigation = useNavigation<MainNavigationProp>();

  // Fetch my posts
  const { data: posts = [] } = useMyPostsQuery();

  const handlePressBack = () => {
    navigation.goBack();
  };

  const handlePressPost = (postId: string) => {
    navigation.navigate('CommunityDetails', { postId });
  };

  return (
    <MyPostsView
      posts={posts}
      onPressBack={handlePressBack}
      onPressPost={handlePressPost}
    />
  );
}
