import ScreenContainer from '@/components/common/ScreenContainer';
import Typography from '@/components/theme/Typography.tsx';
import Calendar from '@/components/common/Calendar';
import styled from '@/utils/scale/CustomStyled.ts';
import { theme } from '@/theme';
import { formatNumber } from '@/utils/format.ts';
import SubmitButton from '@/components/theme/SubmitButton.tsx';
import { TimeSelector } from '@/components/TimeSelector.tsx';
import { ShootingProduct, ShootingOption, OptionLabel } from '@/components/ShootingOptions.tsx';
import { useMemo } from 'react';
import { ActivityIndicator } from 'react-native';
import {GetShootingOptionResponse, GetShootingResponse} from "@/api/shootings.ts";
import { GetAvailableBookingTimeResponse } from '@/api/schedules.ts';
import { GetRegionsResponse } from '@/api/regions.ts';
import Checkbox from '@/components/theme/Checkbox.tsx';

interface BookingViewProps {
  onPressBack: () => void;
  onChangeDate: (date: string) => void;
  onMonthChange: (year: number, month: number) => void;
  initialDate: string;
  availableDates: string[];
  minDate?: string;
  maxDate?: string;
  currentDate: string;
  timeSlots: GetAvailableBookingTimeResponse[];
  isFetchingTimes: boolean;
  isTimesError: boolean;
  onRetryTimes: () => void;
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  availbleRegions: GetRegionsResponse[];
  selectedRegionId: number;
  onToggleRegion: (id: number) => void;
  shootingProducts: GetShootingResponse[];
  isFetchingProducts: boolean;
  isProductsError: boolean;
  onRetryProducts: () => void;
  shootingOptions: GetShootingOptionResponse[];
  isFetchingOptions: boolean;
  isOptionsError: boolean;
  onRetryOptions: () => void;
  optionalQuantities?: Record<number, number>;
  onOptionalQuantityChange?: (optionId: number, quantity: number) => void;
  selectedProductId: number;
  onPressShootingProduct: (productId: number) => void;
  totalPrice: number;
  onSubmit: () => void;
  isSubmitDisabled: boolean;

  navigation?: any;
}

