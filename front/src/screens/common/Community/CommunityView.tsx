import ScreenContainer from '@/components/ScreenContainer.tsx';
import Icon from '@/components/Icon.tsx';
import styled from '@/utils/scale/CustomStyled.ts';
import { theme } from '@/theme';
import Typography from '@/components/theme/Typography.tsx';
import SwapIcon from '@/assets/icons/swap.svg';
import SearchIcon from '@/assets/icons/search.svg';
import NotificationIcon from '@/assets/icons/notification.svg';
import IconButton from '@/components/IconButton.tsx';
import { Dimensions, FlatList } from 'react-native';
import HeartRedIcon from '@/assets/icons/heart-red.svg';
import HeartIcon from '@/assets/icons/heart-black.svg';
import ChatIcon from '@/assets/icons/chat-blank-black.svg';
import CrossIcon from '@/assets/icons/cross-white.svg';
import { CommunityPost, COMMUNITY_CATEGORY_ENUM, COMMUNITY_CATEGORIES } from '@/api/community.ts';

interface CommunityViewProps {
  posts: CommunityPost[];
  totalCount: number;
  selectedCategory: COMMUNITY_CATEGORY_ENUM | undefined;
  sortBy: 'recommended' | 'latest';
  searchKey: string;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  onChangeSearchKey: (key: string) => void;
  onSubmitSearch: () => void;
  onPressNotification: () => void;
  onPressTab: (category: COMMUNITY_CATEGORY_ENUM) => void;
  onToggleSort: () => void;
  onPressPost: (postId: string) => void;
  onPressLike: (postId: string) => void;
  onPressWritePost: () => void;
  onLoadMore?: () => void;
}

const CATEGORIES = Object.entries(COMMUNITY_CATEGORIES).map(([key, value]) => ({
  key: key as COMMUNITY_CATEGORY_ENUM,
  label: value,
}));

export default function CommunityView({
  posts,
  totalCount,
  selectedCategory,
  sortBy,
  searchKey,
  isLoading = false,
  isLoadingMore = false,
  onChangeSearchKey,
  onSubmitSearch,
  onPressNotification,
  onPressTab,
  onToggleSort,
  onPressPost,
  onPressLike,
  onPressWritePost,
  onLoadMore,
}: CommunityViewProps) {
  // Add empty item if posts count is odd to align items to left
  const displayPosts = posts.length % 2 === 1
    ? [...posts, { id: 'empty', isEmpty: true } as any]
    : posts;

  return (
    <ScreenContainer headerShown={false}>
      <Header>
        <SearchInputWrapper>
          <SearchInput
            value={searchKey}
            onChangeText={onChangeSearchKey}
            onSubmitEditing={onSubmitSearch}
            placeholder="검색"
            placeholderTextColor="#A4A4A4"
          />
          <Icon width={24} height={24} Svg={SearchIcon} />
        </SearchInputWrapper>
        <IconButton width={24} height={22.48} Svg={NotificationIcon} onPress={onPressNotification} />
      </Header>
      <TabNavigator>
        {CATEGORIES.map(({ key, label }) => (
          <Tab key={key} isSelected={selectedCategory === key} onPress={() => onPressTab(key)}>
            <Typography
              fontSize={14}
              fontWeight="bold"
              lineHeight="140%"
              letterSpacing="-2.5%"
              color={selectedCategory === key ? theme.colors.textPrimary : '#C8C8C8'}
            >
              {label}
            </Typography>
          </Tab>
        ))}
      </TabNavigator>
      <SearchResultHeader>
        <Typography fontSize={12} lineHeight="140%" letterSpacing="-2.5%" color={theme.colors.disabled}>
          {selectedCategory ? `${COMMUNITY_CATEGORIES[selectedCategory]} ${totalCount}개` : `최근 인기글🔥`}
        </Typography>
        <SortButton onPress={onToggleSort}>
          <Typography
            fontSize={12}
            lineHeight="140%"
            letterSpacing="-2.5%"
            color={theme.colors.disabled}
            marginRight={1.5}
          >
            {sortBy === 'recommended' ? '추천순' : '최신순'}
          </Typography>
          <Icon width={14} height={14} Svg={SwapIcon} />
        </SortButton>
      </SearchResultHeader>
      <FlatList
        data={displayPosts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => {
          // Render empty space for dummy item
          if ((item as any).isEmpty) {
            return <EmptyPostItem />;
          }

          return (
            <PostItem onPress={() => onPressPost(item.id)}>
              <PostImage source={item.imageUrls.length > 0 ? { uri: item.imageUrls[0] } : undefined} />
              <PostContent>
                <PostHeader>
                  <PostWriterProfileImage
                    source={
                      item.author.profileImageUrl ? { uri: item.author.profileImageUrl } : undefined
                    }
                  />
                  <Typography fontSize={10} fontWeight="semiBold" lineHeight="140%" letterSpacing="-2.5%">
                    {item.author.nickname}
                  </Typography>
                </PostHeader>
                <Typography fontSize={10} lineHeight="140%" letterSpacing="-2.5%" numberOfLines={2}>
                  {item.title}
                </Typography>
                <PostInfoWrapper>
                  <IconButton
                    width={10}
                    height={10}
                    Svg={item.isLiked ? HeartRedIcon : HeartIcon}
                    onPress={() => onPressLike(item.id)}
                  />
                  <Typography
                    fontSize={9}
                    letterSpacing="-2.5%"
                    color="textSecondary"
                    marginLeft={2}
                    marginRight={3}
                  >
                    {item.likeCount}
                  </Typography>
                  <Icon width={10} height={10} Svg={ChatIcon} />
                  <Typography fontSize={9} letterSpacing="-2.5%" color="textSecondary" marginLeft={2}>
                    {item.commentCount}
                  </Typography>
                </PostInfoWrapper>
              </PostContent>
            </PostItem>
          );
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 0 }}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoadingMore ? (
            <LoadingIndicator>
              <Typography fontSize={12} color="textSecondary">
                로딩 중...
              </Typography>
            </LoadingIndicator>
          ) : null
        }
      />
      <WritePostButton onPress={onPressWritePost}>
        <Icon width={10} height={10} Svg={CrossIcon} />
        <Typography
          fontSize={14}
          fontWeight="bold"
          lineHeight="140%"
          letterSpacing="-2.5%"
          color="#FFFFFF"
          marginLeft={5}
        >
          글쓰기
        </Typography>
      </WritePostButton>
    </ScreenContainer>
  );
}

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
`;

const SearchInputWrapper = styled.View`
  flex: 1;
  flex-direction: row;
  padding-horizontal: 12px;
  border: 1px solid ${theme.colors.disabled};
  border-radius: 8px;
  height: 41px;
  margin-left: 13px;
  align-items: center;
  margin-right: 15px;
