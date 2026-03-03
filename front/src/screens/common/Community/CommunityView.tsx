import Icon from '@/components/ui/Icon.tsx';
import styled from '@/utils/scale/CustomStyled.ts';
import { theme } from '@/theme';
import Typography from '@/components/ui/Typography.tsx';
import SearchIcon from '@/assets/icons/search-white.svg';
import IconButton from '@/components/ui/IconButton.tsx';
import { Dimensions, FlatList, RefreshControl } from 'react-native';
import HeartRedIcon from '@/assets/icons/heart-red.svg';
import HeartIcon from '@/assets/icons/heart-black.svg';
import ChatIcon from '@/assets/icons/chat-blank-black.svg';
import CrossIcon from '@/assets/icons/cross-white.svg';
import { CommunityPost, COMMUNITY_CATEGORY_ENUM, COMMUNITY_CATEGORIES } from '@/api/community.ts';
import ServerImage from '@/components/ui/ServerImage.tsx';
import NotificationButton from '@/components/ui/NotificationButton.tsx';
import SortButton, { SortOption } from '@/components/ui/SortButton.tsx';
import { formatTimeAgo } from '@/utils/format.ts';
import { useState } from 'react';

export const SORT_BY_ENUM = {
  'LATEST': '최신순',
  'LIKES': '인기순',
};

export type SortByKey = keyof typeof SORT_BY_ENUM;

const SORT_OPTIONS: SortOption<SortByKey>[] = [
  { key: 'LATEST', label: '최신순' },
  { key: 'LIKES', label: '인기순' },
];


