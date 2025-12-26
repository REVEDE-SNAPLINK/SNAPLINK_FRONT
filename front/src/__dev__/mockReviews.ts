import { MyReviewItem } from '@/api/me';
import { PageResponse } from '@/api/photographers';

/**
 * 개발 모드용 더미 리뷰 데이터
 * - 서버 데이터가 없거나 에러 발생 시 사용
 * - 조회, 수정, 삭제 시연 가능
 */

let mockReviews: MyReviewItem[] = [
  {
    id: 1,
    reservationId: 101,
    photographerId: 1,
    photographerNickname: '김작가',
    photographerProfileImage: 'https://picsum.photos/200/200?random=1',
    rating: 5,
    shootingTag: '프로필 촬영',
    content: '정말 만족스러운 촬영이었습니다! 작가님이 친절하게 포즈도 알려주시고, 결과물도 너무 예뻐서 감동했어요. 다음에도 꼭 이용하고 싶습니다.',
    imageUrls: [
      'https://picsum.photos/400/400?random=11',
      'https://picsum.photos/400/400?random=12',
      'https://picsum.photos/400/400?random=13',
    ],
    createdAt: '2025-01-15T10:30:00Z',
  },
  {
    id: 2,
    reservationId: 102,
    photographerId: 2,
    photographerNickname: '이사진',
    photographerProfileImage: 'https://picsum.photos/200/200?random=2',
    rating: 4,
    shootingTag: '가족 촬영',
    content: '가족사진을 찍었는데 분위기가 정말 좋았어요. 아이들도 재밌어하고, 자연스러운 모습을 담아주셔서 감사합니다.',
    imageUrls: [
      'https://picsum.photos/400/400?random=21',
      'https://picsum.photos/400/400?random=22',
    ],
    createdAt: '2025-01-10T14:20:00Z',
  },
  {
    id: 3,
    reservationId: 103,
    photographerId: 3,
    photographerNickname: '박스냅',
    photographerProfileImage: 'https://picsum.photos/200/200?random=3',
    rating: 5,
    shootingTag: '웨딩 촬영',
    content: '웨딩 스냅 촬영 너무 만족했습니다. 날씨도 좋았고, 작가님 덕분에 평생 간직할 추억을 남길 수 있었어요. 강력 추천합니다!',
    imageUrls: [
      'https://picsum.photos/400/400?random=31',
      'https://picsum.photos/400/400?random=32',
      'https://picsum.photos/400/400?random=33',
      'https://picsum.photos/400/400?random=34',
    ],
    createdAt: '2025-01-05T16:45:00Z',
  },
  {
    id: 4,
    reservationId: 104,
    photographerId: 4,
    photographerNickname: '최포토',
    photographerProfileImage: 'https://picsum.photos/200/200?random=4',
    rating: 3,
    shootingTag: '커플 촬영',
    content: '전반적으로 괜찮았지만, 시간이 조금 부족했던 것 같아요. 그래도 결과물은 만족스럽습니다.',
    imageUrls: [
      'https://picsum.photos/400/400?random=41',
    ],
    createdAt: '2024-12-28T11:00:00Z',
  },
  {
    id: 5,
    reservationId: 105,
    photographerId: 5,
    photographerNickname: '정렌즈',
    photographerProfileImage: 'https://picsum.photos/200/200?random=5',
    rating: 5,
    shootingTag: '프로필 촬영',
    content: '프로필 사진이 필요해서 촬영했는데, 정말 마음에 들어요! 작가님이 세심하게 신경 써주셔서 좋은 사진 많이 건졌습니다.',
    imageUrls: [
      'https://picsum.photos/400/400?random=51',
      'https://picsum.photos/400/400?random=52',
    ],
    createdAt: '2024-12-20T09:15:00Z',
  },
  {
    id: 6,
    reservationId: 106,
    photographerId: 6,
    photographerNickname: '강셔터',
    photographerProfileImage: 'https://picsum.photos/200/200?random=6',
    rating: 4,
    shootingTag: '반려동물 촬영',
    content: '우리 강아지가 낯을 많이 가리는데, 작가님이 잘 다독여주셔서 좋은 사진이 나왔어요. 감사합니다!',
    imageUrls: [
      'https://picsum.photos/400/400?random=61',
      'https://picsum.photos/400/400?random=62',
      'https://picsum.photos/400/400?random=63',
    ],
    createdAt: '2024-12-15T13:30:00Z',
  },
];

/**
 * 더미 리뷰 데이터를 페이지네이션 형식으로 반환
 */
export const getMockReviewsPage = (
  page: number = 0,
  size: number = 10,
): PageResponse<MyReviewItem> => {
  const startIndex = page * size;
  const endIndex = startIndex + size;
  const paginatedReviews = mockReviews.slice(startIndex, endIndex);

  return {
    content: paginatedReviews,
    totalPages: Math.ceil(mockReviews.length / size),
    totalElements: mockReviews.length,
    size: size,
    number: page,
    numberOfElements: paginatedReviews.length,
    first: page === 0,
    last: endIndex >= mockReviews.length,
    empty: paginatedReviews.length === 0,
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
 * 더미 리뷰 삭제
 */
export const deleteMockReview = (reviewId: number): boolean => {
  const initialLength = mockReviews.length;
  mockReviews = mockReviews.filter((review) => review.id !== reviewId);
  return mockReviews.length < initialLength;
};

/**
 * 더미 리뷰 수정
 */
export const updateMockReview = (
  reviewId: number,
  updates: Partial<Pick<MyReviewItem, 'rating' | 'shootingTag' | 'content' | 'imageUrls'>>,
): boolean => {
  const index = mockReviews.findIndex((review) => review.id === reviewId);
  if (index === -1) return false;

  mockReviews[index] = {
    ...mockReviews[index],
    ...updates,
  };

  return true;
};

/**
 * 더미 리뷰 추가
 */
export const addMockReview = (review: Omit<MyReviewItem, 'id' | 'createdAt'>): MyReviewItem => {
  const newReview: MyReviewItem = {
    ...review,
    id: Math.max(...mockReviews.map((r) => r.id), 0) + 1,
    createdAt: new Date().toISOString(),
  };

  mockReviews.unshift(newReview);
  return newReview;
};

/**
 * 모든 더미 리뷰 가져오기
 */
export const getAllMockReviews = (): MyReviewItem[] => {
  return [...mockReviews];
};

/**
 * 더미 리뷰 초기화
 */
export const resetMockReviews = (): void => {
  mockReviews = getAllMockReviews();
};
