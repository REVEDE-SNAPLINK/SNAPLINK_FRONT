import { FlatList, RefreshControl } from 'react-native';
import ScreenContainer from '@/components/ScreenContainer.tsx';
import styled from '@/utils/scale/CustomStyled.ts';
import HistoryCard from '@/components/HistoryCard.tsx';
import Typography from '@/components/theme/Typography.tsx';
import Loading from '@/components/Loading.tsx';
import { UserBooking } from '@/api/photographer';
import { theme } from '@/theme';
import { formatReservationDateTime } from '@/utils/format';
import { ReservationListItem } from '@/api/reservations.ts';

interface BookingHistoryViewProps {
  bookings: ReservationListItem[];
  isLoading: boolean;
  isError: boolean;
  onLoadMore: () => void;
  isFetchingNextPage: boolean;
  hasNextPage?: boolean;
  onPressBookingDetail: (bookingId: number) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onPressViewPhotos?: (bookingId: number) => void;
  onPressWriteReview?: (bookingId: number) => void;
  onPressConfirmBooking?: (bookingId: number) => void;
  onPressRejectBooking?: (bookingId: number) => void;
}

export default function BookingManageView({
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
  onPressConfirmBooking,
  onPressRejectBooking,
}: BookingHistoryViewProps) {
  const mapStatusToHistoryCardStatus = (
    status: UserBooking['status']
  ): 'PENDING' | 'CONFIRMED' | 'COMPLETED' => {
    switch (status) {
      case 'REQUESTED':
      case 'REJECTED':
        return 'PENDING';
      case 'CONFIRMED':
        return 'CONFIRMED';
      case 'COMPLETED':
      case 'DELIVERED':
      case 'REVIEWED':
        return 'COMPLETED';
      default:
        return 'PENDING';
    }
  };

  const renderItem = ({ item }: { item: ReservationListItem }) => {
    const cardStatus = mapStatusToHistoryCardStatus(item.status);
    const isCompleted = cardStatus === 'COMPLETED';
    const isPending = cardStatus === 'PENDING';
    // For photographer: show upload button when COMPLETED (to upload photos)
    const canUploadPhotos = item.status === 'COMPLETED';

    return (
      <HistoryCard
        onPress={() => onPressBookingDetail(item.reservationId)}
        status={cardStatus}
        userName={item.counterpartName}
        photographerNickname=""
        photographerName=""
        type=""
        datetime={formatReservationDateTime(item.reservedDate, { hour: item.startTime.hour, minute: item.startTime.minute })}
        onPressViewPhotos={
          canUploadPhotos && onPressViewPhotos
            ? () => onPressViewPhotos(item.reservationId)
            : undefined
        }
        onPressWriteReview={
          isCompleted && onPressWriteReview
            ? () => onPressWriteReview(item.reservationId)
            : undefined
        }
        onPressConfirmBooking={
          isPending && onPressConfirmBooking
            ? () => onPressConfirmBooking(item.reservationId)
            : undefined
        }
        onPressRejectBooking={
          isPending && onPressRejectBooking
            ? () => onPressRejectBooking(item.reservationId)
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
      headerTitle="촬영 예약 관리"
      headerShown={true}
    >
      <ContentContainer>
        <FlatList
          testID="booking-history-list"
          data={bookings}
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