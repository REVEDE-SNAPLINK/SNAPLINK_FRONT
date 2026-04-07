import React, { useState, useMemo, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import WheelPicker from '@quidone/react-native-wheel-picker';
import SlideModal from '@/components/ui/SlideModal';
import Typography from '@/components/ui/Typography';

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: i,
  label: `${i + 1}월`,
}));

type WheelDatePickerProps = {
  visible: boolean;
  value: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
  /** 'date': 년+월+일 / 'month': 년+월 (기본: 'date') */
  mode?: 'date' | 'month';
  minimumDate?: Date;
  maximumDate?: Date;
};

export default function WheelDatePicker({
  visible,
  value,
  onConfirm,
  onCancel,
  mode = 'date',
  minimumDate,
  maximumDate,
}: WheelDatePickerProps) {
  const defaultMinDate = new Date('1900-01-01');
  const defaultMaxDate = mode === 'date'
    ? (() => {
        const today = new Date();
        return new Date(today.getFullYear() - 14, 11, 31);
      })()
    : new Date(new Date().getFullYear() + 5, 11, 31);

  const resolvedMin = minimumDate ?? defaultMinDate;
  const resolvedMax = maximumDate ?? defaultMaxDate;

  const minYear = resolvedMin.getFullYear();
  const maxYear = resolvedMax.getFullYear();

  const [selectedYear, setSelectedYear] = useState(value.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(value.getMonth());
  const [selectedDay, setSelectedDay] = useState(value.getDate());

  useEffect(() => {
    if (visible) {
      setSelectedYear(value.getFullYear());
      setSelectedMonth(value.getMonth());
      setSelectedDay(value.getDate());
    }
  }, [visible, value]);

  const years = useMemo(
    () =>
      Array.from({ length: maxYear - minYear + 1 }, (_, i) => ({
        value: minYear + i,
        label: `${minYear + i}년`,
      })),
    [minYear, maxYear],
  );

  const daysInMonth = useMemo(
    () => new Date(selectedYear, selectedMonth + 1, 0).getDate(),
    [selectedYear, selectedMonth],
  );

  const days = useMemo(
    () =>
      Array.from({ length: daysInMonth }, (_, i) => ({
        value: i + 1,
        label: `${i + 1}일`,
      })),
    [daysInMonth],
  );

  useEffect(() => {
    if (selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  }, [daysInMonth, selectedDay]);

  const handleConfirm = () => {
    const day = mode === 'date' ? selectedDay : 1;
    let date = new Date(selectedYear, selectedMonth, day);

    if (date < resolvedMin) date = new Date(resolvedMin);
    if (date > resolvedMax) date = new Date(resolvedMax);

    onConfirm(date);
  };

  const yearPickerWidth = mode === 'date' ? 110 : 140;
  const monthPickerWidth = mode === 'date' ? 90 : 100;

  return (
    <SlideModal
      visible={visible}
      onClose={onCancel}
      showHeader
      title={mode === 'date' ? '날짜 선택' : '달 선택'}
      headerAlign="center"
      headerLeft={
        <TouchableOpacity onPress={onCancel} hitSlop={12}>
          <Typography fontSize={16} color="#007AFF">취소</Typography>
        </TouchableOpacity>
      }
      headerRight={
        <TouchableOpacity onPress={handleConfirm} hitSlop={12}>
          <Typography fontSize={16} fontWeight="semiBold" color="#007AFF">확인</Typography>
        </TouchableOpacity>
      }
      scrollable={false}
      closeOnOverlayPress={false}
    >
      <View style={styles.pickerRow}>
        <WheelPicker
          data={years}
          value={selectedYear}
          onValueChanged={({ item: { value: v } }) => setSelectedYear(v)}
          width={yearPickerWidth}
          itemHeight={44}
          visibleItemCount={5}
          itemTextStyle={styles.itemText}
          overlayItemStyle={styles.overlayItem}
        />
        <WheelPicker
          data={MONTHS}
          value={selectedMonth}
          onValueChanged={({ item: { value: v } }) => setSelectedMonth(v)}
          width={monthPickerWidth}
          itemHeight={44}
          visibleItemCount={5}
          itemTextStyle={styles.itemText}
          overlayItemStyle={styles.overlayItem}
        />
        {mode === 'date' && (
          <WheelPicker
            data={days}
            value={selectedDay}
            onValueChanged={({ item: { value: v } }) => setSelectedDay(v)}
            width={90}
            itemHeight={44}
            visibleItemCount={5}
            itemTextStyle={styles.itemText}
            overlayItemStyle={styles.overlayItem}
          />
        )}
      </View>
    </SlideModal>
  );
}

const styles = StyleSheet.create({
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemText: {
    fontSize: 20,
    fontFamily: 'Pretendard-Medium',
    color: '#000',
  },
  overlayItem: {
    backgroundColor: 'rgba(120, 120, 128, 0.12)',
    borderRadius: 8,
  },
});
