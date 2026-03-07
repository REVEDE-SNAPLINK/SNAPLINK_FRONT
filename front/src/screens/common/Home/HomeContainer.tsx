import { useState, useEffect, useRef } from 'react';
import analytics from '@react-native-firebase/analytics';
import HomeView from '@/screens/common/Home/HomeView.tsx';
import { BannerItem } from '@/components/domain/home/Banner.tsx';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@/types/navigation.ts';
import SignupCompletionModal from '@/components/domain/auth/SignupCompletionModal.tsx';
import { useAuthStore } from '@/store/authStore.ts';
import { useMainPhotographersLatestTop3Query, useMainPhotographersTopRatedTop3Query } from '@/queries/photographers.ts';
import { safeLogEvent, safeLogImpression } from '@/utils/analytics.ts';
import { Platform } from 'react-native';

const dummyBannerItems: BannerItem[] = [
  {
    image: require('@/assets/imgs/banner-sample.png'),
    linkUri: 'snaplink://tab/home/ai-recommendation',
  },
  {
    image: require('@/assets/imgs/banner-sample2.png'),
    linkUri: 'https://www.snaplink.run/event-inquiry',
  },
];

export default function HomeContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const { isFirst, userId, userType } = useAuthStore();

  const [searchKey, setSearchKey] = useState('');

  const { data: latest3 } = useMainPhotographersLatestTop3Query();
  const { data: topRated3 } = useMainPhotographersTopRatedTop3Query();

  const latestList = latest3?.content ?? [];
  const topRatedList = topRated3?.content ?? [];

  const impressionLogged = useRef(false);

  // Home 피드 노출 이벤트 + 작가 카드 impression (고정 3+3개)
  useEffect(() => {
    if (impressionLogged.current) return;
    if (latestList.length === 0 && topRatedList.length === 0) return;
    impressionLogged.current = true;

    safeLogEvent('home_feed_view', {
      feed_type: 'all',
      user_id: userId,
      user_type: userType,
    });

    // latest 3 impression
    latestList.forEach((item: any, index: number) => {
      safeLogImpression('creator_card_impression', `home_latest_${item.photographerId}`, {
        photographer_id: item.photographerId,
        source: 'home_feed_latest',
        feed_type: 'latest',
        rank_index: index,
        user_id: userId,
        user_type: userType,
      });
    });

    // topRated 3 impression
    topRatedList.forEach((item: any, index: number) => {
      safeLogImpression('creator_card_impression', `home_popular_${item.photographerId}`, {
        photographer_id: item.photographerId,
        source: 'home_feed_popular',
        feed_type: 'popular',
        rank_index: index,
        user_id: userId,
        user_type: userType,
      });
    });
  }, [latestList, topRatedList, userId, userType]);

  // AI 클릭 → ai_recommendation_start
  const handlePressAI = () => {
    analytics().logEvent('ai_recommendation_start', {
      user_id: userId,
      user_type: userType,
      source: 'Home',
    });
    navigation.navigate('AIRecommdationForm');
  };

  // 검색 키워드 제출 → search_photographer
  const handleSubmitSearchKey = () => {
    analytics().logEvent('search_photographer', {
      user_id: userId,
      user_type: userType,
      search_key: searchKey,
      source: 'Home',
    });
    navigation.navigate('SearchPhotographer', { searchKey });
  };

  const handlePressAllPhotographer = () => {
    navigation.navigate('SearchPhotographer', { searchKey: '' })
  };

  // 추천 작가 클릭 → photographer_profile_view + creator_card_click
  const handlePressAllPhotographerItem = (photographerId: string) => {
    analytics().logEvent('photographer_profile_view', {
      user_id: userId,
      user_type: userType,
      photographer_id: photographerId,
      source: 'home_feed_latest',
    });
    safeLogEvent('creator_card_click', {
      photographer_id: photographerId,
      source: 'home_feed_latest',
      feed_type: 'latest',
      user_id: userId,
      user_type: userType,
    });
    navigation.navigate('PhotographerDetails', { photographerId, source: 'home_feed_latest' });
  };

  const handlePressPopularPhotographerItem = (photographerId: string) => {
    analytics().logEvent('photographer_profile_view', {
      user_id: userId,
      user_type: userType,
      photographer_id: photographerId,
      source: 'home_feed_popular',
    });
    safeLogEvent('creator_card_click', {
      photographer_id: photographerId,
      source: 'home_feed_popular',
      feed_type: 'popular',
      user_id: userId,
      user_type: userType,
    });
    navigation.navigate('PhotographerDetails', { photographerId, source: 'home_feed_popular' });
  };

  return (
    <>
      <HomeView
        onPressAI={handlePressAI}
        onPressAllPhotographer={handlePressAllPhotographer}
        onPressAllPhotographerItem={handlePressAllPhotographerItem}
        onPressPopularPhotographerItem={handlePressPopularPhotographerItem}
        searchKey={searchKey}
        onChangeSearchKey={setSearchKey}
        onSubmitSearchKey={handleSubmitSearchKey}
        bannerItems={dummyBannerItems}
        allPhotographerItems={latestList}
        popularPhotographerItems={topRatedList}
      />
      {isFirst && <SignupCompletionModal />}
    </>
  );
}