interface CommunityViewProps {
  posts: CommunityPost[];
  totalCount: number;
  selectedCategory: COMMUNITY_CATEGORY_ENUM | undefined;
  sortBy: SortByKey;
  searchKey: string;
  isLoadingMore?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  onChangeSearchKey: (key: string) => void;
  onSubmitSearch: () => void;
  onPressTab: (category: COMMUNITY_CATEGORY_ENUM) => void;
  onChangeSortBy: (key: SortByKey) => void;
  onPressPost: (postId: number) => void;
  onPressLike: (postId: number) => void;
  onPressWritePost: () => void;
  onLoadMore?: () => void;
  onRefresh: () => void;
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
  isLoadingMore = false,
  isError = false,
  onChangeSearchKey,
  onSubmitSearch,
  onPressTab,
  onChangeSortBy,
  onPressPost,
  onPressLike,
  onPressWritePost,
  onLoadMore,
  onRefresh,
}: CommunityViewProps) {
  const [localRefreshing, setLocalRefreshing] = useState(false);

  const handleRefresh = async () => {
    setLocalRefreshing(true);
    await onRefresh();
    // 데이터가 로드된 후 레이아웃이 계산될 아주 짧은 시간을 벌어줌
    setTimeout(() => {
      setLocalRefreshing(false);
    }, 100);
  };

  return (
    <Container>
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
        <NotificationButton />
      </Header>
      <TabNavigator>
        {CATEGORIES.map(({ key, label }) => (
          <Tab
            key={key}
            isSelected={selectedCategory === key}
            onPress={() => onPressTab(key)}
          >
            <Typography
              fontSize={14}
              fontWeight="bold"
              lineHeight="140%"
              letterSpacing="-2.5%"
              color={
                selectedCategory === key ? theme.colors.textPrimary : '#C8C8C8'
              }
            >
              {label}
            </Typography>
          </Tab>
        ))}
      </TabNavigator>
      <SearchResultHeader>
        <Typography
          fontSize={12}
          lineHeight="140%"
          letterSpacing="-2.5%"
          color={theme.colors.disabled}
        >
          {selectedCategory
            ? `${COMMUNITY_CATEGORIES[selectedCategory]} ${totalCount}개`
            : `최근 인기글🔥`}
        </Typography>
        <SortButton
          options={SORT_OPTIONS}
          selectedKey={sortBy}
          onSelect={onChangeSortBy}
        />
      </SearchResultHeader>
      {isError ? (
        <ErrorContainer>
          <Typography fontSize={16} color={theme.colors.disabled}>
            게시글을 불러올 수 없습니다.{'\n'}
            다시 시도해주세요.
          </Typography>
        </ErrorContainer>
      ) : selectedCategory === 'NEWS' ? (
        // NEWS 카테고리일 때는 NewsItem으로 표시
        <FlatList
          key="news-list"
          data={posts}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <NewsItem
              onPress={() => onPressPost(item.id)}
              title={item.content}
              createdAt={item.createdAt}
              imageUri={item.images?.[0]?.urls || ''}
              commentCount={item.commentCount}
            />
          )}
          showsVerticalScrollIndicator={false}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={localRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
            />
          }
          ListFooterComponent={
            isLoadingMore ? (
              <LoadingIndicator>
                <Typography fontSize={12} color="textSecondary">
                  로딩 중...
                </Typography>
              </LoadingIndicator>
            ) : null
          }
          removeClippedSubviews={true}
          windowSize={5}
          initialNumToRender={6}
          maxToRenderPerBatch={4}
          updateCellsBatchingPeriod={50}
        />
      ) : (
        // 다른 카테고리는 기존 2열 그리드 방식
        <FlatList
          key="grid-list"
          data={posts}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          renderItem={({ item }) => {
            // Render empty space for dummy item
            if ((item as any).isEmpty) {
              return <EmptyPostItem />;
            }

            return (
              <PostItem onPress={() => onPressPost(item.id)}>
                {item.images?.length > 0 ? (
                  <PostImage uri={item.images[0].urls} requestWidth={ITEM_WIDTH * 2} />
                ) : (
                  <PostImage />
                )}
                <PostContent>
                  <PostHeader>
                    <PostWriterProfileImage uri={item.author.profileImageUrl} requestWidth={40} />
                    <Typography
                      fontSize={12}
                      fontWeight="semiBold"
                      lineHeight="140%"
                      letterSpacing="-2.5%"
                    >
                      {item.author.nickname}
                    </Typography>
                  </PostHeader>
                  <Typography
                    fontSize={12}
                    lineHeight="140%"
                    letterSpacing="-2.5%"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.content}
                  </Typography>
                  <PostInfoWrapper>
                    <IconButton
                      width={13}
                      height={12}
                      disabled={true}
                      Svg={item.isLiked ? HeartRedIcon : HeartIcon}
                      onPress={() => onPressLike(item.id)}
                    />
                    <Typography
                      fontSize={12}
                      letterSpacing="-2.5%"
                      color="textSecondary"
                      marginLeft={2}
                      marginRight={3}
                    >
                      {item.likeCount}
                    </Typography>
                    <Icon width={13} height={12} Svg={ChatIcon} />
                    <Typography
                      fontSize={12}
                      letterSpacing="-2.5%"
                      color="textSecondary"
                      marginLeft={2}
                    >
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
          refreshControl={
            <RefreshControl
              refreshing={localRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
            />
          }
          ListFooterComponent={
            isLoadingMore ? (
              <LoadingIndicator>
                <Typography fontSize={12} color="textSecondary">
                  로딩 중...
                </Typography>
              </LoadingIndicator>
            ) : null
          }
          removeClippedSubviews={true}
          windowSize={5}
          initialNumToRender={6}
          maxToRenderPerBatch={4}
          updateCellsBatchingPeriod={50}
        />
      )}
      {selectedCategory !== 'NEWS' && !isError &&
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
      }
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
`

const ErrorContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  margin-top: 24px;
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

const Tab = styled.TouchableOpacity<{ isSelected: boolean }>`
  padding: 0 10px;
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
  position: relative;
  z-index: 1000;
`;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = SCREEN_WIDTH / 2;

const PostItem = styled.Pressable`
  width: ${ITEM_WIDTH}px;
  margin-bottom: 10px;
`;

const EmptyPostItem = styled.View`
  width: ${ITEM_WIDTH}px;
  margin-bottom: 30px;
  opacity: 0;
`;

const PostImage = styled(ServerImage)`
  width: ${ITEM_WIDTH}px;
  height: 218px;
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
  margin-bottom: 7px;
`;

const PostWriterProfileImage = styled(ServerImage).attrs({ type: 'profile' })`
  width: 20px;
  height: 20px;
  border-radius: 20px;
  margin-right: 4px;
  background-color: #e0e0e0;
`;

const PostInfoWrapper = styled.View`
  margin-top: 9px;
  flex-direction: row;
  align-items: center;
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

const NewsLabel = styled.View`
  height: 19px;
  padding: 0 5px;
  justify-content: center;
  border: 1px solid ${theme.colors.primary};
  margin-bottom: 10px;
  background-color: #EAFFFA;
  border-radius: 5px;
  align-self: flex-start;
`

const NewsItemWrapper = styled.TouchableOpacity`
  width: 100%;
  padding: 10px 14px;
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: #c8c8c8;
`

const NewsItemContentWrapper = styled.View`
  flex-direction: row;
`

const NewsItemInfoWrapper = styled.View`
  padding-right: 20px;
`

const NewsItemBottomWrapper = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
`

const NewsItemImageWrapper = styled.View`
  width: 70px;
  height: 70px;
  border-radius: 5px;
  overflow: hidden;
`

const NewsItemImage = styled(ServerImage)`
  width: 100%;
  height: 100%;
`

const NewsItemCommentWrapper = styled.View`
  flex-direction: row;
  margin-top: 9px;
  align-items: center;
`

interface NewsItemProps {
  onPress: () => void;
  title: string;
  createdAt: string;
  imageUri: string;
  commentCount: number;
}

const NewsItem = ({
  onPress,
  title,
  createdAt,
  imageUri,
  commentCount,
}: NewsItemProps) => {
  return (
    <NewsItemWrapper
      onPress={onPress}
    >
      <NewsItemContentWrapper>
        <NewsItemInfoWrapper>
          <NewsLabel>
            <Typography
              fontSize={12}
              color="primary"
            >
              공지사항
            </Typography>
          </NewsLabel>
          <Typography fontSize={14} color="#000">
            {title}
          </Typography>
        </NewsItemInfoWrapper>
        <NewsItemImageWrapper>
          <NewsItemImage uri={imageUri} requestWidth={140} />
        </NewsItemImageWrapper>
      </NewsItemContentWrapper>
      <NewsItemBottomWrapper>
        <Typography fontSize={12} color="#C8C8C8">
          스냅링크 관리자 ㆍ {formatTimeAgo(createdAt)}
        </Typography>
        <NewsItemCommentWrapper>
          <Icon width={14} height={14} Svg={ChatIcon} />
          <Typography fontSize={12} color="#3C3C3C" marginLeft={2}>
            {commentCount}
          </Typography>
        </NewsItemCommentWrapper>
      </NewsItemBottomWrapper>
    </NewsItemWrapper>
  );
}