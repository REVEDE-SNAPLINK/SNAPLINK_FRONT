import { FlatList, RefreshControl } from 'react-native';
import ScreenContainer from '@/components/ScreenContainer.tsx';
import styled from '@/utils/scale/CustomStyled.ts';
import HistoryCard from '@/components/HistoryCard.tsx';
import Typography from '@/components/theme/Typography.tsx';
import Loading from '@/components/Loading.tsx';
import { UserBooking } from '@/api/photographer';
import { theme } from '@/theme';
import { formatDateTime } from '@/utils/format';

interface BookingHistoryViewProps {
  onPressBack: () => void;
  bookings: UserBooking[];
  isLoading: boolean;
  isError: boolean;
  onLoadMore: () => void;
  isFetchingNextPage: boolean;
  hasNextPage?: boolean;
  onPressBookingDetail: (bookingId: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onPressViewPhotos?: (bookingId: string) => void;
  onPressWriteReview?: (bookingId: string) => void;
}

export default function BookingHistoryView({
  onPressBack,
  bookings,
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
  const mapStatusToHistoryCardStatus = (
    status: UserBooking['status']
  ): 'PENDING' | 'CONFIRMED' | 'COMPLETED' => {
    switch (status) {
      case 'pending':
        return 'PENDING';
      case 'confirmed':
        return 'CONFIRMED';
      case 'completed':
        return 'COMPLETED';
      case 'cancelled':
        return 'PENDING'; // Default to PENDING for cancelled
      default:
        return 'PENDING';
    }
  };

  const renderItem = ({ item }: { item: UserBooking }) => {
    const isCompleted = mapStatusToHistoryCardStatus(item.status) === 'COMPLETED';

    return (
      <HistoryCard
        onPress={() => onPressBookingDetail(item.id)}
        status={mapStatusToHistoryCardStatus(item.status)}
        nickname={item.photographerNickname}
        name={item.photographerName}
        type={item.shootingType}
        datetime={formatDateTime(item.bookingDate, item.bookingTime)}
        onPressViewPhotos={
          isCompleted && onPressViewPhotos
            ? () => onPressViewPhotos(item.id)
            : undefined
        }
        onPressWriteReview={
          isCompleted && onPressWriteReview
            ? () => onPressWriteReview(item.id)
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
          data={bookings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
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