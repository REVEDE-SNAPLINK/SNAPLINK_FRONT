import { useState } from 'react';
import { Modal, Platform, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import styled from '@/utils/scale/CustomStyled';
import { SubmitButton } from '@/components/theme';

type DatePickerModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  initialDate?: Date;
};

export default function DatePickerModal({
  visible,
  onClose,
  onConfirm,
  initialDate,
}: DatePickerModalProps) {
  const maxYear = new Date().getFullYear() - 14;
  const maximumDate = new Date(maxYear, 11, 31);
  const effectiveInitialDate = initialDate || maximumDate;
  const [selectedDate, setSelectedDate] = useState(effectiveInitialDate);

  const handleConfirm = () => {
    onConfirm(selectedDate);
    onClose();
  };

  if (!visible) return null;

  // Android uses modal natively
  if (Platform.OS === 'android') {
    return (
      <DateTimePicker
        value={selectedDate}
        mode="date"
        display="default"
        maximumDate={maximumDate}
        onChange={(event, date) => {
          if (event.type === 'set' && date) {
            onConfirm(date);
          }
          onClose();
        }}
      />
    );
  }

  // iOS uses custom modal
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={{ flex: 1 }}
        activeOpacity={1}
        onPress={onClose}
      >
        <Container>
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <PickerContainer>
              <Header>
                <HeaderText>생년월일 선택</HeaderText>
              </Header>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                maximumDate={maximumDate}
                onChange={(event, date) => {
                  if (date) setSelectedDate(date);
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
        </Container>
      </TouchableOpacity>
    </Modal>
  );
}

const Container = styled.View`
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
