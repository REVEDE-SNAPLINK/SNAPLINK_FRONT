import React, {useRef, useState} from 'react';
import {Dimensions, TouchableOpacity} from 'react-native';
import styled from 'styled-components/native';
import Swiper from 'react-native-swiper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {theme} from '@/constants/theme';
import AppText from '@/components/AppText';
import ArrowRightIcon from '@/assets/icons/arrow-right.svg';
import Onboarding2Svg from '@/assets/imgs/onboarding2.svg';
import Onboarding3Svg from '@/assets/imgs/onboarding3.svg';
import {useAuth} from '@/context/AuthContext';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${theme.colors.background};
`;

const Slide = styled.View`
  flex: 1;
`;

const PageContainer = styled.View`
  flex: 1;
`;

const ContentContainer = styled.View<{ isThirdPage?: boolean }>`
  padding-horizontal: ${theme.scale(32)}px;
  padding-top: ${({ isThirdPage }) =>
    isThirdPage ? 0 : theme.verticalScale(80)}px;
  padding-bottom: ${({ isThirdPage }) =>
    isThirdPage ? theme.verticalScale(120) : 0}px;
`;

const ImageBottom = styled.View`
  width: ${SCREEN_WIDTH}px;
  height: ${theme.verticalScale(300)}px;
  margin-top: auto;
  margin-bottom: ${theme.verticalScale(120)}px;
`;

const ImageCenterTop = styled.View`
  width: ${SCREEN_WIDTH}px;
  height: ${theme.verticalScale(250)}px;
  margin-top: ${theme.verticalScale(100)}px;
  margin-bottom: ${theme.verticalScale(30)}px;
`;

const PaginationContainer = styled.View`
  position: absolute;
  bottom: ${theme.verticalScale(60)}px;
  left: 0;
  right: 0;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-horizontal: ${theme.scale(32)}px;
`;

const DotsContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${theme.scale(6)}px;
`;

const Dot = styled.View<{ isActive?: boolean }>`
  width: ${({ isActive }) => theme.scale(isActive ? 16 : 8)}px;
  height: ${theme.scale(4)}px;
  border-radius: ${theme.scale(2)}px;
  background-color: ${({ isActive }) =>
    isActive ? theme.colors.primary : '#D6D9E1'};
`;

const NextButton = styled.TouchableOpacity`
  width: ${theme.scale(56)}px;
  height: ${theme.scale(56)}px;
  border-radius: ${theme.scale(28)}px;
  background-color: ${theme.colors.primary};
  align-items: center;
  justify-content: center;
`;

const GetStartedContainer = styled.View`
  flex: 1;
`;

const GetStartedImage = styled.Image`
  width: ${SCREEN_WIDTH}px;
  height: ${theme.verticalScale(300)}px;
  margin-top: ${theme.verticalScale(60)}px;
`;

const GetStartedTextContainer = styled.View`
  padding-horizontal: ${theme.scale(32)}px;
  padding-top: ${theme.verticalScale(40)}px;
  padding-bottom: ${theme.verticalScale(20)}px;
`;

const GetStartedButton = styled.TouchableOpacity`
  margin-horizontal: ${theme.scale(32)}px;
  margin-bottom: ${theme.verticalScale(60)}px;
  height: ${theme.scale(56)}px;
  border-radius: ${theme.radius.md}px;
  background-color: ${theme.colors.primary};
  align-items: center;
  justify-content: center;
`;

const BottomImage = styled.Image`
  width: ${SCREEN_WIDTH}px;
  height: ${theme.verticalScale(300)}px;
  margin-top: auto;
  margin-bottom: ${theme.verticalScale(120)}px;
`;

