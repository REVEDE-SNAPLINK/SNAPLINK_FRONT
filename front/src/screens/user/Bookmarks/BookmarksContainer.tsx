import { useNavigation } from '@react-navigation/native';
import BookmarksView from './BookmarksView';
import { useState } from 'react';
import { MainNavigationProp } from '@/types/navigation.ts';

// TODO: Replace with actual API call
const DUMMY_BOOKMARKED_PHOTOGRAPHERS = [
  {
    id: 'photographer-1',
    nickname: '유앤미스냅',
    rating: 4.5,
    reviewCount: 120,
    shootingUnit: '2인',
    price: 150000,
    isPartner: true,
    gender: '여성작가' as const,
    shootingTypes: ['인물스냅', '프로필'],
    portfolioImages: ['img1', 'img2', 'img3'],
    styleTags: ['우정', '자연광', '감성'],
    region: '서울',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'photographer-2',
    nickname: '스냅마스터',
    rating: 4.8,
    reviewCount: 85,
    shootingUnit: '2인',
    price: 120000,
    isPartner: false,
    gender: '남성작가' as const,
    shootingTypes: ['인물스냅', '커플스냅'],
    portfolioImages: ['img1', 'img2'],
    styleTags: ['빈티지', '감성', '로맨틱'],
    region: '경기',
    createdAt: '2024-02-20T14:30:00Z',
  },
];

export default function BookmarksContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const [bookmarkedPhotographers, setBookmarkedPhotographers] = useState(DUMMY_BOOKMARKED_PHOTOGRAPHERS);

  const handlePressPhotographer = (photographerId: string) => {
    navigation.navigate('PhotographerDetails', { photographerId });
  };

  const handlePressBookmark = (photographerId: string) => {
    // TODO: API call to remove bookmark
    setBookmarkedPhotographers((prev) =>
      prev.filter((photographer) => photographer.id !== photographerId)
    );
  };

  return (
    <BookmarksView
      photographers={bookmarkedPhotographers}
      totalCount={bookmarkedPhotographers.length}
      onPressPhotographer={handlePressPhotographer}
      onPressBookmark={handlePressBookmark}
    />
  );
}