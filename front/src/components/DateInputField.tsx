import { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import styled from '@/utils/scale/CustomStyled.ts';
import FormErrorMessage from '@/components/FormErrorMessage.tsx';
import DatePicker from '@/components/DatePicker.tsx';
import CalendarIcon from '@/assets/icons/calendar.svg';
import Icon from '@/components/Icon.tsx';

interface DateInputFieldProps {
  placeholder: string;
  errorMessage?: string;
  value?: Date;
  onChange?: (date: Date) => void;
}

export interface DateInputFieldRef {
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

const DateInputField = forwardRef<DateInputFieldRef, DateInputFieldProps>(
  ({ placeholder, errorMessage, value, onChange }, ref) => {
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(value);

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
          visible={isPickerVisible}
          onClose={() => setIsPickerVisible(false)}
          onConfirm={handleConfirm}
          initialDate={selectedDate}
        />
      </>
    );
  }
);

DateInputField.displayName = 'DateInputField';

export default DateInputField;
