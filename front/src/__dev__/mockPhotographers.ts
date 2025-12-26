import type {
  PhotographerSearchItem,
  PageResponse,
  GetPhotographerProfileResponse,
  GetPhotographerReviewSummaryResponse,
  SearchPhotographersBody,
  PhotographerPortfolioThumb,
} from '@/api/photographers';

/**
 * 개발 모드용 더미 작가 데이터
 */

export const mockPhotographers: PhotographerSearchItem[] = [
  {
    id: '1',
    nickname: '김작가',
    profileImageUrl: 'https://picsum.photos/200/200?random=1',
    averageRating: 4.8,
    reviewCount: 127,
    basePrice: 150000,
    baseTime: 2,
    gender: 'MAN',
    concepts: ['프로필', '가족', '커플'],
    portfolioImages: [
      'https://picsum.photos/400/400?random=101',
      'https://picsum.photos/400/400?random=102',
      'https://picsum.photos/400/400?random=103',
    ],
  },
  {
    id: '2',
    nickname: '이사진',
    profileImageUrl: 'https://picsum.photos/200/200?random=2',
    averageRating: 4.9,
    reviewCount: 203,
    basePrice: 200000,
    baseTime: 3,
    gender: 'WOMAN',
    concepts: ['웨딩', '가족', '프로필'],
    portfolioImages: [
      'https://picsum.photos/400/400?random=201',
      'https://picsum.photos/400/400?random=202',
      'https://picsum.photos/400/400?random=203',
      'https://picsum.photos/400/400?random=204',
    ],
  },
  {
    id: '3',
    nickname: '박스냅',
    profileImageUrl: 'https://picsum.photos/200/200?random=3',
    averageRating: 4.7,
    reviewCount: 95,
    basePrice: 180000,
    baseTime: 2,
    gender: 'MAN',
    concepts: ['커플', '프로필', '반려동물'],
    portfolioImages: [
      'https://picsum.photos/400/400?random=301',
      'https://picsum.photos/400/400?random=302',
    ],
  },
  {
    id: '4',
    nickname: '최포토',
    profileImageUrl: 'https://picsum.photos/200/200?random=4',
    averageRating: 4.6,
    reviewCount: 78,
    basePrice: 120000,
    baseTime: 1.5,
    gender: 'WOMAN',
    concepts: ['프로필', '커플'],
    portfolioImages: [
      'https://picsum.photos/400/400?random=401',
      'https://picsum.photos/400/400?random=402',
      'https://picsum.photos/400/400?random=403',
    ],
  },
  {
    id: '5',
    nickname: '정렌즈',
    profileImageUrl: 'https://picsum.photos/200/200?random=5',
    averageRating: 5.0,
    reviewCount: 156,
    basePrice: 250000,
    baseTime: 3,
    gender: 'MAN',
    concepts: ['웨딩', '가족', '커플', '프로필'],
    portfolioImages: [
      'https://picsum.photos/400/400?random=501',
      'https://picsum.photos/400/400?random=502',
      'https://picsum.photos/400/400?random=503',
      'https://picsum.photos/400/400?random=504',
      'https://picsum.photos/400/400?random=505',
    ],
  },
  {
    id: '6',
    nickname: '강셔터',
    profileImageUrl: 'https://picsum.photos/200/200?random=6',
    averageRating: 4.5,
    reviewCount: 62,
    basePrice: 100000,
    baseTime: 1,
    gender: 'MAN',
    concepts: ['반려동물', '프로필'],
    portfolioImages: [
      'https://picsum.photos/400/400?random=601',
      'https://picsum.photos/400/400?random=602',
    ],
  },
];

