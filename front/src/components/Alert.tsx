import styled from '@/utils/scale/CustomStyled.ts';
import Typography from '@/components/theme/Typography.tsx';
import SubmitButton from '@/components/theme/SubmitButton.tsx';

interface AlertProps {
  onClose: () => void;
  onCancel: () => void;
  onConfirm: () => void;
  isOpen: boolean;
  title: string;
  description: string;
  cancelText: string;
  confirmText: string;
}

export default function Alert({
  onClose,
  onConfirm,
  onCancel,
  isOpen = false,
  title,
  description,
  cancelText,
  confirmText,
}: AlertProps) {
  if (isOpen) {
    return (
      <Container>
        <Overlay onPress={onClose} />
        <ModalContainer>
          <Typography
            fontSize={16}
            fontWeight="semiBold"
            lineHeight="140%"
            letterSpacing="-2.5%"
            color="#000"
          >
            {title}
          </Typography>
          <Typography
            fontSize={12}
            lineHeight="140%"
            letterSpacing="-2.5%"
            color="textSecondary"
            marginBottom={5}
          >
            {description}
          </Typography>
          <ButtonWrapper>
            <SubmitButton
              type="cancel"
              size="small"
              text={cancelText}
              onPress={onCancel}
              marginRight={9}
            />
            <SubmitButton
              size="small"
              text={confirmText}
              onPress={onConfirm}
            />
          </ButtonWrapper>
        </ModalContainer>
      </Container>
    )
  }

  return <></>
}

const Container = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  justify-content: center;
  align-items: center;
`

const Overlay = styled.TouchableOpacity`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 1001;
`

const ModalContainer = styled.View`
  width: 317px;
  height: 153px;
  padding: 19px 16px;
  background-color: white;
  border-radius: 10px;
  justify-content: space-between;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  position: relative;
  z-index: 1002;
`

const ButtonWrapper = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
`