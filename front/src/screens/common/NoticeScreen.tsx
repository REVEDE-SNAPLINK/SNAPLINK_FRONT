import { useState, useCallback } from 'react';
import { FlatList, ActivityIndicator } from 'react-native';
import styled from '@/utils/scale/CustomStyled';
import ScreenContainer from '@/components/layout/ScreenContainer';
import { Typography } from '@/components/ui';
import Icon from '@/components/ui/Icon';
import ArrowDownIcon from '@/assets/icons/arrow-down.svg';
import dayjs from 'dayjs';
import { useNoticesInfiniteQuery, useNoticeDetailQuery } from '@/queries/notices';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@/types/navigation';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';

interface NoticeItemProps {
  id: number;
  title: string;
  date: string;
  isExpanded: boolean;
  onToggle: () => void;
}

function NoticeItem({ id, title, date, isExpanded, onToggle }: NoticeItemProps) {
  const { data: detail, isLoading } = useNoticeDetailQuery(isExpanded ? id : undefined);
  const rotation = useSharedValue(0);

  // 화살표 회전 애니메이션
  rotation.value = withTiming(isExpanded ? 180 : 0, { duration: 200 });

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <ItemContainer>
      <ItemHeader onPress={onToggle} activeOpacity={0.7}>
        <ItemHeaderContent>
          <Typography fontSize={16} fontWeight="semiBold" numberOfLines={isExpanded ? undefined : 1}>
            {title}
          </Typography>
          <Typography fontSize={13} color="#8F8F8F" marginTop={4}>
            {dayjs(date).format('YYYY.MM.DD')}
          </Typography>
        </ItemHeaderContent>
        <Animated.View style={arrowStyle}>
          <Icon width={24} height={24} Svg={ArrowDownIcon} />
        </Animated.View>
      </ItemHeader>

      {isExpanded && (
        <ItemBody>
          {isLoading ? (
            <ActivityIndicator size="small" color="#888" style={{ paddingVertical: 20 }} />
          ) : (
            <Typography fontSize={14} lineHeight={22} color="#555">
              {detail?.body || '내용이 없습니다.'}
            </Typography>
          )}
        </ItemBody>
      )}
    </ItemContainer>
  );
}

export default function NoticeScreen() {
  const navigation = useNavigation<MainNavigationProp>();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useNoticesInfiniteQuery({ size: 15 });

  const notices = data?.pages.flatMap((page) => page.content) || [];

  const handlePressBack = () => navigation.goBack();

  const handleToggle = useCallback((id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

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
        style={{ width: '100%', flex: 1 }}
        data={notices}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <NoticeItem
            id={item.id}
            title={item.title}
            date={item.date}
            isExpanded={expandedId === item.id}
            onToggle={() => handleToggle(item.id)}
          />
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? <ActivityIndicator style={{ padding: 16 }} /> : null
        }
        onRefresh={refetch}
        refreshing={isLoading}
      />
    </ScreenContainer>
  );
}

const ItemContainer = styled.View`
  border-bottom-width: 1px;
  border-bottom-color: #E5E5E5;
`;

const ItemHeader = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
`;

const ItemHeaderContent = styled.View`
  flex: 1;
  margin-right: 12px;
`;

const ItemBody = styled.View`
  padding: 0 20px 20px 20px;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;
