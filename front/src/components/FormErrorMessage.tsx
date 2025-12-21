import styled from '@/utils/scale/CustomStyled.ts';
import Icon from '@/components/Icon.tsx';
import DangerCircleIcon from '@/assets/icons/danger-circle.svg'
import { Typography } from '@/components/theme';

export default function FormErrorMessage ({ message }: { message: string }) {
  return (
    <Wrapper>
      <Icon width={17} height={17} Svg={DangerCircleIcon} />
      <Typography
        fontSize={12}
        lineHeight="140%"
        color="#767676"
        marginLeft={3}
      >{message}</Typography>
    </Wrapper>
  )
}

const Wrapper = styled.View`
  flex-direction: row;
  align-items: center;
`