const OnboardingScreen = () => {
  const swiperRef = useRef<Swiper>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showGetStarted, setShowGetStarted] = useState(false);
  const {setOnboardingSeen} = useAuth();

  const handleNext = () => {
    if (currentIndex < 2) {
      swiperRef.current?.scrollBy(1);
    } else {
      // 3번째 페이지에서 화살표 클릭하면 GetStarted로
      setShowGetStarted(true);
    }
  };

  const handleSkip = async () => {
    await setOnboardingSeen();
  };

  const handleGetStarted = async () => {
    await setOnboardingSeen();
  };

  if (showGetStarted) {
    return (
      <Container edges={['top']}>
        <GetStartedContainer>
          <GetStartedImage
            source={require('@/assets/imgs/onboarding4.png')}
            resizeMode="contain"
          />

          <GetStartedTextContainer>
            <AppText
              weight={600}
              align="center"
              color="textPrimary"
              style={{
                fontSize: theme.moderateScale(25),
                lineHeight: theme.moderateScale(40),
                letterSpacing: theme.moderateScale(-1),
              }}>
              당신의 가장 빛나는 순간,{'\n'}더 이상 미루지 마세요.
            </AppText>
          </GetStartedTextContainer>

          <GetStartedButton
            onPress={handleGetStarted}
            activeOpacity={0.8}>
            <AppText
              weight={700}
              color="background"
              style={{
                fontSize: theme.moderateScale(15),
                lineHeight: theme.moderateScale(45),
              }}>
              Snaplink 시작하기
            </AppText>
          </GetStartedButton>
        </GetStartedContainer>
      </Container>
    );
  }

  // 첫 번째 페이지
  const Page1 = () => (
    <PageContainer>
      <ContentContainer>
        <AppText
          weight={700}
          color="textPrimary"
          style={{
            fontSize: theme.moderateScale(25),
            lineHeight: theme.moderateScale(40),
            letterSpacing: theme.moderateScale(-1),
          }}>
          '인생샷' 한 장에 <AppText weight={700} color="primary" style={{fontSize: theme.moderateScale(25), lineHeight: theme.moderateScale(40)}}>10만 원</AppText>,{'\n'}정말 이게 최선일까요?
        </AppText>
      </ContentContainer>

      <BottomImage
        source={require('@/assets/imgs/onboarding1.png')}
        resizeMode="contain"
      />
    </PageContainer>
  );

  // 두 번째 페이지
  const Page2 = () => (
    <PageContainer>
      <ContentContainer>
        <AppText
          weight={700}
          color="textPrimary"
          style={{
            fontSize: theme.moderateScale(25),
            lineHeight: theme.moderateScale(40),
            letterSpacing: theme.moderateScale(-1),
          }}>
          <AppText weight={700} color="primary" style={{fontSize: theme.moderateScale(25), lineHeight: theme.moderateScale(40)}}>스냅 작가</AppText>님 예약,{'\n'}아직도 인스타에서 헤매고 있나요?
        </AppText>
      </ContentContainer>

      <ImageBottom>
        <Onboarding2Svg width={SCREEN_WIDTH} />
      </ImageBottom>
    </PageContainer>
  );

  // 세 번째 페이지
  const Page3 = () => (
    <PageContainer>
      <ImageCenterTop>
        <Onboarding3Svg width={SCREEN_WIDTH} />
      </ImageCenterTop>

      <ContentContainer isThirdPage>
        <AppText
          weight={700}
          color="textPrimary"
          style={{
            fontSize: theme.moderateScale(23),
            lineHeight: theme.moderateScale(40),
            letterSpacing: theme.moderateScale(-0.92),
          }}>
          이 모든 고민,{'\n'}<AppText weight={700} color="primary" style={{fontSize: theme.moderateScale(23), lineHeight: theme.moderateScale(40)}}>스냅 링크</AppText>가 단번에 해결해 드릴게요.
        </AppText>
      </ContentContainer>
    </PageContainer>
  );

  return (
    <Container edges={['top']}>
      <Swiper
        ref={swiperRef}
        loop={false}
        showsButtons={false}
        showsPagination={false}
        onIndexChanged={setCurrentIndex}
        scrollEnabled={false}>
        <Slide>
          <Page1 />
        </Slide>
        <Slide>
          <Page2 />
        </Slide>
        <Slide>
          <Page3 />
        </Slide>
      </Swiper>

      <PaginationContainer>
        <TouchableOpacity onPress={handleSkip}>
          <AppText
            weight={400}
            color="textSecondary"
            style={{
              fontSize: theme.moderateScale(14),
            }}>
            skip
          </AppText>
        </TouchableOpacity>

        <DotsContainer>
          {[0, 1, 2].map(i => (
            <Dot
              key={i}
              isActive={i === currentIndex}
            />
          ))}
        </DotsContainer>

        <NextButton
          onPress={handleNext}
          activeOpacity={0.8}>
          <ArrowRightIcon width={theme.scale(28)} height={theme.scale(28)} />
        </NextButton>
      </PaginationContainer>
    </Container>
  );
};

export default OnboardingScreen;
