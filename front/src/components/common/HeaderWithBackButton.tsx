import styled from '@/utils/scale/CustomStyled.ts';
import BackButton from '@/components/common/BackButton.tsx';
import Typography from '@/components/theme/Typography.tsx';
import IconButton from '@/components/IconButton.tsx';
import { SvgProps } from 'react-native-svg';
import { ComponentType } from 'react';
import Icon from '@/components/Icon.tsx';
import Logo from '@/assets/imgs/logo-black.svg'
import MoreCircleIcon from '@/assets/icons/more-circle.svg'

interface HeaderWithBackButtonProps {
  onPressBack?: () => void;
  onPressTool?: () => void;
  onPressMore?: () => void;
  title: string;
  ToolIcon?: ComponentType<SvgProps>;
  isShowLogo?: boolean;
  height?: number;
  iconSize?: number;
}

export default function HeaderWithBackButton({
  onPressBack,
  onPressTool,
  onPressMore,
  title,
  ToolIcon,
  isShowLogo = false,
  height = 70,
  iconSize = 24,
}: HeaderWithBackButtonProps) {
  return (
    <Container height={height}>
      {onPressBack && (
        <BackButtonWrapper>
          <BackButton onPress={onPressBack} />
        </BackButtonWrapper>
      )}
      {title === "" && isShowLogo ? (
          <Icon width={89} height={20} Svg={Logo} />
        ) : (
        <Typography
          fontSize={18}
          fontWeight="bold"
          lineHeight="140%"
          letterSpacing="-2.5%"
        >
          {title}
        </Typography>
      )}
      <ToolButtonWrapper>
        {ToolIcon !== undefined && onPressTool && (
          <IconButton
            width={iconSize}
            height={iconSize}
            Svg={ToolIcon}
            onPress={onPressTool}
          />
        )}
        {onPressMore && (
          <MoreButtonWrapper onPress={onPressMore}>
            <Icon width={24} height={24} Svg={MoreCircleIcon} />
          </MoreButtonWrapper>
        )}
      </ToolButtonWrapper>
    </Container>
  );
}

const Container = styled.View<{ height: number }>`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: ${({ height }) => height}px;
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
  flex-direction: row;
  align-items: center;
`

const MoreButtonWrapper = styled.Pressable`
  margin-left: 10px;
`