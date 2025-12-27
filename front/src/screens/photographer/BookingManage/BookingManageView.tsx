import { FlatList, RefreshControl } from 'react-native';
import ScreenContainer from '@/components/ScreenContainer.tsx';
import styled from '@/utils/scale/CustomStyled.ts';
import HistoryCard from '@/components/HistoryCard.tsx';
import Typography from '@/components/theme/Typography.tsx';
import Loading from '@/components/Loading.tsx';
import { theme } from '@/theme';
import { formatReservationDateTime } from '@/utils/format';
import { PhotographerReservationListItem } from '@/api/reservations.ts';
import { GetMeResponse } from '@/api/user.ts';

interface BookingManageViewProps {
  reservations: PhotographerReservationListItem[];
  photographerProfile: GetMeResponse;
  isLoading: boolean;
  isError: boolean;
  onLoadMore: () => void;
  isFetchingNextPage: boolean;
  hasNextPage?: boolean;
  onPressBookingDetail: (reservationId: number) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onPressViewPhotos?: (reservationId: number) => void;
  onPressConfirmBooking?: (reservationId: number) => void;
  onPressRejectBooking?: (reservationId: number) => void;
}

export default function BookingManageView({
  reservations,
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
}: BookingManageViewProps) {
  const renderItem = ({ item }: { item: PhotographerReservationListItem }) => {

    return (
      <HistoryCard
        onPress={() => onPressBookingDetail(item.reservationId)}
        status={item.status}
        userName={item.userName || '고객'}
        photographerNickname={photographerProfile.nickname || '작가'}
        photographerName={photographerProfile.name || '작가'}
        type={item.type}
        datetime={formatReservationDateTime(item.reservedDate, item.startTime)}
        onPressViewPhotos={
          (item.status === 'COMPLETED' || item.status === 'DELIVERED' || item.status === 'REVIEWED') && onPressViewPhotos
            ? () => onPressViewPhotos(item.reservationId)
            : undefined
        }
        onPressConfirmBooking={
          item.status === 'REQUESTED' && onPressConfirmBooking
            ? () => onPressConfirmBooking(item.reservationId)
            : undefined
        }
        onPressRejectBooking={
          item.status === 'REQUESTED' && onPressRejectBooking
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