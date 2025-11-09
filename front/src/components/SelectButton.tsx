import { ReactElement } from 'react';
import { TouchableOpacityProps } from 'react-native';
import CustomStyled from '@/utils/CustomStyled';
import Typography from '@/components/theme/Typography';

type SelectButtonProps = TouchableOpacityProps & {
  Img: ReactElement;
  title: string;
  description: string;
}

const StyledButton = CustomStyled.TouchableOpacity`
  width: 100%;
  height: 124px;
  padding-left: 24px;
  flex-direction: row;
  align-items: center;
  background-color: #FFFFFF;
  border-radius: 16px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
`;

const ImgContainer = CustomStyled.View`
  width: 100px;
`;

const TextContainer = CustomStyled.View`
  margin-left: 15px;
`;

const Spacer = CustomStyled.View`
  height: 7px;
`

/**
 * 타입 선택 버튼 컴포넌트
 *
 * @example
 * ```tsx
 * <SelectButton
 *   selected={isSelected}
 *   Img={<UserIcon />}
 *   title="의뢰인으로 이용"
 *   description="내가 원하는 작가님을 찾아서..."
 *   onPress={onPress}
 * />
 * ```
 */
export default function SelectButton({
  Img,
  title,
  description,
  ...rest
}: SelectButtonProps) {
  return (
    <StyledButton {...rest}>
      <ImgContainer>{Img}</ImgContainer>
      <TextContainer>
        <Typography
          color="#111111"
          fontSize={16}
          fontWeight="semiBold"
          lineHeight="140%"
          letterSpacing="-2.5%"
        >
          {title}
        </Typography>
        <Spacer/>
        <Typography
          color="#767676"
          fontSize={12}
          fontWeight="medium"
          lineHeight="140%"
          letterSpacing="-2.5%"
        >
          {description}
        </Typography>
      </TextContainer>
    </StyledButton>
  );
}
