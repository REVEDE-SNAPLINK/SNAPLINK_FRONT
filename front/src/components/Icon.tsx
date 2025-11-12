import styled from '@/utils/scale/CustomStyled';
import { ImageSourcePropType } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { ComponentType } from 'react';

type BaseIconProps = {
  width: number;
  height: number;
  onPress?: () => void;
  disabled?: boolean;
};

type IconProps = BaseIconProps & (
  | { source: ImageSourcePropType }
  | { Svg: ComponentType<SvgProps>, color?: string; }
);

const IconWrapper = styled.View<{ width: number, height: number }>`
  ${({ width, height }) => `width: ${width}px; height: ${height}px;`}
  align-items: center;
  justify-content: center;
`

const IconImage = styled.Image`
  max-width: 100%;
  max-height: 100%;
`

const StyledSvg = (Svg: ComponentType<SvgProps>) => styled(Svg)`
  max-width: 100%;
  max-height: 100%;
`

export default function Icon(props: IconProps) {
  const { width, height } = props;

  if ('Svg' in props) {
    const SvgComponent = StyledSvg(props.Svg);
    return (
      <IconWrapper width={width} height={height}>
        <SvgComponent />
      </IconWrapper>
    );
  }

  return (
    <IconWrapper width={width} height={height}>
      <IconImage source={props.source} />
    </IconWrapper>
  );
}

export type { IconProps };