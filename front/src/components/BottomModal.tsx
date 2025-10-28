import { ReactNode } from 'react';
import { Modal, Pressable } from 'react-native';
import styled from 'styled-components/native';
import { theme } from '@/constants/theme';
import AppText from '@/components/AppText';
import SubmitButton from '@/components/SubmitButton';

type BottomModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: ReactNode;
  confirmDisabled?: boolean;
};

export default function BottomModal({
  visible,
  onClose,
  onConfirm,
  title,
  children,
  confirmDisabled = false,
}: BottomModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Overlay>
        <Pressable
          style={{ flex: 1 }}
          onPress={onClose}
        />
        <ModalContainer>
          <AppText
            fontSize={16}
            fontWeight={600}
            lineHeight={22.4}
            letterSpacing={-0.4}
            marginBottom={60}
            textAlign="center"
          >{title}</AppText>
          {children}
          <SubmitButton
            text="완료"
            disabled={confirmDisabled}
            onPress={onConfirm}
            marginTop={60}
          />
        </ModalContainer>
        <Pressable
          style={{ flex: 1 }}
          onPress={onClose}
        />
      </Overlay>
    </Modal>
  );
}

const Overlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.3);
  justify-content: center;
  align-items: center;
`;

const ModalContainer = styled.View`
  width: ${theme.horizontalScale(333)}px;
  min-height: ${theme.verticalScale(400)}px;
  border-radius: ${theme.moderateScale(10)}px;
  background-color: ${theme.colors.white};
  padding-top: ${theme.verticalScale(41)}px;
  padding-bottom: ${theme.verticalScale(38.98)}px;
  padding-left: ${theme.horizontalScale(16)}px;
  padding-right: ${theme.horizontalScale(16)}px;
  justify-content: space-between;
`;