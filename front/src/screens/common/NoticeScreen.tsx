import { useNavigation } from '@react-navigation/native';
import { FlatList, ActivityIndicator } from 'react-native';
import styled from '@/utils/scale/CustomStyled';
import ScreenContainer from '@/components/common/ScreenContainer';
import { MainNavigationProp } from '@/types/navigation.ts';
import { Typography } from '@/components/theme';
import dayjs from 'dayjs';
import { useNoticesInfiniteQuery } from '@/queries/notices';

export default function NoticeScreen() {
  const navigation = useNavigation<MainNavigationProp>();

  // 1. 무한 스크롤 쿼리 호출 (한 페이지에 15개씩)
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useNoticesInfiniteQuery({ size: 15 });

  // 2. 2차원 배열(pages)을 1차원 배열로 평탄화
  const notices = data?.pages.flatMap((page) => page.content) || [];

  const handlePressBack = () => navigation.goBack();

  const handlePressNotice = (noticeId: number) => {
    navigation.navigate('NoticeDetail', { noticeId });
  };

  // 다음 페이지를 불러오는 함수
  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return (
      <ScreenContainer headerShown headerTitle="공지사항" onPressBack={handlePressBack}>
        <LoadingContainer>
          <ActivityIndicator size="large" color="#000" />
        </LoadingContainer>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      headerShown
      headerTitle="공지사항"
      onPressBack={handlePressBack}
    >
      <FlatList
        style={{
          width: '100%',
          flex: 1,
          borderTopWidth: 1,
          borderTopColor: '#AAA'
        }}
        data={notices}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <NoticeItem onPress={() => handlePressNotice(item.id)}>
            <Typography fontSize={18} fontWeight="bold" marginBottom={6}>
              {item.title}
            </Typography>
            <Typography fontSize={14} color="#8F8F8F">
              {dayjs(item.date).format('YYYY-MM-DD HH:mm')}
            </Typography>
          </NoticeItem>
        )}
        // 무한 스크롤 설정
        onEndReached={loadMore}
        onEndReachedThreshold={0.5} // 바닥에서 50% 남았을 때 미리 호출
        ListFooterComponent={
          isFetchingNextPage ? <ActivityIndicator style={{ padding: 16 }} /> : null
        }
        // 당겨서 새로고침 (옵션)
        onRefresh={refetch}
        refreshing={isLoading}
      />
    </ScreenContainer>
  );
}

const NoticeItem = styled.TouchableOpacity`
  width: 100%;
  padding: 16px;
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: #AAA;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;