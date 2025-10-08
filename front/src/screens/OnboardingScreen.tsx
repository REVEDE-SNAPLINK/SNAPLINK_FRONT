import React, {useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Swiper from 'react-native-swiper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {theme} from '@/constants/theme';
import AppText from '@/components/AppText';
import ArrowRightIcon from '@/assets/icons/arrow-right.svg';
import Onboarding2Svg from '@/assets/imgs/onboarding2.svg';
import Onboarding3Svg from '@/assets/imgs/onboarding3.svg';
import {useAuth} from '@/context/AuthContext';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

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
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.getStartedContainer}>
          <Image
            source={require('@/assets/imgs/onboarding4.png')}
            style={styles.getStartedImage}
            resizeMode="contain"
          />

          <View style={styles.getStartedTextContainer}>
            <AppText
              weight={600}
              style={[
                styles.title,
                styles.titleCenter,
                {
                  fontSize: theme.moderateScale(25),
                  lineHeight: theme.moderateScale(40),
                  letterSpacing: theme.moderateScale(-1),
                },
              ]}>
              당신의 가장 빛나는 순간,{'\n'}더 이상 미루지 마세요.
            </AppText>
          </View>

          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}>
            <AppText
              weight={700}
              style={{
                fontSize: theme.moderateScale(15),
                lineHeight: theme.moderateScale(45),
                color: theme.colors.background,
              }}>
              Snaplink 시작하기
            </AppText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 첫 번째 페이지
  const Page1 = () => (
    <View style={styles.pageContainer}>
      <View style={styles.contentContainer}>
        <AppText
          weight={700}
          style={[
            styles.title,
            {
              fontSize: theme.moderateScale(25),
              lineHeight: theme.moderateScale(40),
              letterSpacing: theme.moderateScale(-1),
            },
          ]}>
          '인생샷' 한 장에 <AppText weight={700} style={{color: theme.colors.primary, fontSize: theme.moderateScale(25), lineHeight: theme.moderateScale(40)}}>10만 원</AppText>,{'\n'}정말 이게 최선일까요?
        </AppText>
      </View>

      <Image
        source={require('@/assets/imgs/onboarding1.png')}
        style={styles.imageBottom}
        resizeMode="contain"
      />
    </View>
  );

  // 두 번째 페이지
  const Page2 = () => (
    <View style={styles.pageContainer}>
      <View style={styles.contentContainer}>
        <AppText
          weight={700}
          style={[
            styles.title,
            {
              fontSize: theme.moderateScale(25),
              lineHeight: theme.moderateScale(40),
              letterSpacing: theme.moderateScale(-1),
            },
          ]}>
          <AppText weight={700} style={{color: theme.colors.primary, fontSize: theme.moderateScale(25), lineHeight: theme.moderateScale(40)}}>스냅 작가</AppText>님 예약,{'\n'}아직도 인스타에서 헤매고 있나요?
        </AppText>
      </View>

      <View style={styles.imageBottom}>
        <Onboarding2Svg width={SCREEN_WIDTH} />
      </View>
    </View>
  );

  // 세 번째 페이지
  const Page3 = () => (
    <View style={styles.pageContainer}>
      <View style={styles.imageCenterTop}>
        <Onboarding3Svg width={SCREEN_WIDTH} />
      </View>

      <View style={[styles.contentContainer, styles.contentContainerThird]}>
        <AppText
          weight={700}
          style={[
            styles.title,
            {
              fontSize: theme.moderateScale(23),
              lineHeight: theme.moderateScale(40),
              letterSpacing: theme.moderateScale(-0.92),
            },
          ]}>
          이 모든 고민,{'\n'}<AppText weight={700} style={{color: theme.colors.primary, fontSize: theme.moderateScale(23), lineHeight: theme.moderateScale(40)}}>스냅 링크</AppText>가 단번에 해결해 드릴게요.
        </AppText>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Swiper
        ref={swiperRef}
        loop={false}
        showsButtons={false}
        showsPagination={false}
        onIndexChanged={setCurrentIndex}
        scrollEnabled={false}>
        <View style={styles.slide}>
          <Page1 />
        </View>
        <View style={styles.slide}>
          <Page2 />
        </View>
        <View style={styles.slide}>
          <Page3 />
        </View>
      </Swiper>

      <View style={styles.paginationContainer}>
        <TouchableOpacity onPress={handleSkip}>
          <AppText
            weight={400}
            style={{
              fontSize: theme.moderateScale(14),
              color: theme.colors.textSecondary,
            }}>
            skip
          </AppText>
        </TouchableOpacity>

        <View style={styles.dotsContainer}>
          {[0, 1, 2].map(i => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}>
          <ArrowRightIcon width={theme.scale(28)} height={theme.scale(28)} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  slide: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: theme.scale(32),
    paddingTop: theme.verticalScale(80),
  },
  contentContainerThird: {
    paddingTop: 0,
    paddingBottom: theme.verticalScale(120),
  },
  title: {
    color: theme.colors.textPrimary,
  },
  titleCenter: {
    textAlign: 'center',
  },
  imageTop: {
    width: SCREEN_WIDTH,
    height: theme.verticalScale(200),
    marginTop: theme.verticalScale(60),
  },
  imageCenterTop: {
    width: SCREEN_WIDTH,
    height: theme.verticalScale(250),
    marginTop: theme.verticalScale(100),
    marginBottom: theme.verticalScale(30),
  },
  imageBottom: {
    width: SCREEN_WIDTH,
    height: theme.verticalScale(300),
    marginTop: 'auto',
    marginBottom: theme.verticalScale(120),
  },
  paginationContainer: {
    position: 'absolute',
    bottom: theme.verticalScale(60),
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.scale(32),
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.scale(6),
  },
  dot: {
    width: theme.scale(8),
    height: theme.scale(4),
    borderRadius: theme.scale(2),
    backgroundColor: '#D6D9E1',
  },
  dotActive: {
    width: theme.scale(16),
    backgroundColor: theme.colors.primary,
  },
  nextButton: {
    width: theme.scale(56),
    height: theme.scale(56),
    borderRadius: theme.scale(28),
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedContainer: {
    flex: 1,
  },
  getStartedImage: {
    width: SCREEN_WIDTH,
    height: theme.verticalScale(300),
    marginTop: theme.verticalScale(60),
  },
  getStartedTextContainer: {
    paddingHorizontal: theme.scale(32),
    paddingTop: theme.verticalScale(40),
    paddingBottom: theme.verticalScale(20),
  },
  getStartedButton: {
    marginHorizontal: theme.scale(32),
    marginBottom: theme.verticalScale(60),
    height: theme.scale(56),
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default OnboardingScreen;