export default function BookingView({
  onPressBack,
  onChangeDate,
  onMonthChange,
  initialDate,
  currentDate,
  availableDates,
  minDate,
  maxDate,
  timeSlots,
  isFetchingTimes,
  isTimesError,
  onRetryTimes,
  selectedTime,
  onSelectTime,
  availbleRegions,
  selectedRegionId,
  onToggleRegion,
  shootingProducts,
  isFetchingProducts,
  isProductsError,
  onRetryProducts,
  shootingOptions,
  isFetchingOptions,
  isOptionsError,
  onRetryOptions,
  optionalQuantities,
  onOptionalQuantityChange,
  selectedProductId,
  onPressShootingProduct,
  totalPrice,
  onSubmit,
  isSubmitDisabled,
  navigation,
}: BookingViewProps) {
  // Split time slots into morning (오전) and afternoon (오후)
  const { morningSlots, afternoonSlots } = useMemo(() => {
    const morning: GetAvailableBookingTimeResponse[] = [];
    const afternoon: GetAvailableBookingTimeResponse[] = [];

    timeSlots.forEach((slot) => {
      const hour = parseInt(slot.startTime.split(':')[0], 10);
      if (hour < 12) {
        morning.push(slot);
      } else {
        afternoon.push(slot);
      }
    });

    return { morningSlots: morning, afternoonSlots: afternoon };
  }, [timeSlots]);

  const isDateSelected = !!currentDate;
  const isTimeSelected = !!selectedTime;
  const isProductSelected = selectedProductId > 0;

  const disabledHint = useMemo(() => {
    if (!isDateSelected) return '날짜를 선택해 주세요';
    if (!isTimeSelected) return '시간을 선택해 주세요';
    if (!isProductSelected) return '촬영 상품을 선택해 주세요';
    return '';
  }, [isDateSelected, isTimeSelected, isProductSelected]);

  return (
    <ScreenContainer
      onPressBack={onPressBack}
      headerTitle="예약"
      alignItemsCenter={false}
      navigation={navigation}
    >
      <ScrollContainer
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 0 }}
      >
        <CalendarWrapper>
          <Typography
            fontSize={16}
            fontWeight="semiBold"
            lineHeight="140%"
            letterSpacing="-2.5%"
            marginBottom={32}
            marginLeft={20}
          >
            날짜와 시간을 선택해 주세요
          </Typography>
          <StepRow>
            <StepItem active={isDateSelected}>
              <Typography fontSize={12} color={isDateSelected ? '#fff' : '#333'}>
                1 날짜 {isDateSelected ? '✓' : ''}
              </Typography>
            </StepItem>
            <StepItem active={isTimeSelected}>
              <Typography fontSize={12} color={isTimeSelected ? '#fff' : '#333'}>
                2 시간 {isTimeSelected ? '✓' : ''}
              </Typography>
            </StepItem>
            <StepItem active={isProductSelected}>
              <Typography fontSize={12} color={isProductSelected ? '#fff' : '#333'}>
                3 상품 {isProductSelected ? '✓' : ''}
              </Typography>
            </StepItem>
          </StepRow>
          <Calendar
            onChangeDate={onChangeDate}
            onMonthChange={onMonthChange}
            initialDate={initialDate}
            currentDate={currentDate}
            availableDates={availableDates}
            minDate={minDate}
            maxDate={maxDate}
          />
        </CalendarWrapper>

        <ContentWrapper>
          <Divider />

          {isFetchingTimes ? (
            <TimeSkeletonRow>
              {Array.from({ length: 8 }).map((_, i) => (
                <TimeSkeletonItem key={i} />
              ))}
            </TimeSkeletonRow>
          ) : isTimesError ? (
            <InlineState>
              <InlineStateText>시간을 불러오지 못했어요.</InlineStateText>
              <InlineAction onPress={onRetryTimes}>
                <InlineActionText>재시도</InlineActionText>
              </InlineAction>
            </InlineState>
          ) : timeSlots.length === 0 ? (
            <InlineState>
              <InlineStateText>
                선택 가능한 시간이 없어요. 다른 날짜를 선택해 주세요.
              </InlineStateText>
            </InlineState>
          ) : (
            <>
              {morningSlots.length > 0 && (
                <>
                  <Typography
                    fontSize={14}
                    lineHeight="140%"
                    letterSpacing="-2.5%"
                    color="#000"
                    marginBottom={17}
                  >
                    오전
                  </Typography>
                  <TimeSelector
                    timeSlots={morningSlots}
                    selectedTime={selectedTime}
                    onSelectTime={onSelectTime}
                    currentDate={currentDate}
                  />
                </>
              )}

              {afternoonSlots.length > 0 && (
                <>
                  <Typography
                    fontSize={14}
                    lineHeight="140%"
                    letterSpacing="-2.5%"
                    color="#000"
                    marginBottom={17}
                    marginTop={morningSlots.length > 0 ? 10 : 0}
                  >
                    오후
                  </Typography>
                  <TimeSelector
                    timeSlots={afternoonSlots}
                    selectedTime={selectedTime}
                    onSelectTime={onSelectTime}
                    currentDate={currentDate}
                  />
                </>
              )}
            </>
          )}

          {availbleRegions.length > 0 && (
            <>
              <Typography
                fontSize={14}
                lineHeight="140%"
                letterSpacing="-2.5%"
                color="#000"
                marginTop={10}
                marginBottom={17}
              >
                장소 (선택사항)
              </Typography>
              <RegionRow>
                {availbleRegions.map((v) => (
                  <RegionWrapper key={v.id}>
                    <Checkbox isChecked={selectedRegionId === v.id} onPress={() => onToggleRegion(v.id)} />
                    <Typography
                      fontSize={14}
                      marginLeft={10}
                    >
                      {v.city}
                    </Typography>
                  </RegionWrapper>
                ))}
              </RegionRow>
            </>
          )}

          <Typography
            fontSize={16}
            fontWeight="semiBold"
            lineHeight="140%"
            letterSpacing="-2.5%"
            color="#000"
            marginTop={51}
          >
            촬영 항목을 선택해 주세요
          </Typography>

          <OptionLabel>
            <Typography
              fontSize={14}
              fontWeight="semiBold"
              lineHeight="140%"
              letterSpacing="-2.5%"
              color="#fff"
            >
              필수 항목
            </Typography>
          </OptionLabel>

          {isFetchingProducts ? (
            <InlineState>
              <ActivityIndicator />
              <InlineStateText>촬영 항목을 불러오는 중...</InlineStateText>
            </InlineState>
          ) : isProductsError ? (
            <InlineState>
              <InlineStateText>촬영 항목을 불러오지 못했어요.</InlineStateText>
              <InlineAction onPress={onRetryProducts}>
                <InlineActionText>재시도</InlineActionText>
              </InlineAction>
            </InlineState>
          ) : shootingProducts.length === 0 ? (
            <InlineState>
              <InlineStateText>등록된 촬영 항목이 없어요.</InlineStateText>
            </InlineState>
          ) : (
            <>
              {shootingProducts.map(product => (
                <ShootingProduct
                  key={product.id}
                  isChecked={selectedProductId === product.id}
                  onPress={() => onPressShootingProduct(product.id)}
                  product={product}
                />
              ))}
            </>
          )}

          <OptionLabel>
            <Typography
              fontSize={14}
              fontWeight="semiBold"
              lineHeight="140%"
              letterSpacing="-2.5%"
              color="#fff"
            >
              선택 항목
            </Typography>
          </OptionLabel>

          {isFetchingOptions && selectedProductId > 0 ? (
            <InlineState>
              <ActivityIndicator />
              <InlineStateText>옵션을 불러오는 중...</InlineStateText>
            </InlineState>
          ) : isOptionsError ? (
            <InlineState>
              <InlineStateText>옵션을 불러오지 못했어요.</InlineStateText>
              <InlineAction onPress={onRetryOptions}>
                <InlineActionText>재시도</InlineActionText>
              </InlineAction>
            </InlineState>
          ) : selectedProductId === 0 ? (
            <InlineState>
              <InlineStateText>
                촬영 상품을 선택하면 옵션을 고를 수 있어요.
              </InlineStateText>
            </InlineState>
          ) : shootingOptions.length === 0 ? (
            <InlineState>
              <InlineStateText>선택 옵션이 없어요.</InlineStateText>
            </InlineState>
          ) : (
            <>
              {shootingOptions.map((option: GetShootingOptionResponse) => (
                <ShootingOption
                  key={option.id}
                  option={option}
                  quantity={optionalQuantities?.[option.id] || 0}
                  onQuantityChange={quantity =>
                    onOptionalQuantityChange?.(option.id, quantity)
                  }
                />
              ))}
            </>
          )}

          <TotalPriceWrapper>
            <Typography
              fontSize={16}
              fontWeight="semiBold"
              lineHeight="140%"
              letterSpacing="-2.5%"
              color="#000"
            >
              합계
            </Typography>
            <Typography
              fontSize={16}
              fontWeight="semiBold"
              lineHeight="140%"
              letterSpacing="-2.5%"
              color="#f00"
            >
              {formatNumber(totalPrice)}원
            </Typography>
          </TotalPriceWrapper>

          <SubmitButton
            disabled={isSubmitDisabled}
            text="다음"
            onPress={onSubmit}
            marginBottom={12}
            marginTop={22}
          />

          {isSubmitDisabled && !!disabledHint && (
            <HintText>{disabledHint}</HintText>
          )}

        </ContentWrapper>
      </ScrollContainer>
    </ScreenContainer>
  );
}

