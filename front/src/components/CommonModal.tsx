import React from 'react';
import { Modal, TouchableOpacity } from 'react-native';
import styled from '@/utils/scale/CustomStyled';

interface CommonModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function CommonModal({ visible, onClose, children }: CommonModalProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Overlay onPress={onClose}>
        <ModalContainer>
          {children}
        </ModalContainer>
      </Overlay>
    </Modal>
  );
}

const Overlay = styled(TouchableOpacity).attrs({
  activeOpacity: 1,
})`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(47, 44, 43, 0.5);
`;

const ModalContainer = styled.View`
  width: 327px;
  min-height: 150px;
  background-color: #fff;
  padding: 20px 16px;
  border-radius: 10px;
`;
