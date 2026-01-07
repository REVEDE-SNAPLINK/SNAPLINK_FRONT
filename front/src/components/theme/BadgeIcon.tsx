import Icon from '@/components/Icon.tsx';
import { ComponentType } from 'react';
import { SvgProps } from 'react-native-svg';
import styled from '@/utils/scale/CustomStyled.ts';
import { Typography } from '@/components/theme/index.ts';

interface BadgeIconProps {
  isNew?: boolean;
  Svg: ComponentType<SvgProps>;
  width: number;
  height: number;
  badgeCount?: number;
}

export default function BadgeIcon({
  isNew,
  Svg,
  width,
  height,
  badgeCount,
}: BadgeIconProps) {
  return (
    <Wrapper>
      {(isNew || (badgeCount && badgeCount > 0)) && (
        <Badge>
          <Typography
            fontSize={9}
            color="#fff"
          >
            {badgeCount !== undefined ? badgeCount : 'N'}
          </Typography>
        </Badge>
      )}
      <Icon width={width} height={height} Svg={Svg} />
    </Wrapper>
  )
}

const Wrapper = styled.View``

const Badge = styled.View`
  width: 15px;
  height: 15px;
  align-items: center;
  justify-content: center;
  background-color: #E84E4E;
  position: absolute;
  top: -4px;
  right: -3px;
  border-radius: 15px;
  z-index: 1;
`