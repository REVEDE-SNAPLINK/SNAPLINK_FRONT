import styled from '@/utils/scale/CustomStyled.ts';
import { ActivityIndicator } from 'react-native';
import { theme } from '@/theme';

interface LoadingSpinnerProps {
  visible: boolean;
}

export default function LoadingSpinner({ visible }: LoadingSpinnerProps) {
  if (!visible) return null;

  return (
    <Overlay>
      <ActivityIndicator
        size="large"
        color={theme.colors.primary}
      />
    </Overlay>
  )
}

const Overlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
  z-index: 9999;
`

