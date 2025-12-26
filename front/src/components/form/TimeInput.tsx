import { useState } from 'react';
import { Modal, Platform, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import styled from '@/utils/scale/CustomStyled.ts';
import ArrowDownIcon from '@/assets/icons/arrow-down.svg';
import Icon from '@/components/Icon.tsx';
import { SubmitButton } from '@/components/theme';

interface TimeInputProps {
  placeholder: string;
  value?: Date;
  onChange?: (time: Date) => void;
}

const InputFieldWrapper = styled.View`
  width: 136px;
  height: 50px;
  background-color: #F9F9F9;
  border: 1px solid #E9E9E9;
  border-radius: 5px;
  padding: 0 12px;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
`;

const StyledInputField = styled.Text`
  font-size: 14px;
  font-family: Pretendard-Regular;
  letter-spacing: 0.2px;
  color: #000;
`;

const PlaceholderText = styled.Text`
  font-size: 14px;
  font-family: Pretendard-Regular;
  letter-spacing: 0.2px;
  color: #737373;
`;

const ModalContainer = styled.View`
  flex: 1;
  justify-content: flex-end;
  background-color: rgba(0, 0, 0, 0.3);
`;

const PickerContainer = styled.View`
  background-color: #FFFFFF;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding: 20px;
`;

const Header = styled.View`
  align-items: center;
  padding-bottom: 10px;
  border-bottom-width: 1px;
  border-bottom-color: #E9E9E9;
  margin-bottom: 10px;
`;

const HeaderText = styled.Text`
  font-size: 16px;
  font-family: Pretendard-SemiBold;
  color: #000;
`;

const ButtonWrapper = styled.View`
  margin-top: 20px;
  margin-bottom: 10px;
  align-items: center;
`;

export default function TimeInput({
  placeholder,
  value,
  onChange,
}: TimeInputProps) {
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState(value || new Date());

  const handlePress = () => {
    setIsPickerVisible(true);
  };

  const handleConfirm = () => {
    // Round to nearest hour
    const roundedTime = new Date(selectedTime);
    roundedTime.setMinutes(0);
    roundedTime.setSeconds(0);
    roundedTime.setMilliseconds(0);

    onChange?.(roundedTime);
    setIsPickerVisible(false);
  };

  const formatTime = (time?: Date) => {
    if (!time) return '';
    const hours = String(time.getHours()).padStart(2, '0');
    return `${hours}:00`;
  };

  if (Platform.OS === 'android') {
    return (
      <>
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <InputFieldWrapper pointerEvents="none">
            {value ? (
              <StyledInputField>{formatTime(value)}</StyledInputField>
            ) : (
              <PlaceholderText>{placeholder}</PlaceholderText>
            )}
            <Icon width={24} height={24} Svg={ArrowDownIcon} />
          </InputFieldWrapper>
        </TouchableOpacity>
        {isPickerVisible && (
          <DateTimePicker
            value={selectedTime}
            mode="time"
            display="default"
            is24Hour={true}
            onChange={(event, time) => {
              if (event.type === 'set' && time) {
                const roundedTime = new Date(time);
                roundedTime.setMinutes(0);
                roundedTime.setSeconds(0);
                roundedTime.setMilliseconds(0);
                onChange?.(roundedTime);
              }
              setIsPickerVisible(false);
            }}
          />
        )}
      </>
    );
  }

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <InputFieldWrapper pointerEvents="none">
          {value ? (
            <StyledInputField>{formatTime(value)}</StyledInputField>
          ) : (
            <PlaceholderText>{placeholder}</PlaceholderText>
          )}
          <Icon width={24} height={24} Svg={ArrowDownIcon} />
        </InputFieldWrapper>
      </TouchableOpacity>
      <Modal
        visible={isPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsPickerVisible(false)}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={() => setIsPickerVisible(false)}
        >
          <ModalContainer>
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <PickerContainer>
                <Header>
                  <HeaderText>시간 선택</HeaderText>
                </Header>
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  display="spinner"
                  is24Hour={true}
                  onChange={(event, time) => {
                    if (!time) return;

                    const fixed = new Date(time);
                    fixed.setMinutes(0, 0, 0);

                    setSelectedTime(fixed);
                  }}
                  locale="ko"
                  textColor="#000"
                />
                <ButtonWrapper>
                  <SubmitButton
                    text="확인"
                    onPress={handleConfirm}
                    width="80%"
                    size="small"
                  />
                </ButtonWrapper>
              </PickerContainer>
            </TouchableOpacity>
          </ModalContainer>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
