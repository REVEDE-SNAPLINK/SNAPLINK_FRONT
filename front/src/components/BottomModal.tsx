import { ReactNode } from 'react';
import { Modal, TouchableOpacity } from 'react-native';
import styled from '@/utils/scale/CustomStyled';
import Typography from '@/components/theme/Typography';
import SubmitButton from '@/components/theme/SubmitButton';

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
      <TouchableOpacity
        style={{ flex: 1 }}
        activeOpacity={1}
        onPress={onClose}
      >
        <Overlay>
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <ModalContainer>
              <TitleWrapper>
                <Typography
                  fontSize={16}
                  fontWeight="semiBold"
                  lineHeight={22.4}
                  letterSpacing={-0.4}
                >{title}</Typography>
              </TitleWrapper>
              {children}
              <ButtonWrapper>
                <SubmitButton
                  text="완료"
                  disabled={confirmDisabled}
                  onPress={onConfirm}
                />
              </ButtonWrapper>
            </ModalContainer>
          </TouchableOpacity>
        </Overlay>
      </TouchableOpacity>
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
  width: 333px;
  border-radius: 10px;
  background-color: #FFFFFF;
  padding: 41px 16px 38.98px 16px;
`;

const TitleWrapper = styled.View`
  margin-bottom: 60px;
  align-items: center;
`;

const ButtonWrapper = styled.View`
  margin-top: 60px;
`;