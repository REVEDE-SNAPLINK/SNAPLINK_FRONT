import React from 'react';
import styled from '@/utils/scale/CustomStyled';
import Typography from '@/components/theme/Typography';
import ScreenContainer from '@/components/ScreenContainer.tsx';
import Icon from '@/components/Icon.tsx';
import Logo from '@/assets/imgs/logo.svg';
import ArrowRightIcon from '@/assets/icons/arrow-right2.svg';
import TypeUserImg from '@/assets/imgs/type-user.svg';
import TypePhotographerImg from '@/assets/imgs/type-photographer.svg';

interface SelectTypeViewProps {
  onPressUser: () => void;
  onPressPhotographer: () => void;
}

export default function SelectTypeView({
  onPressUser,
  onPressPhotographer
}: SelectTypeViewProps) {
  return (
    <ScreenContainer>
      <LogoContainer>
        <Icon width={220} height={40} Svg={Logo} />
        <Typography
          fontSize={11}
          lineHeight="140%"
          letterSpacing="-2.5%"
          color="#9D9D9D"
          marginTop={12}
        >
          스냅사진을 더욱 간편하게 경험하세요!
        </Typography>
      </LogoContainer>

      <SelectButtonContainer>
        <SelectButton
          onPress={onPressUser}
        >
          <SelectButtonImageWrapper>
            <Icon width={89} height={101} Svg={TypeUserImg} />
          </SelectButtonImageWrapper>
          <SelectButtonTextWrapper>
            <SelectButtonTitleWrapper>
              <Typography
                fontSize={16}
                fontWeight="semiBold"
                lineHeight="140%"
                letterSpacing="-2.5%"
              >
                고객으로 시작
              </Typography>
              <Icon width={24} height={24} Svg={ArrowRightIcon} />
            </SelectButtonTitleWrapper>
            <Typography
              fontSize={12}
              lineHeight="140%"
              letterSpacing="-2.5%"
              color="#767676"
            >
              내가 원하는 작가님을 찾아서{'\n'}사진을 촬영해 보세요.
            </Typography>
          </SelectButtonTextWrapper>
        </SelectButton>

        <SelectButton
          onPress={onPressPhotographer}
        >
          <SelectButtonImageWrapper>
            <Icon width={87} height={73} Svg={TypePhotographerImg} />
          </SelectButtonImageWrapper>
          <SelectButtonTextWrapper>
            <SelectButtonTitleWrapper>
              <Typography
                fontSize={16}
                fontWeight="semiBold"
                lineHeight="140%"
                letterSpacing="-2.5%"
              >
                사진 작가로 시작
              </Typography>
              <Icon width={24} height={24} Svg={ArrowRightIcon} />
            </SelectButtonTitleWrapper>
            <Typography
              fontSize={12}
              lineHeight="140%"
              letterSpacing="-2.5%"
              color="#767676"
            >
              스냅 사진작가로 활동하고{'\n'}수익을 창출해 보세요.
            </Typography>
          </SelectButtonTextWrapper>
        </SelectButton>
      </SelectButtonContainer>
    </ScreenContainer>
  );
}

const LogoContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`

const SelectButtonContainer = styled.View`
  flex: 1;
`

const SelectButton = styled.TouchableOpacity`
  width: 318px;
  height: 123px;
  border-radius: 16px;
  background: #F4F4F4;
  margin-bottom: 13px;
  flex-direction: row;
  justify-content: space-between;
`

const SelectButtonImageWrapper = styled.View`
  flex: 0.46;
  justify-content: center;
  align-items: center;
`

const SelectButtonTextWrapper = styled.View`
  flex: 0.54;
  justify-content: center;
`

const SelectButtonTitleWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  width: 135px;
  justify-content: space-between;
  margin-bottom: 7px;
`