const ScrollContainer = styled.ScrollView`
  flex: 1;
`;

const CalendarWrapper = styled.View`
  width: 100%;
`;

const Divider = styled.View`
  height: 1px;
  width: 100%;
  background-color: ${theme.colors.disabled};
  margin-top: 39px;
  margin-bottom: 9px;
`;

const TotalPriceWrapper = styled.View`
  width: 100%;
  border-top-width: 1px;
  border-top-color: ${theme.colors.disabled};
  height: 82px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const StepRow = styled.View`
  width: 100%;
  flex-direction: row;
  gap: 8px;
  margin-bottom: 12px;
  margin-left: 20px;
`;

const StepItem = styled.View<{ active: boolean }>`
  padding: 0 10px;
  height: 25px;
  justify-content: center;
  border-radius: 999px;
  font-size: 12px;
  background-color: ${({ active }) => (active ? theme.colors.primary : theme.colors.disabled)};
`;

const InlineState = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding-vertical: 12px;
`;

const InlineStateText = styled.Text`
  font-size: 13px;
  color: #333;
  flex: 1;
`;

const InlineAction = styled.TouchableOpacity`
  padding: 6px 10px;
  border-radius: 8px;
  background-color: ${theme.colors.primary};
`;

const InlineActionText = styled.Text`
  color: #fff;
  font-size: 12px;
`;

const TimeSkeletonRow = styled.View`
  width: 100%;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
  padding-vertical: 6px;
`;

const TimeSkeletonItem = styled.View`
  width: 80px;
  height: 36px;
  border-radius: 10px;
  background-color: ${theme.colors.disabled};
`;

const HintText = styled.Text`
  width: 100%;
  text-align: center;
  font-size: 12px;
  color: #666;
  margin-bottom: 22px;
`;

const RegionRow = styled.View`
  width: 100%;
  flex-direction: row;
  flex-wrap: wrap;
`

const RegionWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  margin-right: 16px;
`

const ContentWrapper = styled.View`
  padding: 0 20px;
`