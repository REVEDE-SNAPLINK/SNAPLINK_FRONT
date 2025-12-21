import React from 'react';
import { TouchableOpacityProps } from 'react-native';
import { SvgProps } from 'react-native-svg';
import styled from '@/utils/scale/CustomStyled';
import Typography from '@/components/theme/Typography';

type SocialLoginButtonProps = TouchableOpacityProps & {
  backgroundColor: string;
  Icon: React.FC<SvgProps>;
  text: string;
  textColor?: string;
}

const StyledButton = styled.TouchableOpacity<{ $backgroundColor: string }>`
  width: 340px;
  height: 50px;
  border-radius: 8px;
  margin-bottom: 15px;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  flex-direction: row;
  justify-content: center;
  align-items: center;
  border: 0.5px solid #D6D6D6;
`;

/**
 * 소셜 로그인 버튼 컴포넌트
 *
 * @example
 * ```tsx
 * <SocialLoginButton
 *   backgroundColor='#FEE500'
 *   Icon={KakaoIcon}
 *   text='카카오'
 *   onPress={handleKakaoLogin}
 * />
 * ```
 */
export default function SocialLoginButton({
  backgroundColor,
  Icon,
  text,
  textColor = "#000",
  ...rest
}: SocialLoginButtonProps) {
  return (
    <StyledButton $backgroundColor={backgroundColor} {...rest}>
      <Icon width={16} height={16} />
      <Typography
        color={textColor}
        fontSize={14}
        fontWeight="medium"
        lineHeight={20}
        marginLeft={27}
      >
        {' '}{text} 계정으로 로그인
      </Typography>
    </StyledButton>
  );
}
