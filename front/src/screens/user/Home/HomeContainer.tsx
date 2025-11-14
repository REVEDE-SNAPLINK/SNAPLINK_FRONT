import { useState } from 'react';
import HomeView from '@/screens/user/Home/HomeView.tsx';
import { BannerItem } from '@/components/user/Banner.tsx';
import { PhotographerInfo } from '@/types/photographer.ts';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@/types/navigation.ts';

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

const dummyAllPhotographerItems: PhotographerInfo[] = [
  {
    id: '1',
    info: '업이픽 | 인물 | 서울',
    price: 40000
  },
  {
    id: '2',
    info: '알파 | 인물 | 경기',
    price: 80000
  },
  {
    id: '3',
    info: '시나모 | 인물 | 서울',
    price: 50000
  },
]

const dummyPopularPhotographerItems: PhotographerInfo[] = [
  {
    id: '1',
    info: '시나모 | 인물 | 서울',
    price: 50000
  },
  {
    id: '2',
    info: '유시 | 인물 | 서울',
    price: 100000
  },
  {
    id: '3',
    info: '업이픽 | 인물 | 서울',
    price: 40000
  },
]

export default function HomeContainer() {
  const navigation = useNavigation<MainNavigationProp>();

  const [searchKey, setSearchKey] = useState('');

  const handlePressNotification = () => {};
  const handlePressAI = () => {};
  const handleSubmitSearchKey = () => {
    navigation.navigate('SearchPhotographer', { searchKey });
  };
  const handlePressAllPhotographer = () => {
    navigation.navigate('SearchPhotographer', { searchKey: '' })
  };
  const handlePressPopularPhotographer = () => {};
  const handlePressAllPhotographerItem = (id: string) => { console.log('handlePressAllPhotographerItem', id); };
  const handlePressPopularPhotographerItem = (id: string) => { console.log('handlePressPopularPhotographerItem', id); };

  return (
    <HomeView
      onPressNotification={handlePressNotification}
      onPressAI={handlePressAI}
      onPressAllPhotographer={handlePressAllPhotographer}
      onPressPopularPhotographer={handlePressPopularPhotographer}
      onPressAllPhotographerItem={handlePressAllPhotographerItem}
      onPressPopularPhotographerItem={handlePressPopularPhotographerItem}
      searchKey={searchKey}
      onChangeSearchKey={setSearchKey}
      onSubmitSearchKey={handleSubmitSearchKey}
      bannerItems={dummyBannerItems}
      allPhotographerItems={dummyAllPhotographerItems}
      popularPhotographerItems={dummyPopularPhotographerItems}
    />
  );
}