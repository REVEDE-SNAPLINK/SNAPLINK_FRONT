import { TouchableOpacityProps } from 'react-native';
import styled from '@/utils/scale/CustomStyled';

type BackButtonProps = TouchableOpacityProps;

const StyledButton = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  justify-content: center;
  align-items: center;
`;

const Arrow = styled.Text`
  font-size: 24px;
  color: #000000;
`;

/**
 * 뒤로가기 버튼 컴포넌트
 *
 * @example
 * ```tsx
 * <BackButton onPress={() => navigation.goBack()} />
 * ```
 */
export default function BackButton(props: BackButtonProps) {
  return (
    <StyledButton {...props}>
      <Arrow>←</Arrow>
    </StyledButton>
  );
}
