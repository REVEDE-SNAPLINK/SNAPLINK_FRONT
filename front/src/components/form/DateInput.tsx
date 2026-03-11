import { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import styled from '@/utils/scale/CustomStyled.ts';
import FormErrorMessage from '@/components/form/FormErrorMessage';
import DatePicker from 'react-native-date-picker'
import CalendarIcon from '@/assets/icons/calendar.svg';
import Icon from '@/components/ui/Icon.tsx';

interface DateInputProps {
  placeholder: string;
  errorMessage?: string;
  value: Date;
  onChange?: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
}

export interface DateInputRef {
  openPicker: () => void;
}

const InputFieldWrapper = styled.View`
  width: 100%;
  background-color: #F9F9F9;
  border: 1px solid #E9E9E9;
  border-radius: 5px;
  height: 50px;
  padding: 0 21px;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
`;

const StyledInputField = styled.TextInput`
  flex: 1;
  height: 100%;
  font-size: 14px;
  font-family: Pretendard-Regular;
  letter-spacing: 0.2px;
  color: #000;
`;

const FormErrorMessageSpacer = styled.View`
  height: 10px;
`;

const DateInput = forwardRef<DateInputRef, DateInputProps>(
  ({ placeholder, errorMessage, value, onChange, minimumDate, maximumDate }, ref) => {
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    // Default minimumDate and maximumDate for age verification (14+ years old)
    const defaultMinimumDate = new Date('1900-01-01');
    const defaultMaximumDate = (() => {
      const today = new Date();
      const thisYear = today.getFullYear();
      return new Date(`${thisYear - 14}-12-31`);
    })();

    const pickerMinimumDate = minimumDate ?? defaultMinimumDate;
    const pickerMaximumDate = maximumDate ?? defaultMaximumDate;

    useEffect(() => {
      setSelectedDate(value);
    }, [value]);

    useImperativeHandle(ref, () => ({
      openPicker: () => setIsPickerVisible(true),
    }));

    const handleConfirm = (date: Date) => {
      setSelectedDate(date);
      onChange?.(date);
    };

    const formatDate = (date?: Date) => {
      if (!date) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}.${month}.${day}`;
    };

    const handlePress = () => {
      setIsPickerVisible(true);
    };

    return (
      <>
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.7}
          style={{ width: '100%' }}
        >
          <InputFieldWrapper pointerEvents="none">
            <StyledInputField
              placeholder={placeholder}
              placeholderTextColor="#737373"
              value={formatDate(selectedDate)}
              editable={false}
            />
            <Icon width={24} height={24} Svg={CalendarIcon} />
          </InputFieldWrapper>
        </TouchableOpacity>
        {errorMessage && (
          <>
            <FormErrorMessageSpacer />
            <FormErrorMessage message={errorMessage} />
          </>
        )}
        <DatePicker
          modal
          mode="date"
          minimumDate={pickerMinimumDate}
          maximumDate={pickerMaximumDate}
          open={isPickerVisible}
          onCancel={() => setIsPickerVisible(false)}
          onConfirm={(date) => {
            handleConfirm(date)
            setIsPickerVisible(false);
          }}
          date={selectedDate}
        />
      </>
    );
  }
);

DateInput.displayName = 'DateInput';

export default DateInput;