// 작가 프로필 상세
export const mockPhotographerProfiles: Record<string, GetPhotographerProfileResponse> = {
  '1': {
    nickname: '김작가',
    profileImageUrl: 'https://picsum.photos/200/200?random=1',
    description: '10년 경력의 프로필 전문 작가입니다. 자연스러운 표정 연출에 자신있습니다!',
    responseRate: 95,
    responseTime: '30분 이내',
    portfolioCount: 24,
    reviewCount: 127,
    portfolios: [
      { id: 1, thumbnailUrl: 'https://picsum.photos/400/400?random=101' },
      { id: 2, thumbnailUrl: 'https://picsum.photos/400/400?random=102' },
      { id: 3, thumbnailUrl: 'https://picsum.photos/400/400?random=103' },
    ],
    scrapped: false,
  },
  '2': {
    nickname: '이사진',
    profileImageUrl: 'https://picsum.photos/200/200?random=2',
    description: '감성적인 분위기를 담아내는 것을 좋아합니다. 특히 웨딩 촬영 전문입니다.',
    responseRate: 98,
    responseTime: '1시간 이내',
    portfolioCount: 36,
    reviewCount: 203,
    portfolios: [
      { id: 4, thumbnailUrl: 'https://picsum.photos/400/400?random=201' },
      { id: 5, thumbnailUrl: 'https://picsum.photos/400/400?random=202' },
    ],
    scrapped: true,
  },
  '3': {
    nickname: '박스냅',
    profileImageUrl: 'https://picsum.photos/200/200?random=3',
    description: '커플과 반려동물 촬영을 전문으로 합니다. 편안한 분위기로 자연스러운 순간을 담아드려요!',
    responseRate: 92,
    responseTime: '1시간 이내',
    portfolioCount: 18,
    reviewCount: 95,
    portfolios: [
      { id: 6, thumbnailUrl: 'https://picsum.photos/400/400?random=301' },
      { id: 7, thumbnailUrl: 'https://picsum.photos/400/400?random=302' },
      { id: 8, thumbnailUrl: 'https://picsum.photos/400/400?random=303' },
    ],
    scrapped: false,
  },
  '4': {
    nickname: '최포토',
    profileImageUrl: 'https://picsum.photos/200/200?random=4',
    description: '프로필과 커플 촬영 경력 5년차입니다. 밝고 생동감 있는 사진을 추구합니다.',
    responseRate: 88,
    responseTime: '2시간 이내',
    portfolioCount: 15,
    reviewCount: 78,
    portfolios: [
      { id: 9, thumbnailUrl: 'https://picsum.photos/400/400?random=401' },
      { id: 10, thumbnailUrl: 'https://picsum.photos/400/400?random=402' },
    ],
    scrapped: false,
  },
  '5': {
    nickname: '정렌즈',
    profileImageUrl: 'https://picsum.photos/200/200?random=5',
    description: '웨딩 촬영 15년 경력의 베테랑입니다. 모든 순간을 예술작품처럼 담아냅니다.',
    responseRate: 99,
    responseTime: '30분 이내',
    portfolioCount: 45,
    reviewCount: 156,
    portfolios: [
      { id: 11, thumbnailUrl: 'https://picsum.photos/400/400?random=501' },
      { id: 12, thumbnailUrl: 'https://picsum.photos/400/400?random=502' },
      { id: 13, thumbnailUrl: 'https://picsum.photos/400/400?random=503' },
      { id: 14, thumbnailUrl: 'https://picsum.photos/400/400?random=504' },
    ],
    scrapped: false,
  },
  '6': {
    nickname: '강셔터',
    profileImageUrl: 'https://picsum.photos/200/200?random=6',
    description: '반려동물과 프로필 촬영을 주로 합니다. 합리적인 가격에 최고의 퀄리티를 보장합니다!',
    responseRate: 85,
    responseTime: '3시간 이내',
    portfolioCount: 12,
    reviewCount: 62,
    portfolios: [
      { id: 15, thumbnailUrl: 'https://picsum.photos/400/400?random=601' },
      { id: 16, thumbnailUrl: 'https://picsum.photos/400/400?random=602' },
    ],
    scrapped: false,
  },
};

// 작가 리뷰 요약
export const mockPhotographerReviewSummaries: Record<string, GetPhotographerReviewSummaryResponse> = {
  '1': {
    averageRating: 4.8,
    totalReviewCount: 127,
    topPhotoKeys: [
      'https://picsum.photos/400/400?random=111',
      'https://picsum.photos/400/400?random=112',
      'https://picsum.photos/400/400?random=113',
    ],
    latestReviews: [
      {
        content: '정말 만족스러워요!',
        photoKey: 'https://picsum.photos/400/400?random=111',
        createdAt: '2025-01-15',
      },
      {
        content: '좋았습니다',
        photoKey: 'https://picsum.photos/400/400?random=112',
        createdAt: '2025-01-10',
      },
    ],
  },
  '2': {
    averageRating: 4.9,
    totalReviewCount: 203,
    topPhotoKeys: [
      'https://picsum.photos/400/400?random=211',
      'https://picsum.photos/400/400?random=212',
    ],
    latestReviews: [
      {
        content: '최고의 작가님!',
        photoKey: 'https://picsum.photos/400/400?random=211',
        createdAt: '2025-01-12',
      },
    ],
  },
  '3': {
    averageRating: 4.7,
    totalReviewCount: 95,
    topPhotoKeys: [
      'https://picsum.photos/400/400?random=311',
      'https://picsum.photos/400/400?random=312',
      'https://picsum.photos/400/400?random=313',
    ],
    latestReviews: [
      {
        content: '반려동물과 함께하는 촬영이 너무 좋았어요!',
        photoKey: 'https://picsum.photos/400/400?random=311',
        createdAt: '2025-01-14',
      },
      {
        content: '편안한 분위기에서 촬영했습니다',
        photoKey: 'https://picsum.photos/400/400?random=312',
        createdAt: '2025-01-08',
      },
    ],
  },
  '4': {
    averageRating: 4.6,
    totalReviewCount: 78,
    topPhotoKeys: [
      'https://picsum.photos/400/400?random=411',
      'https://picsum.photos/400/400?random=412',
    ],
    latestReviews: [
      {
        content: '프로필 사진 잘 나왔어요',
        photoKey: 'https://picsum.photos/400/400?random=411',
        createdAt: '2025-01-11',
      },
    ],
  },
  '5': {
    averageRating: 5.0,
    totalReviewCount: 156,
    topPhotoKeys: [
      'https://picsum.photos/400/400?random=511',
      'https://picsum.photos/400/400?random=512',
      'https://picsum.photos/400/400?random=513',
      'https://picsum.photos/400/400?random=514',
    ],
    latestReviews: [
      {
        content: '완벽한 웨딩 촬영이었습니다!',
        photoKey: 'https://picsum.photos/400/400?random=511',
        createdAt: '2025-01-16',
      },
      {
        content: '평생 간직할 사진들입니다',
        photoKey: 'https://picsum.photos/400/400?random=512',
        createdAt: '2025-01-13',
      },
      {
        content: '가족사진도 정말 예쁘게 나왔어요',
        photoKey: 'https://picsum.photos/400/400?random=513',
        createdAt: '2025-01-09',
      },
    ],
  },
  '6': {
    averageRating: 4.5,
    totalReviewCount: 62,
    topPhotoKeys: [
      'https://picsum.photos/400/400?random=611',
      'https://picsum.photos/400/400?random=612',
    ],
    latestReviews: [
      {
        content: '가성비 좋아요',
        photoKey: 'https://picsum.photos/400/400?random=611',
        createdAt: '2025-01-07',
      },
    ],
  },
};

