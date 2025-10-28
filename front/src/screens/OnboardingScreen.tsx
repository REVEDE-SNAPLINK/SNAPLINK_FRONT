import {useState, useRef} from "react";
import Swiper from "react-native-swiper";
import BottomSwipeNavigation from "@/components/onboarding/BottomSwipeNavigation.tsx";
import styled from 'styled-components/native';
import { theme } from '@/constants/theme';
import AppText from "@/components/AppText.tsx";
import { Text, View } from 'react-native';
import Onboarding2Image from '@/assets/imgs/onboarding2.svg';
import Onboarding3Image from '@/assets/imgs/onboarding3.svg';
import SubmitButton from '@/components/SubmitButton.tsx';
import { useAuth } from '@/context/AuthContext.tsx';

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
                  {SwipingList().map(item => (item))}
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
          <View
            style={{
              paddingLeft: theme.horizontalScale(29),
              width: '100%'
            }}
          >
            <AppText
              color="black"
              fontSize={25}
              fontWeight={700}
              lineHeight={40}
              letterSpacing={-1}
              marginBottom={53}
            >'인생샷' 한 장에 <Text style={{ color: theme.colors.primary }}>10만 원</Text>,{'\n'}정말 이게 최선일까요?</AppText>
          </View>
          <Onboarding1Image source={require('@/assets/imgs/onboarding1.png')} />
        </OnboardingContentContainer>
    )
}

const OnboardingContent2 = () => {
    return (
        <OnboardingContentContainer marginTop={167}>
          <AppText
              color="black"
              fontSize={25}
              fontWeight={700}
              lineHeight={40}
              letterSpacing={-1}
              marginBottom={45}
          ><Text style={{ color: theme.colors.primary }}>스냅 작가</Text>님 예약,{'\n'}아직도 인스에서 헤매고 있나요?</AppText>
          <Onboarding2Image width={theme.horizontalScale(166)} height={theme.verticalScale(162)} />
        </OnboardingContentContainer>
    )
}

const OnboardingContent3 = () => {
    return (
        <OnboardingContentContainer marginTop={208}>
          <Onboarding3Image width={theme.moderateScale(182)} height={theme.moderateScale(182)} />
          <AppText
              color="black"
              fontSize={23}
              fontWeight={700}
              lineHeight={40}
              letterSpacing={-0.92}
              marginTop={35}
          >이 모든 고민,{'\n'}<Text style={{ color: theme.colors.primary }}>스냅링크</Text>가 단번에 해결해 드릴게요.</AppText>
        </OnboardingContentContainer>
    )
}

interface OnboardingScreenProps {
  onComplete:  () => void;
}

const OnboardingComplete = ({onComplete}: OnboardingScreenProps) => {
  return (
    <OnboardingCompleteContainer>
      <OnboardingCompleteImage source={require('@/assets/imgs/onboarding4.png')} />
      <AppText
        color="black"
        textAlign="center"
        fontSize={25}
        fontWeight={600}
        lineHeight={40}
        letterSpacing={-1}
        marginTop={45}
        marginBottom={47}
      >당신의 가장 빛나는 순간,{'\n'}더 이상 미루지 마세요.</AppText>
      <View style={{ paddingLeft: theme.horizontalScale(17), paddingRight: theme.horizontalScale(17) }}>
        <SubmitButton
          text='Snaplink 시작하기'
          onPress={onComplete}
          disabled={false}
        />
      </View>
    </OnboardingCompleteContainer>
  )
}

const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.white};
`;

const OnboardingContentContainer = styled.View<{ marginTop: number }>`
  flex: 1;
  margin-top: ${({ marginTop }) => theme.verticalScale(marginTop)}px;
  align-items: center;
`;

const Onboarding1Image = styled.Image`
  max-width: ${theme.horizontalScale(259.5)};
  max-height: ${theme.verticalScale(173)};
`

const OnboardingCompleteContainer = styled.View`
  flex: 1;
  margin-top: ${theme.verticalScale(17)}px;
`

const OnboardingCompleteImage = styled.Image`
  max-width: 100%;
  max-height: 60%;
  flex-shrink: 0;
`;
