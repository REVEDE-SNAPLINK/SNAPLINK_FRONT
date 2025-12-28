import { useState } from 'react';
import HomeView from '@/screens/common/Home/HomeView.tsx';
import { BannerItem } from '@/components/user/Banner.tsx';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@/types/navigation.ts';
import SignupCompletionModal from '@/components/auth/SignupCompletionModal.tsx';
import { useAuthStore } from '@/store/authStore.ts';
import { useMainPhotographersLatestTop3Query, useMainPhotographersTopRatedTop3Query } from '@/queries/photographers.ts';

const dummyBannerItems: BannerItem[] = [
  {
    id: '1',
    image: require('@/assets/imgs/banner-sample.png'),
    title: '사진 전문가 AI가 찾아드릴게요',
    description: '누구에게 맡길 지 고민된다면,',
  },
  {
    id: '2',
    image: require('@/assets/imgs/banner-sample.png'),
    title: '프로필 촬영',
    description: '프로페셔널한 프로필 사진',
  },
  {
    id: '3',
    image: require('@/assets/imgs/banner-sample.png'),
    title: '가족 사진',
    description: '소중한 가족과 함께',
  },
  {
    id: '4',
    image: require('@/assets/imgs/banner-sample.png'),
    title: '가족 사진',
    description: '소중한 가족과 함께',
  },
  {
    id: '5',
    image: require('@/assets/imgs/banner-sample.png'),
    title: '가족 사진',
    description: '소중한 가족과 함께',
  },
];

export default function HomeContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const { isFirst } = useAuthStore();

  const [searchKey, setSearchKey] = useState('');

  const { data: latest3 } = useMainPhotographersLatestTop3Query();
  const { data: topRated3 } = useMainPhotographersTopRatedTop3Query();

  const latestList = latest3?.content ?? [];
  const topRatedList = topRated3?.content ?? [];

  const handlePressAI = () => navigation.navigate('AIRecommdationForm');
  const handleSubmitSearchKey = () => {
    navigation.navigate('SearchPhotographer', { searchKey });
  };
  const handlePressAllPhotographer = () => {
    navigation.navigate('SearchPhotographer', { searchKey: '' })
  };
  const handlePressAllPhotographerItem = (photographerId: string) => navigation.navigate('PhotographerDetails', { photographerId });
  const handlePressPopularPhotographerItem = (photographerId: string) => navigation.navigate('PhotographerDetails', { photographerId });

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