/**
 * 작가 검색 - 페이지네이션 + 필터링
 */
export const getMockPhotographersPage = (
  page: number = 0,
  size: number = 10,
  filters?: SearchPhotographersBody,
): PageResponse<PhotographerSearchItem> => {
  // 필터링 적용
  let filteredPhotographers = [...mockPhotographers];

  if (filters) {
    // 검색어 필터
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filteredPhotographers = filteredPhotographers.filter((p) =>
        p.nickname.toLowerCase().includes(query) ||
        p.concepts.some((c) => c.toLowerCase().includes(query))
      );
    }

    // 성별 필터
    if (filters.gender) {
      filteredPhotographers = filteredPhotographers.filter((p) => p.gender === filters.gender);
    }

    // 컨셉 필터 (conceptIds -> 이름으로 매칭, 간단히 이름으로 처리)
    if (filters.conceptIds && filters.conceptIds.length > 0) {
      // conceptIds는 실제로는 숫자 배열이지만, mock에서는 이름으로 필터링
      // 실제 구현에서는 concepts meta 데이터와 매칭 필요
      filteredPhotographers = filteredPhotographers.filter((p) =>
        p.concepts.some((concept) => filters.conceptIds!.includes(concept as any))
      );
    }

    // 가격 필터
    if (filters.minPrice !== undefined) {
      filteredPhotographers = filteredPhotographers.filter((p) => p.basePrice >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      filteredPhotographers = filteredPhotographers.filter((p) => p.basePrice <= filters.maxPrice!);
    }
  }

  // 페이지네이션
  const startIndex = page * size;
  const endIndex = startIndex + size;
  const paginatedItems = filteredPhotographers.slice(startIndex, endIndex);

  return {
    content: paginatedItems,
    totalPages: Math.ceil(filteredPhotographers.length / size),
    totalElements: filteredPhotographers.length,
    size: size,
    number: page,
    numberOfElements: paginatedItems.length,
    first: page === 0,
    last: endIndex >= filteredPhotographers.length,
    empty: paginatedItems.length === 0,
    pageable: {
      pageNumber: page,
      pageSize: size,
      sort: [],
      offset: startIndex,
      paged: true,
      unpaged: false,
    },
    sort: [],
  };
};

/**
 * 작가 프로필 조회
 */
export const getMockPhotographerProfile = (photographerId: string): GetPhotographerProfileResponse | null => {
  return mockPhotographerProfiles[photographerId] || null;
};

/**
 * 작가 리뷰 요약 조회
 */
export const getMockPhotographerReviewSummary = (
  photographerId: string,
): GetPhotographerReviewSummaryResponse | null => {
  return mockPhotographerReviewSummaries[photographerId] || null;
};

/**
 * 작가 스크랩/언스크랩
 */
export const toggleMockPhotographerScrap = (photographerId: string): boolean => {
  const profile = mockPhotographerProfiles[photographerId];
  if (profile) {
    profile.scrapped = !profile.scrapped;
    return true;
  }
  return false;
};

/**
 * 작가 프로필 조회 (포트폴리오 페이지네이션)
 * - 무한 스크롤을 위해 page, size에 따라 포트폴리오를 동적 생성
 */
export const getMockPhotographerProfilePage = (
  photographerId: string,
  page: number = 0,
  size: number = 18,
): GetPhotographerProfileResponse | null => {
  const baseProfile = mockPhotographerProfiles[photographerId];
  if (!baseProfile) return null;

  // 포트폴리오 동적 생성 (portfolioCount에 맞춰서)
  const startIndex = page * size;
  const endIndex = Math.min(startIndex + size, baseProfile.portfolioCount);

  const portfolios: PhotographerPortfolioThumb[] = [];
  for (let i = startIndex; i < endIndex; i++) {
    portfolios.push({
      id: i + 1,
      thumbnailUrl: `https://picsum.photos/400/400?random=${photographerId}${i + 100}`,
    });
  }

  return {
    ...baseProfile,
    portfolios,
  };
};
