import styled from '@/utils/scale/CustomStyled.ts';
import BackButton from '@/components/BackButton.tsx';
import Typography from '@/components/theme/Typography.tsx';
import IconButton from '@/components/IconButton.tsx';
import { SvgProps } from 'react-native-svg';
import { ComponentType } from 'react';

interface HeaderWithBackButtonProps {
  onPressBack?: () => void;
  onPressTool?: () => void;
  title: string;
  ToolIcon?: ComponentType<SvgProps>;
}

export default function HeaderWithBackButton({
  onPressBack,
  onPressTool,
  title,
  ToolIcon,
}: HeaderWithBackButtonProps) {
  return (
    <Container>
      {onPressBack && (
        <BackButtonWrapper>
          <BackButton onPress={onPressBack} />
        </BackButtonWrapper>
      )}
      <Typography
        fontSize={20}
        fontWeight="bold"
        lineHeight="140%"
        letterSpacing="-2.5%"
      >
        {title}
      </Typography>
      <ToolButtonWrapper>
        {ToolIcon !== undefined && onPressTool && (
          <IconButton width={24} height={24} Svg={ToolIcon} onPress={onPressTool} />
        )}
      </ToolButtonWrapper>
    </Container>
  )
}

const Container = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 100px;
  background-color: #fff;
  width: 100%;
`

const BackButtonWrapper = styled.View`
  position: absolute;
  left: 20px;
  top: 0;
  height: 100%;
  justify-content: center;
`

const ToolButtonWrapper = styled.View`
  position: absolute;
  right: 20px;
  top: 0;
  height: 100%;
  justify-content: center;
`