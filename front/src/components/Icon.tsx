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

export type IconProps =
  | (BaseIconProps & {
  source: ImageSourcePropType;
})
  | (BaseIconProps & {
  Svg: ComponentType<SvgProps>;
  color?: string;
});

const IconWrapper = styled.View<{ width: number; height: number }>`
  ${({ width, height }) => `
    width: ${width}px;
    height: ${height}px;
  `}
  align-items: center;
  justify-content: center;
`;

const IconImage = styled.Image``;

export default function Icon(props: IconProps) {
  const { width, height } = props;

  // ✅ SVG 아이콘
  if ('Svg' in props) {
    const SvgComponent = props.Svg;

    return (
      <IconWrapper width={width} height={height}>
        <SvgComponent
          width={width}
          height={height}
          {...(props.color ? { fill: props.color, stroke: props.color } : {})}
        />
      </IconWrapper>
    );
  }

  return (
    <IconWrapper width={width} height={height}>
      <IconImage
        source={props.source}
        style={{ width, height }}
        resizeMode="contain"
      />
    </IconWrapper>
  );
}