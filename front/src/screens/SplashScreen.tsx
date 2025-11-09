import React from 'react';
import { styled } from '@/utils/CustomStyled';
import Typography from '@/components/theme/Typography';

export default function SplashScreen() {
  return (
    <Container>
      <LogoImageWrapper>
        <LogoImage source={require('@/assets/imgs/logo.png')} />
      </LogoImageWrapper>

      <DescriptionWrapper>
        <Typography
          color="#9D9D9D"
          fontSize={11}
          lineHeight={15.4}
          letterSpacing={-0.275}
        >
          스냅사진 더욱 간편하게 경험하세요!
        </Typography>
      </DescriptionWrapper>
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const LogoImageWrapper = styled.View`
  width: 223px;
  height: 40px;
`;

const LogoImage = styled.Image`
  max-width: 100%;
  max-height: 100%;
`;

const DescriptionWrapper = styled.View`
  margin-top: 14px;
  align-items: center;
`;
