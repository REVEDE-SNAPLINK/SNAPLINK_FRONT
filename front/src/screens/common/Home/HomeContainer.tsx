import { useState } from 'react';
import analytics from '@react-native-firebase/analytics';
import HomeView from '@/screens/common/Home/HomeView.tsx';
import { BannerItem } from '@/components/domain/home/Banner.tsx';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@/types/navigation.ts';
import SignupCompletionModal from '@/components/domain/auth/SignupCompletionModal.tsx';
import { useAuthStore } from '@/store/authStore.ts';
import { useMainPhotographersLatestTop3Query, useMainPhotographersTopRatedTop3Query } from '@/queries/photographers.ts';

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

  // 추천 작가 클릭 → photographer_profile_view
  const handlePressAllPhotographerItem = (photographerId: string) => {
    analytics().logEvent('photographer_profile_view', {
      user_id: userId,
      user_type: userType,
      photographer_id: photographerId,
      source: 'home_feed_latest',
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
