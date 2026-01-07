import { FlatList, RefreshControl } from 'react-native';
import ScreenContainer from '@/components/common/ScreenContainer';
import styled from '@/utils/scale/CustomStyled.ts';
import HistoryCard from '@/components/common/HistoryCard';
import Typography from '@/components/theme/Typography.tsx';
import Loading from '@/components/Loading.tsx';
import { theme } from '@/theme';
import { formatReservationDateTime } from '@/utils/format';
import { UserBookingListItem } from '@/api/bookings.ts';

interface BookingHistoryViewProps {
  onPressBack: () => void;
  reservations: UserBookingListItem[];
  isLoading: boolean;
  isError: boolean;
  onLoadMore: () => void;
  isFetchingNextPage: boolean;
  hasNextPage?: boolean;
  onPressBookingDetail: (bookingId: number) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onPressCancelBooking?: (bookingId: number) => void;
  onPressViewPhotos?: (bookingId: number) => void;
  onPressWriteReview?: (bookingId: number) => void;
  onPressShowMyReivew?: (bookingId: number) => void;

  navigation?: any;
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
  onPressCancelBooking,
  onPressViewPhotos,
  onPressWriteReview,
  onPressShowMyReivew,
  navigation,}: BookingHistoryViewProps) {
  const renderItem = ({ item }: { item: UserBookingListItem }) => {
    return (
      <HistoryCard
        onPress={() => onPressBookingDetail(item.bookingId)}
        status={item.status}
        photographerNickName={item.photographerNickName || '작가'}
        photographerName={item.photographerName || '작가'}
        type={item.type}
        datetime={formatReservationDateTime(item.shootingDate, item.startTime, item.endTime)}
        onPressCancelBooking={
          item.status === 'WAITING_FOR_APPROVAL' && onPressCancelBooking
            ? () => onPressCancelBooking(item.bookingId)
            : undefined
        }
        onPressViewPhotos={
          (item.status === 'PHOTOS_DELIVERED' || item.status === 'USER_PHOTO_CHECK') && onPressViewPhotos
            ? () => onPressViewPhotos(item.bookingId)
            : undefined
        }
        onPressWriteReview={
          item.status === 'USER_PHOTO_CHECK' && onPressWriteReview
            ? () => onPressWriteReview(item.bookingId)
            : undefined
        }
        onPressViewMyReivew={
          item.status === 'USER_PHOTO_CHECK' && item.isreview && onPressShowMyReivew
            ? () => onPressShowMyReivew(item.bookingId)
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
    
      navigation={navigation}>
      <ContentContainer>
        <FlatList
          testID="booking-history-list"
          data={reservations}
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