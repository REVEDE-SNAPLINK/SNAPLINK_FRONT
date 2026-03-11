import styled from '@/utils/scale/CustomStyled.ts';
import ScreenContainer from '@/components/layout/ScreenContainer';
import { Typography } from '@/components/ui';
import { CommunityPost } from '@/api/community.ts';
import { ScrollView } from 'react-native';
import ServerImage from '@/components/ui/ServerImage.tsx';

interface MyPostsViewProps {
  posts: CommunityPost[];
  onPressBack: () => void;
  onPressPost: (postId: number) => void;
  navigation?: any;
}

export default function MyPostsView({
  posts,
  onPressBack,
  onPressPost,
  navigation,
}: MyPostsViewProps) {
  return (
    <ScreenContainer
      headerShown={true}
      headerTitle="내 게시글"
      onPressBack={onPressBack}
      navigation={navigation}
    >
      <PostContainer showsVerticalScrollIndicator={false}>
        {posts.map((post) => {
          const postDate = new Date(post.createdAt);
          const formattedDate = `${postDate.getFullYear().toString().slice(2)}.${String(
            postDate.getMonth() + 1
          ).padStart(2, '0')}.${String(postDate.getDate()).padStart(2, '0')}`;

          return (
            <PostItem key={post.id} onPress={() => onPressPost(post.id)}>
              <PostInfoWrapper>
                <Typography fontSize={12} letterSpacing="-2.5%" color="#C8C8C8" marginRight={9.13}>
                  {post.categoryLabel}
                </Typography>
                <Typography fontSize={12} letterSpacing="-2.5%" color="#C8C8C8">
                  {formattedDate}
                </Typography>
              </PostInfoWrapper>
              {post.images.length > 0 && (
                <PostImageWrapper>
                  {post.images.slice(0, 3).map((img, index) => (
                    <PostImage key={index} uri={img.urls} />
                  ))}
                </PostImageWrapper>
              )}
              <Typography fontSize={14} lineHeight="140%" letterSpacing="-2.5%">
                {post.content}
              </Typography>
            </PostItem>
          );
        })}
      </PostContainer>
    </ScreenContainer>
  )
}

const PostContainer = styled(ScrollView)`
  flex: 1;
  width: 100%;
  border-top-width: 1px;
  border-top-color: #C8C8C8;
  border-top-style: solid;
`

const PostItem = styled.Pressable`
  width: 100%;
  padding: 20px;
  border-bottom-width: 1px;
  border-bottom-color: #C8C8C8;
  border-bottom-style: solid;
`

const PostInfoWrapper = styled.View`
  margin-bottom: 10px;
  flex-direction: row;
`

const PostImageWrapper = styled.View`
  flex-direction: row;
  height: 100px;
  margin-bottom: 10px;
`

const PostImage = styled(ServerImage)`
  width: 100px;
  height: 100px;
  margin-right: 10px;
`