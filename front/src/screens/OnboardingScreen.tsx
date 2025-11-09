import { useState, useRef } from "react";
import Swiper from "react-native-swiper";
import BottomSwipeNavigation from "@/components/onboarding/BottomSwipeNavigation";
import { styled } from '@/utils/CustomStyled';
import Typography from "@/components/theme/Typography";
import SubmitButton from '@/components/theme/SubmitButton';
import { useAuth } from '@/context/AuthContext';
import { View } from 'react-native';
import Onboarding2Image from '@/assets/imgs/onboarding2.svg';
import Onboarding3Image from '@/assets/imgs/onboarding3.svg';

const LENGTH = 3;

export default function OnboardingScreen() {
  const { setOnboardingSeen } = useAuth();

  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const mainSwiperRef = useRef<Swiper>(null);
  const parentSwiperRef = useRef<Swiper>(null);

  const onSkip = () => {
    setOnboardingSeen();
  }

  const onNext = () => {
    if (currentIdx >= LENGTH - 1) {
      parentSwiperRef.current?.scrollBy(1);
    } else {
      mainSwiperRef.current?.scrollBy(1);
    }
  }

  const onComplete = () => {
    setOnboardingSeen();
  }

  return (
    <Container>
      <Swiper
        showsPagination={false}
        loop={false}
        scrollEnabled={currentIdx === LENGTH - 1}
        ref={parentSwiperRef}
      >
        <View style={{
          flex: 1,
          width: '100%',
          alignItems: 'center'
        }}>
          <Swiper
            showsPagination={false}
            ref={mainSwiperRef}
            loop={false}
            onIndexChanged={(index: number) => setCurrentIdx(index)}
          >
            {SwipingList().map((item, idx) => (
              <View key={idx}>{item}</View>
            ))}
          </Swiper>
          <BottomSwipeNavigation
            length={LENGTH}
            idx={currentIdx}
            onSkip={onSkip}
            onNext={onNext}
          />
        </View>
        <OnboardingComplete onComplete={onComplete} />
      </Swiper>
    </Container>
  )
}

const SwipingList = () => {
  return [
    <OnboardingContent1 />,
    <OnboardingContent2 />,
    <OnboardingContent3 />,
  ]
}

const OnboardingContent1 = () => {
  return (
    <OnboardingContentContainer marginTop={167}>
      <TextWrapper>
        <Typography
          fontSize={25}
          fontWeight="bold"
          lineHeight={40}
          letterSpacing={-1}
        >
          '인생샷' 한 장에 <Typography fontSize={25} fontWeight="bold" color="primary">10만 원</Typography>,{'\n'}
          정말 이게 최선일까요?
        </Typography>
      </TextWrapper>
      <Onboarding1Image source={require('@/assets/imgs/onboarding1.png')} />
    </OnboardingContentContainer>
  )
}

const OnboardingContent2 = () => {
  return (
    <OnboardingContentContainer marginTop={167}>
      <Typography
        fontSize={25}
        fontWeight="bold"
        lineHeight={40}
        letterSpacing={-1}
      >
        <Typography fontSize={25} fontWeight="bold" color="primary">스냅 작가</Typography>님 예약,{'\n'}
        아직도 인스에서 헤매고 있나요?
      </Typography>
      <Onboarding2Image width={166} height={162} />
    </OnboardingContentContainer>
  )
}

const OnboardingContent3 = () => {
  return (
    <OnboardingContentContainer marginTop={208}>
      <Onboarding3Image width={182} height={182} />
      <Typography
        fontSize={23}
        fontWeight="bold"
        lineHeight={40}
        letterSpacing={-0.92}
      >
        이 모든 고민,{'\n'}
        <Typography fontSize={23} fontWeight="bold" color="primary">스냅링크</Typography>가 단번에 해결해 드릴게요.
      </Typography>
    </OnboardingContentContainer>
  )
}

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingComplete = ({ onComplete }: OnboardingScreenProps) => {
  return (
    <OnboardingCompleteContainer>
      <OnboardingCompleteImage source={require('@/assets/imgs/onboarding4.png')} />
      <CenterTextWrapper>
        <Typography
          fontSize={25}
          fontWeight="semiBold"
          lineHeight={40}
          letterSpacing={-1}
        >
          당신의 가장 빛나는 순간,{'\n'}더 이상 미루지 마세요.
        </Typography>
      </CenterTextWrapper>
      <ButtonWrapper>
        <SubmitButton
          text='Snaplink 시작하기'
          onPress={onComplete}
          disabled={false}
        />
      </ButtonWrapper>
    </OnboardingCompleteContainer>
  )
}

const Container = styled.View`
  flex: 1;
  background-color: #FFFFFF;
`;

const OnboardingContentContainer = styled.View<{ marginTop: number }>`
  flex: 1;
  margin-top: ${({ marginTop }) => marginTop}px;
  align-items: center;
`;

const TextWrapper = styled.View`
  padding-left: 29px;
  width: 100%;
  margin-bottom: 53px;
`;

const CenterTextWrapper = styled.View`
  width: 100%;
  align-items: center;
  margin-top: 45px;
  margin-bottom: 47px;
`;

const Onboarding1Image = styled.Image`
  max-width: 259.5px;
  max-height: 173px;
`;

const OnboardingCompleteContainer = styled.View`
  flex: 1;
  margin-top: 17px;
`;

const OnboardingCompleteImage = styled.Image`
  max-width: 100%;
  max-height: 60%;
  flex-shrink: 0;
`;

const ButtonWrapper = styled.View`
  padding: 0px 17px;
`;
