import { FlatList, RefreshControl } from 'react-native';
import ScreenContainer from '@/components/ScreenContainer.tsx';
import styled from '@/utils/scale/CustomStyled.ts';
import HistoryCard from '@/components/HistoryCard.tsx';
import Typography from '@/components/theme/Typography.tsx';
import Loading from '@/components/Loading.tsx';
import { theme } from '@/theme';
import { formatReservationDateTime } from '@/utils/format';
import { ReservationListItem } from '@/api/reservations.ts';

interface BookingHistoryViewProps {
  onPressBack: () => void;
  reservations: ReservationListItem[];
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
  const mapStatusToHistoryCardStatus = (
    status: ReservationListItem['status']
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
    const isCompleted = mapStatusToHistoryCardStatus(item.status) === 'COMPLETED';

    return (
      <HistoryCard
        onPress={() => onPressBookingDetail(item.reservationId)}
        status={mapStatusToHistoryCardStatus(item.status)}
        photographerNickname={item.counterpartName}
        photographerName={item.counterpartName}
        type="" // TODO: api 추가되면 추가
        datetime={formatReservationDateTime(item.reservedDate, { hour: item.startTime.hour, minute: item.startTime.minute })}
        onPressViewPhotos={
          isCompleted && onPressViewPhotos
            ? () => onPressViewPhotos(item.reservationId)
            : undefined
        }
        onPressWriteReview={
          isCompleted && onPressWriteReview
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