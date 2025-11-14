import { Photographer, PhotographerDetails, PortfolioImage } from '@/types/photographer';
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
    styleTags: ['우정', '자연광', '감성'],
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
    styleTags: ['모던', '스튜디오', '정통'],
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
    styleTags: ['빈티지', '감성', '자연광', '로맨틱'],
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
    styleTags: ['뷰티', '프로필', '클린'],
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
    styleTags: ['감성', '우정', '일상'],
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
    styleTags: ['자연광', '애정', '생동감'],
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
    styleTags: ['로맨틱', '클래식', '감동'],
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
    styleTags: ['미니멀', '모던', '정통'],
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

  // Search by nickname, shooting types, and style tags
  if (params.searchKey && params.searchKey.trim() !== '') {
    const searchLower = params.searchKey.toLowerCase();
    filtered = filtered.filter((p) => {
      // Check nickname
      if (p.nickname.toLowerCase().includes(searchLower)) {
        return true;
      }

      // Check shooting types
      if (p.shootingTypes.some((type) => type.toLowerCase().includes(searchLower))) {
        return true;
      }

      // Check style tags
      if (p.styleTags.some((tag) => tag.toLowerCase().includes(searchLower))) {
        return true;
      }

      return false;
    });
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

/**
 * Get photographer details by ID
 * TODO: Replace with actual API call when backend is ready
 *
 * API endpoint will be: GET /api/photographers/:id
 */
export async function getPhotographerDetails(
  photographerId: string
): Promise<PhotographerDetails> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const photographer = DUMMY_PHOTOGRAPHERS.find((p) => p.id === photographerId);

  if (!photographer) {
    throw new Error('Photographer not found');
  }

  // Extend with additional details
  return {
    ...photographer,
    name: `${photographer.nickname} 작가`,
    introduction: `안녕하세요, ${photographer.nickname}입니다.\n${photographer.shootingTypes.join(', ')} 촬영을 전문으로 하고 있으며, ${photographer.styleTags.join(', ')} 스타일의 사진을 주로 촬영합니다.\n\n고객님의 소중한 순간을 아름답게 담아드리겠습니다.`,
    portfolioCount: 120, // Dummy count
  };
}

export interface GetPortfolioImagesParams {
  photographerId: string;
  page: number;
  pageSize: number;
}

export interface GetPortfolioImagesResponse {
  images: PortfolioImage[];
  totalCount: number;
  hasNextPage: boolean;
  nextPage: number | null;
}

/**
 * Get photographer's portfolio images with pagination
 * TODO: Replace with actual API call when backend is ready
 *
 * API endpoint will be: GET /api/photographers/:id/portfolio
 * Query params: page, pageSize
 */
export async function getPortfolioImages(
  params: GetPortfolioImagesParams
): Promise<GetPortfolioImagesResponse> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Generate dummy portfolio images (simulate 120 images)
  const totalImages = 120;
  const startIndex = (params.page - 1) * params.pageSize;
  const endIndex = Math.min(startIndex + params.pageSize, totalImages);

  const images: PortfolioImage[] = [];
  for (let i = startIndex; i < endIndex; i++) {
    images.push({
      id: `portfolio-${params.photographerId}-${i + 1}`,
      url: `https://picsum.photos/400/400?random=${i + 1}`,
      createdAt: new Date(Date.now() - i * 86400000).toISOString(), // Each image 1 day apart
    });
  }

  return {
    images,
    totalCount: totalImages,
    hasNextPage: endIndex < totalImages,
    nextPage: endIndex < totalImages ? params.page + 1 : null,
  };
}

/**
 * Types for reservation data
 */
export interface TimeSlot {
  time: string; // "10:00", "14:00", etc.
  isReserved: boolean;
}

export interface RequiredShootingOption {
  id: string;
  title: string;
  price: number;
  duration: string; // "2시간", "3시간", etc.
  description: string;
}

export interface OptionalShootingOption {
  id: string;
  title: string;
  price: number;
  maxQuantity?: number;
}

export interface ReservationData {
  photographerId: string;
  availableDates: string[]; // ["2025-11-17", "2025-11-18", ...]
  timeSlotsByDate: Record<string, TimeSlot[]>; // { "2025-11-17": [...], ... }
  requiredOptions: RequiredShootingOption[];
  optionalOptions: OptionalShootingOption[];
}

/**
 * Get reservation data for a photographer
 * TODO: Replace with actual API call when backend is ready
 *
 * API endpoint will be: GET /api/photographers/:id/reservation
 */
export async function getReservationData(
  photographerId: string
): Promise<ReservationData> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Dummy data
  return {
    photographerId,
    availableDates: ['2025-11-17', '2025-11-18', '2025-11-20', '2025-11-21', '2025-11-23', '2025-11-25'],
    timeSlotsByDate: {
      '2025-11-17': [
        { time: '10:00', isReserved: false },
        { time: '11:00', isReserved: true },
        { time: '12:00', isReserved: false },
        { time: '14:00', isReserved: false },
        { time: '15:00', isReserved: false },
        { time: '16:00', isReserved: true },
      ],
      '2025-11-18': [
        { time: '09:00', isReserved: false },
        { time: '10:00', isReserved: false },
        { time: '11:00', isReserved: false },
        { time: '14:00', isReserved: false },
        { time: '15:00', isReserved: true },
        { time: '17:00', isReserved: false },
      ],
      '2025-11-20': [
        { time: '10:00', isReserved: false },
        { time: '11:00', isReserved: false },
        { time: '12:00', isReserved: false },
        { time: '13:00', isReserved: false },
        { time: '14:00', isReserved: false },
        { time: '16:00', isReserved: false },
      ],
      '2025-11-21': [
        { time: '09:00', isReserved: true },
        { time: '10:00', isReserved: false },
        { time: '11:00', isReserved: false },
        { time: '15:00', isReserved: false },
        { time: '16:00', isReserved: false },
        { time: '17:00', isReserved: false },
      ],
      '2025-11-23': [
        { time: '10:00', isReserved: false },
        { time: '11:00', isReserved: false },
        { time: '14:00', isReserved: false },
        { time: '15:00', isReserved: false },
        { time: '16:00', isReserved: false },
      ],
      '2025-11-25': [
        { time: '09:00', isReserved: false },
        { time: '10:00', isReserved: false },
        { time: '11:00', isReserved: true },
        { time: '12:00', isReserved: false },
        { time: '14:00', isReserved: false },
        { time: '15:00', isReserved: false },
        { time: '16:00', isReserved: false },
      ],
    },
    requiredOptions: [
      {
        id: 'req-1',
        title: '2인 기본 촬영',
        price: 50000,
        duration: '2시간',
        description: '2인 기준 기본 촬영 단가로 인원 추가나 시간 추가, 컨셉 추가 등에 따라 추가 비용이 발생할 수 있으며 선택 항목에서 확인 가능해요.',
      },
    ],
    optionalOptions: [
      {
        id: 'opt-1',
        title: '촬영 인원 추가',
        price: 10000,
        maxQuantity: 10,
      },
      {
        id: 'opt-2',
        title: '원본 사진 요청',
        price: 5000,
        maxQuantity: 100,
      },
    ],
  };
}
