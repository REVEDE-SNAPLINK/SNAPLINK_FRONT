import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components/native';
import { ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { theme } from '@/constants/theme';
import BottomModal from '@/components/BottomModal';
import AppText from '@/components/AppText';

type DatePickerProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  initialDate?: Date;
};

const ITEM_HEIGHT = 31;

export default function DatePicker({
  visible,
  onClose,
  onConfirm,
  initialDate = new Date(),
}: DatePickerProps) {
  const [currentDate, setCurrentDate] = useState(initialDate);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentDay = currentDate.getDate();

  const years = Array.from({ length: 100 }, (_, i) => String(new Date().getFullYear() - i));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));

  const handleDateChange = (type: 'year' | 'month' | 'day', value: string) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      switch (type) {
        case 'year':
          newDate.setFullYear(parseInt(value));
          break;
        case 'month':
          newDate.setMonth(parseInt(value) - 1);
          break;
        case 'day':
          newDate.setDate(parseInt(value));
          break;
      }
      return newDate;
    });
  };

  const handleConfirm = () => {
    onConfirm(currentDate);
    onClose();
  };

  return (
    <BottomModal
      visible={visible}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="생년월일">
      <PickerContainer>
        <DateElementPicker
          items={years}
          value={String(currentYear)}
          setValue={(value) => handleDateChange('year', value)}
          suffix="년"
        />
        <DateElementPicker
          items={months}
          value={String(currentMonth).padStart(2, '0')}
          setValue={(value) => handleDateChange('month', value)}
          suffix="월"
        />
        <DateElementPicker
          items={days}
          value={String(currentDay).padStart(2, '0')}
          setValue={(value) => handleDateChange('day', value)}
          suffix="일"
        />
      </PickerContainer>
    </BottomModal>
  );
}

const PickerContainer = styled.View`
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  height: ${ITEM_HEIGHT * 4}px;
`;

const PickerWrapper = styled.View`
  flex: 1;
  height: ${ITEM_HEIGHT * 4}px;
  position: relative;
`;

const HighlightBox = styled.View`
  position: absolute;
  top: ${ITEM_HEIGHT * 1.5}px;
  left: 50%;
  margin-left: ${-theme.horizontalScale(40)}px;
  background-color: ${theme.colors.inputBackground};
  border-radius: ${theme.moderateScale(10)}px;
  width: ${theme.horizontalScale(80)}px;
  height: ${ITEM_HEIGHT}px;
  pointer-events: none;
`;

const PickerItem = styled.View`
  height: ${ITEM_HEIGHT}px;
  justify-content: center;
  align-items: center;
  flex-direction: row;
`;

interface DateElementPickerProps {
  items: string[];
  value: string;
  setValue: (value: string) => void;
  suffix?: string;
}

const DateElementPicker = ({ items, value, setValue, suffix }: DateElementPickerProps) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const index = items.findIndex((item) => item === value);
    if (index !== -1 && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: index * ITEM_HEIGHT,
          animated: false,
        });
      }, 100);
    }
  }, [items, value]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // Extract the value immediately before the synthetic event is reused
    const offsetY = event.nativeEvent.contentOffset.y;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const index = Math.round(offsetY / ITEM_HEIGHT);
      if (items[index] && items[index] !== value) {
        setValue(items[index]);
      }
    }, 100);
  };

  return (
    <PickerWrapper>
      <HighlightBox />
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 1.5 }}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        scrollEventThrottle={16}
        bounces={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleScroll}
        onScrollEndDrag={handleScroll}>
        {items.map((item: string, index: number) => (
          <PickerItem key={`${item}-${index}`}>
            <AppText
              color={item === value ? theme.colors.black : theme.colors.disabled}
              fontSize={16}
              fontWeight={500}
              lineHeight={20}>
              {item}
            </AppText>
            {suffix && (
              <AppText
                color={item === value ? theme.colors.black : theme.colors.disabled}
                fontSize={16}
                fontWeight={500}
                lineHeight={20}
                marginLeft={4}>
                {suffix}
              </AppText>
            )}
          </PickerItem>
        ))}
      </ScrollView>
    </PickerWrapper>
  );
};