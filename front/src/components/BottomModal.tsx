import { ReactNode } from 'react';
import { Modal, Pressable } from 'react-native';
import { styled } from '@/utils/CustomStyled';
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
      <Overlay>
        <StyledPressable
          onPress={onClose}
        />
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
        <StyledPressable
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
  width: 333px;
  min-height: 400px;
  border-radius: 10px;
  background-color: #FFFFFF;
  padding-top: 41px;
  padding-bottom: 38.98px;
  padding-left: 16px;
  padding-right: 16px;
  justify-content: space-between;
`;

const TitleWrapper = styled.View`
  margin-bottom: 60px;
  align-items: center;
`;

const ButtonWrapper = styled.View`
  margin-top: 60px;
`;

const StyledPressable = styled(Pressable)`
  flex: 1
`