import { TouchableOpacityProps } from 'react-native';
import styled from "styled-components/native";
import {theme} from '@/constants/theme'
import ArrowLeftIcon from '@/assets/icons/arrow-left.svg';

type BackButtonProps = TouchableOpacityProps & {
  onPress: () => void;
}

export default function BackButton ({
  onPress,
  ...rest
}: BackButtonProps) {

  return (
    <StyledBackButton onPress={onPress} {...rest}>
      <ArrowLeftIcon
        width={theme.horizontalScale(30)} height={theme.verticalScale(30)}
      />
    </StyledBackButton>
  )
}

const StyledBackButton = styled.TouchableOpacity`
  justify-content: center;
  align-items: center;
`