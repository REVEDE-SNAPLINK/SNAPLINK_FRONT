import ScreenContainer from '@/components/ScreenContainer.tsx';
import Typography from '@/components/theme/Typography.tsx';
import Calendar from '@/components/Calendar.tsx';
import styled from '@/utils/scale/CustomStyled.ts';
import { theme } from '@/theme';
import { formatNumber } from '@/utils/format.ts';
import SubmitButton from '@/components/theme/SubmitButton.tsx';
import { TimeSlot, RequiredShootingOption, OptionalShootingOption } from '@/api/photographer.ts';
import { TimeSelector } from '@/components/TimeSelector.tsx';
import { RequiredOption, OptionalOption, OptionLabel } from '@/components/ShootingOptions.tsx';
import { useMemo } from 'react';

interface BookingViewProps {
  onPressBack: () => void;
  onChangeDate: (date: string) => void;
  nickname: string;
  initialDate: string;
  availableDates: string[];
  currentDate: string;
  timeSlots: TimeSlot[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  requiredOptions: RequiredShootingOption[];
  requiredOptionChecked: boolean;
  onRequiredOptionPress: () => void;
  optionalOptions: OptionalShootingOption[];
  optionalQuantities: Record<string, number>;
  onOptionalQuantityChange: (optionId: string, quantity: number) => void;
  totalPrice: number;
  onSubmit: () => void;
}

export default function BookingView({
  onPressBack,
  onChangeDate,
  nickname,
  initialDate,
  currentDate,
  availableDates,
  timeSlots,
  selectedTime,
  onSelectTime,
  requiredOptions,
  requiredOptionChecked,
  onRequiredOptionPress,
  optionalOptions,
  optionalQuantities,
  onOptionalQuantityChange,
  totalPrice,
  onSubmit,
}: BookingViewProps) {
  // Split time slots into morning (오전) and afternoon (오후)
  const { morningSlots, afternoonSlots } = useMemo(() => {
    const morning: TimeSlot[] = [];
    const afternoon: TimeSlot[] = [];

    timeSlots.forEach((slot) => {
      const hour = parseInt(slot.time.split(':')[0], 10);
      if (hour <= 12) {
        morning.push(slot);
      } else {
        afternoon.push(slot);
      }
    });

    return { morningSlots: morning, afternoonSlots: afternoon };
  }, [timeSlots]);

  return (
    <ScreenContainer onPressBackButton={onPressBack} headerTitle={nickname} paddingHorizontal={20} alignItemsCenter={false}>
      <ScrollContainer showsVerticalScrollIndicator={false}>
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

        {requiredOptions.map((option) => (
          <RequiredOption
            key={option.id}
            isChecked={requiredOptionChecked}
            onPress={onRequiredOptionPress}
            option={option}
          />
        ))}

        <OptionLabel>
          <Typography fontSize={14} fontWeight="semiBold" lineHeight="140%" letterSpacing="-2.5%" color="#fff">
            선택 항목
          </Typography>
        </OptionLabel>

        {optionalOptions.map((option) => (
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

        <SubmitButton text="예약하기" onPress={onSubmit} marginBottom={22} marginTop={22} />
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