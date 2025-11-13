import { useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from '@/utils/scale/CustomStyled';
import Typography from '@/components/theme/Typography';
import SelectButton from '@/components/SelectButton';
import BackButton from '@/components/BackButton';
import Type1 from '@/assets/imgs/type1.svg';
import ScreenContainer from '@/components/ScreenContainer.tsx';

interface SelectTypeViewProps {
  onPressBackButton: () => void;
  onPressUser: () => void;
  onPressPhotographer: () => void;
}

export default function SelectTypeView({
  onPressBackButton,
  onPressUser,
  onPressPhotographer
}: SelectTypeViewProps) {
  const UserImg = useMemo(() =>
    <Type1 width={100} height={100} />,
    []);
  const PhotographerImg = useMemo(() =>
    <StyledImage source={require('@/assets/imgs/type2.png')} />, []);

  return (
    <ScreenContainer>
      <Container>
        <Header>
          <StyledBackButton onPress={onPressBackButton} />
          <Typography
            color="primary"
            fontWeight="extraBold"
            fontSize={27}
            lineHeight={40}
            letterSpacing={-1.08}
          >
            Snaplink
          </Typography>
        </Header>

        <TitleWrapper>
          <Typography
            fontSize={18}
            fontWeight="bold"
            lineHeight="140%"
            letterSpacing="-2.5%"
          >스냅링크를 어떻게 이용하고 싶으신가요?</Typography>
        </TitleWrapper>

        <SelectButton
          Img={UserImg}
          title="촬영 모델"
          description={'내가 원하는 작가님을 찾아서\n사진 촬영을 하고 싶어요.'}
          onPress={onPressUser}
        />

        <Spacer />

        <SelectButton
          Img={PhotographerImg}
          title="사진 작가"
          description={'스냅 사진작가로 활동하고\n사진 촬영을 하고 싶어요.'}
          onPress={onPressPhotographer}
        />
      </Container>
    </ScreenContainer>
  );
}

const Container = styled(SafeAreaView)`
  flex: 1;
  padding: 0px 20px;
`;

const Header = styled.View`
  margin-top: 11.98px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const StyledBackButton = styled(BackButton)`
  position: absolute;
  left: 0;
`;

const TitleWrapper = styled.View`
  margin-top: 50px;
  margin-bottom: 57px;
  align-items: center;
`;

const StyledImage = styled.Image`
  width: 79px;
  height: 58px;
`;

const Spacer = styled.View`
  height: 20px;
`;