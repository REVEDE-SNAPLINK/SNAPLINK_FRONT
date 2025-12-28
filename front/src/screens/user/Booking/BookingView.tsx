import ScreenContainer from '@/components/common/ScreenContainer';
import Typography from '@/components/theme/Typography.tsx';
import Calendar from '@/components/common/Calendar';
import styled from '@/utils/scale/CustomStyled.ts';
import { theme } from '@/theme';
import { formatNumber } from '@/utils/format.ts';
import SubmitButton from '@/components/theme/SubmitButton.tsx';
import { TimeSelector } from '@/components/TimeSelector.tsx';
import { RequiredOption, OptionalOption, OptionLabel } from '@/components/ShootingOptions.tsx';
import { useMemo } from 'react';
import { ShootingOption } from '@/screens/user/Booking/BookingContainer.tsx';

interface BookingViewProps {
  onPressBack: () => void;
  onChangeDate: (date: string) => void;
  initialDate: string;
  availableDates: string[];
  currentDate: string;
  timeSlots: string[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  requiredOptions: ShootingOption;
  optionalOptions: ShootingOption[];
  optionalQuantities: number[];
  onOptionalQuantityChange: (quantity: number) => void;
  concept: number;
  onPressRequiredOption: (optionId: number) => void;
  totalPrice: number;
  onSubmit: () => void;
  isSubmitDisabled: boolean;
}

export default function BookingView({
  onPressBack,
  onChangeDate,
  initialDate,
  currentDate,
  availableDates,
  timeSlots,
  selectedTime,
  onSelectTime,
  requiredOptions,
  concept,
  onPressRequiredOption,
  totalPrice,
  onSubmit,
  isSubmitDisabled,
}: BookingViewProps) {
  // Split time slots into morning (오전) and afternoon (오후)
  const { morningSlots, afternoonSlots } = useMemo(() => {
    const morning: string[] = [];
    const afternoon: string[] = [];

    timeSlots.forEach((slot) => {
      const hour = parseInt(slot.split(':')[0], 10);
      if (hour < 12) {
        morning.push(slot);
      } else {
        afternoon.push(slot);
      }
    });

    return { morningSlots: morning, afternoonSlots: afternoon };
  }, [timeSlots]);

  return (
    <ScreenContainer onPressBack={onPressBack} headerTitle="예약" alignItemsCenter={false}>
      <ScrollContainer showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
        <CalendarWrapper>
          <Typography fontSize={16} fontWeight="semiBold" lineHeight="140%" letterSpacing="-2.5%" marginBottom={32}>
            날짜와 시간을 선택해 주세요
          </Typography>
          <Calendar onChangeDate={onChangeDate} initialDate={initialDate} currentDate={currentDate} availableDates={availableDates} />
        </CalendarWrapper>
        <Divider />

        {morningSlots.length > 0 && (
          <>
            <Typography fontSize={14} lineHeight="140%" letterSpacing="-2.5%" color="#000" marginBottom={17}>
              오전
            </Typography>
            <TimeSelector timeSlots={morningSlots} selectedTime={selectedTime} onSelectTime={onSelectTime} />
          </>
        )}

        {afternoonSlots.length > 0 && (
          <>
            <Typography fontSize={14} lineHeight="140%" letterSpacing="-2.5%" color="#000" marginBottom={17} marginTop={morningSlots.length > 0 ? 10 : 0}>
              오후
            </Typography>
            <TimeSelector timeSlots={afternoonSlots} selectedTime={selectedTime} onSelectTime={onSelectTime} />
          </>
        )}

        <Typography fontSize={16} fontWeight="semiBold" lineHeight="140%" letterSpacing="-2.5%" color="#000" marginTop={51}>
          촬영 항목을 선택해 주세요
        </Typography>

        <OptionLabel>
          <Typography fontSize={14} fontWeight="semiBold" lineHeight="140%" letterSpacing="-2.5%" color="#fff">
            필수 항목
          </Typography>
        </OptionLabel>

        <RequiredOption
          key={requiredOptions.id}
          isChecked={concept === requiredOptions.id}
          onPress={() => onPressRequiredOption(requiredOptions.id)}
          option={requiredOptions}
        />

        <OptionLabel>
          <Typography fontSize={14} fontWeight="semiBold" lineHeight="140%" letterSpacing="-2.5%" color="#fff">
            선택 항목
          </Typography>
        </OptionLabel>

        {optionalOptions.map((option: ShootingOption) => (
          <OptionalOption
            key={option.id}
            option={option}
            quantity={optionalQuantities[option.id] || 0}
            onQuantityChange={(quantity) => onOptionalQuantityChange(option.id, quantity)}
          />
        ))}

        <TotalPriceWrapper>
          <Typography fontSize={16} fontWeight="semiBold" lineHeight="140%" letterSpacing="-2.5%" color="#000">
            합계
          </Typography>
          <Typography fontSize={16} fontWeight="semiBold" lineHeight="140%" letterSpacing="-2.5%" color="#f00">
            {formatNumber(totalPrice)}원
          </Typography>
        </TotalPriceWrapper>

        <SubmitButton disabled={isSubmitDisabled} text="다음" onPress={onSubmit} marginBottom={22} marginTop={22} />
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