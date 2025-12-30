import { FlatList, RefreshControl } from 'react-native';
import ScreenContainer from '@/components/common/ScreenContainer';
import styled from '@/utils/scale/CustomStyled.ts';
import HistoryCard from '@/components/common/HistoryCard';
import Typography from '@/components/theme/Typography.tsx';
import Loading from '@/components/Loading.tsx';
import { theme } from '@/theme';
import { formatReservationDateTime } from '@/utils/format';
import { PhotographerBookingListItem } from '@/api/bookings.ts';
import { GetMeResponse } from '@/api/user.ts';

interface BookingManageViewProps {
  bookings: PhotographerBookingListItem[];
  photographerProfile: GetMeResponse;
  isLoading: boolean;
  isError: boolean;
  onLoadMore: () => void;
  isFetchingNextPage: boolean;
  hasNextPage?: boolean;
  onPressBookingDetail: (bookingId: number) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onPressViewPhotos?: (bookingId: number) => void;
  onPressConfirmBooking?: (bookingId: number) => void;
  onPressRejectBooking?: (bookingId: number) => void;
  onPressCompleteBooking?: (bookingId: number) => void;
  onPressCancelBooking?: (bookingId: number) => void;
}

export default function BookingManageView({
  bookings,
  photographerProfile,
  isLoading,
  isError,
  onLoadMore,
  isFetchingNextPage,
  hasNextPage: _hasNextPage,
  onPressBookingDetail,
  onRefresh,
  isRefreshing,
  onPressViewPhotos,
  onPressConfirmBooking,
  onPressRejectBooking,
  onPressCompleteBooking,
  onPressCancelBooking,
}: BookingManageViewProps) {
  const renderItem = ({ item }: { item: PhotographerBookingListItem }) => {

    const endDateTime = new Date(`${item.shootingDate}T${item.endTime}`);
    const startDateTime = new Date(`${item.shootingDate}T${item.startTime}`);
    const canCancelBooking = item.status === 'APPROVED' && (new Date() < startDateTime);
    const canCompleteBooking = item.status === 'APPROVED' && (new Date() > endDateTime);

    return (
      <HistoryCard
        onPress={() => onPressBookingDetail(item.bookingId)}
        canCompleteBooking={canCompleteBooking}
        canCancelBooking={canCancelBooking}
        status={item.status}
        userName={item.customerName || '고객'}
        photographerNickName={photographerProfile.nickname || '작가'}
        photographerName={photographerProfile.name || '작가'}
        type={item.type}
        datetime={formatReservationDateTime(item.shootingDate, item.startTime)}
        onPressViewPhotos={
          (item.status === 'COMPLETED' || item.status === 'PHOTOS_DELIVERED' || item.status === 'USER_PHOTO_CHECK') && onPressViewPhotos
            ? () => onPressViewPhotos(item.bookingId)
            : undefined
        }
        onPressCompleteBooking={
          (item.status === 'APPROVED') && onPressCompleteBooking
            ? () => onPressCompleteBooking(item.bookingId)
            : undefined
        }
        onPressCancelBooking={
          (item.status === 'APPROVED') && onPressCancelBooking
            ? () => onPressCancelBooking(item.bookingId)
            : undefined
        }
        onPressConfirmBooking={
          item.status === 'WAITING_FOR_APPROVAL' && onPressConfirmBooking
            ? () => onPressConfirmBooking(item.bookingId)
            : undefined
        }
        onPressRejectBooking={
          item.status === 'WAITING_FOR_APPROVAL' && onPressRejectBooking
            ? () => onPressRejectBooking(item.bookingId)
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
          keyExtractor={(item) => item.bookingId.toString()}
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