`;

const SearchInput = styled.TextInput`
  flex: 1;
  color: #000;
  font-size: 14px;
  font-family: Pretendard-Regular;
  margin-right: 10px;
`;

const TabNavigator = styled.View`
  width: 100%;
  height: 50px;
  padding-top: 18px;
  flex-direction: row;
  padding-left: 17px;
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: #c8c8c8;
`;

const Tab = styled.TouchableOpacity<{ isSelected: boolean }>`
  width: 65px;
  align-items: center;
  transform: translateY(1px);
  ${({ isSelected }) =>
    isSelected &&
    `
    border-bottom-width: 2px;
    border-bottom-color: ${theme.colors.textPrimary};
    border-bottom-style: solid;
  `}
`;

const SearchResultHeader = styled.View`
  flex-direction: row;
  padding-horizontal: 18px;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 21px;
  margin-bottom: 15px;
`;

const SortButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
`;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = SCREEN_WIDTH / 2;

const PostItem = styled.Pressable`
  width: ${ITEM_WIDTH}px;
  margin-bottom: 30px;
  height: 270px;
`;

const EmptyPostItem = styled.View`
  width: ${ITEM_WIDTH}px;
  margin-bottom: 30px;
  height: 270px;
  opacity: 0;
`;

const PostImage = styled.Image`
  width: ${ITEM_WIDTH}px;
  height: ${ITEM_WIDTH}px;
  background-color: #ccc;
`;

const PostContent = styled.View`
  padding: 5px;
  width: 100%;
  flex: 1;
`;

const PostHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 5px;
`;

const PostWriterProfileImage = styled.Image`
  width: 20px;
  height: 20px;
  border-radius: 20px;
  margin-right: 4px;
  background-color: #e0e0e0;
`;

const PostInfoWrapper = styled.View`
  margin-top: 5px;
  flex-direction: row;
  justify-content: flex-end;
`;

const LoadingIndicator = styled.View`
  padding: 20px;
  align-items: center;
  justify-content: center;
`;

const WritePostButton = styled.TouchableOpacity`
  flex-direction: row;
  width: 81px;
  height: 36px;
  border-radius: 25px;
  background-color: ${theme.colors.primary};
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: 34px;
  right: 15px;
`;
