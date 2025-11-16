import { FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import ScreenContainer from '@/components/ScreenContainer.tsx';
import styled from '@/utils/scale/CustomStyled.ts';
import HistoryCard from '@/components/HistoryCard.tsx';
import Typography from '@/components/theme/Typography.tsx';
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
  onPressPhotographerDetail: (photographerId: string) => void;
  onRefresh: () => void;
  onPressShowPhoto?: (bookingId: string) => void;
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
  onPressPhotographerDetail,
  onRefresh,
  onPressShowPhoto,
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
        onPress={() => onPressPhotographerDetail(item.photographerId)}
        status={mapStatusToHistoryCardStatus(item.status)}
        nickname={item.photographerNickname}
        name={item.photographerName}
        type={item.shootingType}
        datetime={formatDateTime(item.bookingDate, item.bookingTime)}
        onPressShowPhoto={
          isCompleted && onPressShowPhoto
            ? () => onPressShowPhoto(item.id)
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
    if (!isFetchingNextPage) return null;
    return (
      <LoadingContainer>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </LoadingContainer>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <EmptyContainer>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </EmptyContainer>
      );
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
              refreshing={isLoading}
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

const LoadingContainer = styled.View`
  padding: 20px;
  align-items: center;
  justify-content: center;
`;

const EmptyContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 40px;
  min-height: 200px;
`;