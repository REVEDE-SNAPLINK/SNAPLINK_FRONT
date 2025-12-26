import type { CommunityPost, GetCommunityPostsResponse } from '@/api/community';

/**
 * 개발 모드용 더미 커뮤니티 데이터
 */

let mockCommunityPosts: CommunityPost[] = [
  {
    id: '1',
    categoryLabel: 'QNA',
    title: '프로필 촬영 시 옷은 어떻게 준비하나요?',
    content: '곧 프로필 촬영이 있는데, 어떤 옷을 입고 가는 게 좋을까요? 추천 부탁드립니다!',
    imageUrls: [],
    author: {
      userId: '101',
      nickname: '궁금이',
      profileImageUrl: 'https://picsum.photos/50/50?random=101',
    },
    createdAt: '2025-01-20T10:00:00Z',
    updatedAt: '2025-01-20T10:00:00Z',
    likeCount: 12,
    commentCount: 5,
    isLiked: false,
  },
  {
    id: '2',
    categoryLabel: 'REVIEW',
    title: '김작가님 촬영 후기',
    content: '정말 만족스러운 촬영이었어요! 결과물도 너무 좋고, 작가님도 너무 친절하셨습니다. 강추합니다!',
    imageUrls: [
      'https://picsum.photos/600/400?random=201',
      'https://picsum.photos/600/400?random=202',
    ],
    author: {
      userId: '102',
      nickname: '만족고객',
      profileImageUrl: 'https://picsum.photos/50/50?random=102',
    },
    createdAt: '2025-01-19T15:30:00Z',
    updatedAt: '2025-01-19T15:30:00Z',
    likeCount: 28,
    commentCount: 3,
    isLiked: true,
  },
  {
    id: '3',
    categoryLabel: 'LOCATION',
    title: '서울 인생샷 명소 추천',
    content: '서울에서 인생샷 찍기 좋은 곳 공유합니다. 한강공원, 북촌한옥마을, 경복궁 등등...',
    imageUrls: [
      'https://picsum.photos/600/400?random=301',
      'https://picsum.photos/600/400?random=302',
      'https://picsum.photos/600/400?random=303',
    ],
    author: {
      userId: '103',
      nickname: '서울러',
      profileImageUrl: 'https://picsum.photos/50/50?random=103',
    },
    createdAt: '2025-01-18T12:00:00Z',
    updatedAt: '2025-01-18T12:00:00Z',
    likeCount: 45,
    commentCount: 12,
    isLiked: false,
  },
  {
    id: '4',
    categoryLabel: 'GENERAL',
    title: '촬영 꿀팁 모음',
    content: '사진 잘 나오는 포즈, 표정 관리 등 유용한 팁들을 정리했어요.',
    imageUrls: [],
    author: {
      userId: '104',
      nickname: '팁공유',
      profileImageUrl: 'https://picsum.photos/50/50?random=104',
    },
    createdAt: '2025-01-17T09:00:00Z',
    updatedAt: '2025-01-17T09:00:00Z',
    likeCount: 67,
    commentCount: 8,
    isLiked: true,
  },
];

/**
 * 커뮤니티 게시글 목록 조회 (페이지네이션)
 */
export const getMockCommunityPostsPage = (
  page: number = 0,
  size: number = 10,
): GetCommunityPostsResponse => {
  const startIndex = page * size;
  const endIndex = startIndex + size;
  const paginatedItems = mockCommunityPosts.slice(startIndex, endIndex);

  return {
    content: paginatedItems,
    totalPages: Math.ceil(mockCommunityPosts.length / size),
    totalElements: mockCommunityPosts.length,
    size: size,
    number: page,
    numberOfElements: paginatedItems.length,
    first: page === 0,
    last: endIndex >= mockCommunityPosts.length,
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
 * 게시글 상세 조회
 */
export const getMockCommunityPost = (postId: string): CommunityPost | null => {
  return mockCommunityPosts.find((post) => post.id === postId) || null;
};

/**
 * 게시글 좋아요 토글
 */
export const toggleMockPostLike = (postId: string): boolean => {
  const post = mockCommunityPosts.find((p) => p.id === postId);
  if (post) {
    post.isLiked = !post.isLiked;
    post.likeCount += post.isLiked ? 1 : -1;
    return true;
  }
  return false;
};

/**
 * 게시글 삭제
 */
export const deleteMockCommunityPost = (postId: string): boolean => {
  const initialLength = mockCommunityPosts.length;
  mockCommunityPosts = mockCommunityPosts.filter((post) => post.id !== postId);
  return mockCommunityPosts.length < initialLength;
};

/**
 * 게시글 생성
 */
export const createMockCommunityPost = (
  category: string,
  title: string,
  content: string,
  imageUrls: string[] = [],
): CommunityPost => {
  const newPost: CommunityPost = {
    id: String(Math.max(...mockCommunityPosts.map((p) => Number(p.id)), 0) + 1),
    categoryLabel: category as any,
    title,
    content,
    imageUrls,
    author: {
      userId: '999',
      nickname: '나',
      profileImageUrl: 'https://picsum.photos/50/50?random=999',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    likeCount: 0,
    commentCount: 0,
    isLiked: false,
  };

  mockCommunityPosts.unshift(newPost);
  return newPost;
};
