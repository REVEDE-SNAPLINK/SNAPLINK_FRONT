import { Photographer } from '@/types/photographer';
import { FilterValue } from '@/types/filter';

export interface SearchPhotographerParams {
  searchKey?: string;
  filters?: FilterValue[];
  sortBy?: 'recommended' | 'latest';
  page: number;
  pageSize: number;
}

export interface SearchPhotographerResponse {
  photographers: Photographer[];
  totalCount: number;
  hasNextPage: boolean;
  nextPage: number | null;
}

/**
 * Dummy data for development
 * TODO: Replace with actual API call when backend is ready
 */
const DUMMY_PHOTOGRAPHERS: Photographer[] = [
  {
    id: '1',
    nickname: '유앤미스냅',
    rating: 4.8,
    reviewCount: 34,
    portfolioImages: [
      'https://picsum.photos/200/200?random=1',
      'https://picsum.photos/200/200?random=2',
      'https://picsum.photos/200/200?random=3',
    ],
    shootingUnit: '기본촬영/2시간',
    price: 50000,
    isPartner: true,
    gender: '여성작가',
    shootingTypes: ['커플', '웨딩'],
    region: '서울',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    nickname: '포토스튜디오 김',
    rating: 4.5,
    reviewCount: 12,
    portfolioImages: [
      'https://picsum.photos/200/200?random=4',
      'https://picsum.photos/200/200?random=5',
      'https://picsum.photos/200/200?random=6',
      'https://picsum.photos/200/200?random=6',
      'https://picsum.photos/200/200?random=6',
      'https://picsum.photos/200/200?random=6',
    ],
    shootingUnit: '기본촬영/1시간',
    price: 80000,
    isPartner: false,
    gender: '남성작가',
    shootingTypes: ['인물', '사물'],
    region: '경기',
    createdAt: '2024-02-20T14:30:00Z',
  },
  {
    id: '3',
    nickname: '스냅마스터',
    rating: 4.9,
    reviewCount: 89,
    portfolioImages: [
      'https://picsum.photos/200/200?random=7',
      'https://picsum.photos/200/200?random=8',
      'https://picsum.photos/200/200?random=9',
    ],
    shootingUnit: '기본촬영/3시간',
    price: 120000,
    isPartner: true,
    gender: '여성작가',
    shootingTypes: ['웨딩', '인물', '반려동물'],
    region: '서울',
    createdAt: '2024-03-05T09:15:00Z',
  },
  {
    id: '4',
    nickname: '뷰티포토',
    rating: 4.7,
    reviewCount: 56,
    portfolioImages: [
      'https://picsum.photos/200/200?random=10',
      'https://picsum.photos/200/200?random=11',
      'https://picsum.photos/200/200?random=12',
    ],
    shootingUnit: '기본촬영/2시간',
    price: 70000,
    isPartner: true,
    gender: '여성작가',
    shootingTypes: ['인물'],
    region: '부산',
    createdAt: '2024-01-20T11:20:00Z',
  },
  {
    id: '5',
    nickname: '감성사진관',
    rating: 4.6,
    reviewCount: 23,
    portfolioImages: [
      'https://picsum.photos/200/200?random=13',
      'https://picsum.photos/200/200?random=14',
      'https://picsum.photos/200/200?random=15',
    ],
    shootingUnit: '기본촬영/1.5시간',
    price: 60000,
    isPartner: false,
    gender: '남성작가',
    shootingTypes: ['커플', '인물'],
    region: '인천',
    createdAt: '2024-02-10T16:45:00Z',
  },
  {
    id: '6',
    nickname: '펫포토그래퍼',
    rating: 4.8,
    reviewCount: 45,
    portfolioImages: [
      'https://picsum.photos/200/200?random=16',
      'https://picsum.photos/200/200?random=17',
      'https://picsum.photos/200/200?random=18',
    ],
    shootingUnit: '기본촬영/2시간',
    price: 90000,
    isPartner: true,
    gender: '여성작가',
    shootingTypes: ['반려동물'],
    region: '서울',
    createdAt: '2024-03-15T13:30:00Z',
  },
  {
    id: '7',
    nickname: '웨딩스냅전문',
    rating: 4.9,
    reviewCount: 102,
    portfolioImages: [
      'https://picsum.photos/200/200?random=19',
      'https://picsum.photos/200/200?random=20',
      'https://picsum.photos/200/200?random=21',
    ],
    shootingUnit: '기본촬영/4시간',
    price: 200000,
    isPartner: true,
    gender: '남성작가',
    shootingTypes: ['웨딩'],
    region: '경기',
    createdAt: '2024-03-20T10:00:00Z',
  },
  {
    id: '8',
    nickname: '제품사진전문가',
    rating: 4.5,
    reviewCount: 18,
    portfolioImages: [
      'https://picsum.photos/200/200?random=22',
      'https://picsum.photos/200/200?random=23',
      'https://picsum.photos/200/200?random=24',
    ],
    shootingUnit: '기본촬영/1시간',
    price: 100000,
    isPartner: false,
    gender: '남성작가',
    shootingTypes: ['사물'],
    region: '서울',
    createdAt: '2024-02-25T15:00:00Z',
  },
];

/**
 * Filter photographers based on search and filter criteria
 */
function filterPhotographers(
  photographers: Photographer[],
  params: SearchPhotographerParams
): Photographer[] {
  let filtered = [...photographers];

  // Search by nickname
  if (params.searchKey && params.searchKey.trim() !== '') {
    const searchLower = params.searchKey.toLowerCase();
    filtered = filtered.filter((p) => p.nickname.toLowerCase().includes(searchLower));
  }

  // Apply filters
  if (params.filters && params.filters.length > 0) {
    params.filters.forEach((filter) => {
      if (filter.type === 'ENUM') {
        if (filter.categoryId === 'shooting-type') {
          filtered = filtered.filter((p) =>
            filter.values.some((value) => p.shootingTypes.includes(value))
          );
        } else if (filter.categoryId === 'region') {
          filtered = filtered.filter((p) => filter.values.includes(p.region));
        } else if (filter.categoryId === 'gender') {
          filtered = filtered.filter((p) => filter.values.includes(p.gender));
        }
      } else if (filter.type === 'NUMBER') {
        if (filter.categoryId === 'price') {
          filtered = filtered.filter((p) => p.price >= filter.min && p.price <= filter.max);
        }
      }
    });
  }

  // Sort
  if (params.sortBy === 'latest') {
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else {
    // 'recommended' - sort by rating then reviewCount
    filtered.sort((a, b) => {
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      return b.reviewCount - a.reviewCount;
    });
  }

  return filtered;
}

/**
 * Search photographers with pagination
 * TODO: Replace with actual API call when backend is ready
 *
 * API endpoint will be: GET /api/photographers/search
 * Query params: searchKey, filters (JSON), sortBy, page, pageSize
 */
export async function searchPhotographers(
  params: SearchPhotographerParams
): Promise<SearchPhotographerResponse> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const filtered = filterPhotographers(DUMMY_PHOTOGRAPHERS, params);

  const startIndex = (params.page - 1) * params.pageSize;
  const endIndex = startIndex + params.pageSize;
  const paginatedData = filtered.slice(startIndex, endIndex);

  return {
    photographers: paginatedData,
    totalCount: filtered.length,
    hasNextPage: endIndex < filtered.length,
    nextPage: endIndex < filtered.length ? params.page + 1 : null,
  };
}
