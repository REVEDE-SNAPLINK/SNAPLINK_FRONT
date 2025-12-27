import { FlatList, RefreshControl } from 'react-native';
import ScreenContainer from '@/components/ScreenContainer.tsx';
import styled from '@/utils/scale/CustomStyled.ts';
import HistoryCard from '@/components/HistoryCard.tsx';
import Typography from '@/components/theme/Typography.tsx';
import Loading from '@/components/Loading.tsx';
import { theme } from '@/theme';
import { formatReservationDateTime } from '@/utils/format';
import { UserReservationListItem } from '@/api/reservations.ts';

interface BookingHistoryViewProps {
  onPressBack: () => void;
  reservations: UserReservationListItem[];
  isLoading: boolean;
  isError: boolean;
  onLoadMore: () => void;
  isFetchingNextPage: boolean;
  hasNextPage?: boolean;
  onPressBookingDetail: (reservationId: number) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onPressViewPhotos?: (reservationId: number) => void;
  onPressWriteReview?: (reservationId: number) => void;
}

export default function BookingHistoryView({
  onPressBack,
  reservations,
  isLoading,
  isError,
  onLoadMore,
  isFetchingNextPage,
  hasNextPage: _hasNextPage,
  onPressBookingDetail,
  onRefresh,
  isRefreshing,
  onPressViewPhotos,
  onPressWriteReview,
}: BookingHistoryViewProps) {
  const renderItem = ({ item }: { item: UserReservationListItem }) => {
    return (
      <HistoryCard
        onPress={() => onPressBookingDetail(item.reservationId)}
        status={item.status}
        photographerNickname={item.photographerNickname || '작가'}
        photographerName={item.photographerName || '작가'}
        type={item.type}
        datetime={formatReservationDateTime(item.reservedDate, item.startTime)}
        onPressViewPhotos={
          item.status === 'DELIVERED' && onPressViewPhotos
            ? () => onPressViewPhotos(item.reservationId)
            : undefined
        }
        onPressWriteReview={
          (item.status === 'DELIVERED' || item.status === 'REVIEWED') && onPressWriteReview
            ? () => onPressWriteReview(item.reservationId)
            : undefined
        }
      />
    );
  };

  const renderFooter = () => {
    // Don't show footer loading on initial load, only for pagination
    if (!isFetchingNextPage || isLoading) return null;
    return <Loading size="small" variant="inline" />;
  };

  const renderEmpty = () => {
    if (isLoading) {
      return <Loading size="large" variant="fullscreen" />;
    }

    if (isError) {
      return (
        <EmptyContainer>
          <Typography fontSize={16} color={theme.colors.textSecondary}>
            데이터를 불러오는데 실패했습니다.
          </Typography>
        </EmptyContainer>
      );
    }

    return (
      <EmptyContainer>
        <Typography fontSize={16} color={theme.colors.textSecondary}>
          촬영 내역이 없습니다.
        </Typography>
      </EmptyContainer>
    );
  };

  return (
    <ScreenContainer
      onPressBack={onPressBack}
      headerTitle="촬영 내역"
      headerShown={true}
    >
      <ContentContainer>
        <FlatList
          testID="booking-history-list"
          data={reservations}
          renderItem={renderItem}
          keyExtractor={(item) => item.reservationId.toString()}
          contentContainerStyle={{
            paddingTop: 24,
            paddingHorizontal: 27,
            paddingBottom: 50,
          }}
          showsVerticalScrollIndicator={false}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
        />
      </ContentContainer>
    </ScreenContainer>
  );
}

const ContentContainer = styled.View`
  flex: 1;
  width: 100%;
  background-color: #eaeaea;
`;

const EmptyContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 40px;
  min-height: 200px;
`;