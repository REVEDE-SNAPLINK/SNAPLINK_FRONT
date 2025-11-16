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

/**
 * Types for Home Screen API
 */
export interface FeaturedPhotographer extends Photographer {
  featured: boolean;
  bannerImage?: string;
  bannerTitle?: string;
  bannerDescription?: string;
}

/**
 * Get featured photographers for home screen banner
 * TODO: Replace with actual API call when backend is ready
 *
 * API endpoint will be: GET /api/photographers/featured
 */
export async function getFeaturedPhotographers(): Promise<FeaturedPhotographer[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return top 5 photographers as featured
  const featured = DUMMY_PHOTOGRAPHERS.slice(0, 5).map((p) => ({
    ...p,
    featured: true,
    bannerImage: `https://picsum.photos/800/400?random=${p.id}`,
    bannerTitle: `${p.nickname}의 특별한 순간`,
    bannerDescription: `${p.styleTags.join(' · ')} 스타일`,
  }));

  return featured;
}

/**
 * Get popular photographers for home screen
 * TODO: Replace with actual API call when backend is ready
 *
 * API endpoint will be: GET /api/photographers/popular
 * Query params: limit (optional)
 */
export async function getPopularPhotographers(limit: number = 10): Promise<Photographer[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Sort by rating and reviewCount, then take top N
  const sorted = [...DUMMY_PHOTOGRAPHERS].sort((a, b) => {
    if (b.rating !== a.rating) {
      return b.rating - a.rating;
    }
    return b.reviewCount - a.reviewCount;
  });

  return sorted.slice(0, limit);
}

/**
 * Get recommended photographers for home screen
 * TODO: Replace with actual API call when backend is ready
 *
 * API endpoint will be: GET /api/photographers/recommended
 * Query params: userId (optional for personalized recommendations)
 */
export async function getRecommendedPhotographers(): Promise<Photographer[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // For now, return all photographers
  // In the future, this will be AI-powered recommendations based on user preferences
  return DUMMY_PHOTOGRAPHERS;
}

/**
 * Types for Booking History
 */
export interface UserBooking {
  id: string;
  photographerId: string;
  photographerName: string;
  photographerNickname: string;
  photographerImage?: string;
  bookingDate: string;
  bookingTime: string;
  shootingDuration: string;
  status: 'confirmed' | 'completed' | 'cancelled' | 'pending';
  totalPrice: number;
  location: string;
  shootingType: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingHistoryParams {
  userId: string;
  page: number;
  pageSize: number;
  status?: 'confirmed' | 'completed' | 'cancelled' | 'pending';
}

export interface BookingHistoryResponse {
  bookings: UserBooking[];
  totalCount: number;
  hasNextPage: boolean;
  nextPage: number | null;
}

/**
 * Get user's booking history
 * TODO: Replace with actual API call when backend is ready
 *
 * API endpoint will be: GET /api/users/:userId/bookings
 * Query params: page, pageSize, status (optional)
 */
export async function getUserBookingHistory(
  params: BookingHistoryParams
): Promise<BookingHistoryResponse> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Dummy booking data - Generate 25 bookings for testing infinite scroll
  const dummyBookings: UserBooking[] = [
    {
      id: 'booking-1',
      photographerId: '1',
      photographerName: '유앤미스냅 작가',
      photographerNickname: '유앤미스냅',
      photographerImage: 'https://picsum.photos/200/200?random=1',
      bookingDate: '2025-11-20',
      bookingTime: '14:00',
      shootingDuration: '2시간',
      status: 'confirmed',
      totalPrice: 50000,
      location: '서울',
      shootingType: '커플',
      createdAt: '2025-11-10T10:00:00Z',
      updatedAt: '2025-11-10T10:00:00Z',
    },
    {
      id: 'booking-2',
      photographerId: '3',
      photographerName: '스냅마스터 작가',
      photographerNickname: '스냅마스터',
      photographerImage: 'https://picsum.photos/200/200?random=7',
      bookingDate: '2025-11-05',
      bookingTime: '10:00',
      shootingDuration: '3시간',
      status: 'completed',
      totalPrice: 120000,
      location: '서울',
      shootingType: '웨딩',
      createdAt: '2025-10-25T15:30:00Z',
      updatedAt: '2025-11-05T14:00:00Z',
    },
    {
      id: 'booking-3',
      photographerId: '7',
      photographerName: '웨딩스냅전문 작가',
      photographerNickname: '웨딩스냅전문',
      photographerImage: 'https://picsum.photos/200/200?random=19',
      bookingDate: '2025-10-15',
      bookingTime: '11:00',
      shootingDuration: '4시간',
      status: 'completed',
      totalPrice: 200000,
      location: '경기',
      shootingType: '웨딩',
      createdAt: '2025-10-01T09:00:00Z',
      updatedAt: '2025-10-15T16:00:00Z',
    },
    {
      id: 'booking-4',
      photographerId: '4',
      photographerName: '뷰티포토 작가',
      photographerNickname: '뷰티포토',
      photographerImage: 'https://picsum.photos/200/200?random=10',
      bookingDate: '2025-09-20',
      bookingTime: '15:00',
      shootingDuration: '2시간',
      status: 'completed',
      totalPrice: 70000,
      location: '부산',
      shootingType: '인물',
      createdAt: '2025-09-10T11:00:00Z',
      updatedAt: '2025-09-20T17:30:00Z',
    },
    {
      id: 'booking-5',
      photographerId: '6',
      photographerName: '펫포토그래퍼 작가',
      photographerNickname: '펫포토그래퍼',
      photographerImage: 'https://picsum.photos/200/200?random=16',
      bookingDate: '2025-12-01',
      bookingTime: '10:00',
      shootingDuration: '2시간',
      status: 'pending',
      totalPrice: 90000,
      location: '서울',
      shootingType: '반려동물',
      createdAt: '2025-11-15T14:00:00Z',
      updatedAt: '2025-11-15T14:00:00Z',
    },
    {
      id: 'booking-6',
      photographerId: '2',
      photographerName: '포토스튜디오 김 작가',
      photographerNickname: '포토스튜디오 김',
      photographerImage: 'https://picsum.photos/200/200?random=4',
      bookingDate: '2025-09-10',
      bookingTime: '16:00',
      shootingDuration: '1시간',
      status: 'completed',
      totalPrice: 80000,
      location: '경기',
      shootingType: '사물',
      createdAt: '2025-09-01T10:00:00Z',
      updatedAt: '2025-09-10T17:30:00Z',
    },
    {
      id: 'booking-7',
      photographerId: '5',
      photographerName: '감성사진관 작가',
      photographerNickname: '감성사진관',
      photographerImage: 'https://picsum.photos/200/200?random=13',
      bookingDate: '2025-08-25',
      bookingTime: '14:00',
      shootingDuration: '1.5시간',
      status: 'completed',
      totalPrice: 60000,
      location: '인천',
      shootingType: '커플',
      createdAt: '2025-08-15T12:00:00Z',
      updatedAt: '2025-08-25T16:00:00Z',
    },
    {
      id: 'booking-8',
      photographerId: '1',
      photographerName: '유앤미스냅 작가',
      photographerNickname: '유앤미스냅',
      photographerImage: 'https://picsum.photos/200/200?random=1',
      bookingDate: '2025-08-15',
      bookingTime: '11:00',
      shootingDuration: '2시간',
      status: 'completed',
      totalPrice: 50000,
      location: '서울',
      shootingType: '우정',
      createdAt: '2025-08-05T09:00:00Z',
      updatedAt: '2025-08-15T13:30:00Z',
    },
    {
      id: 'booking-9',
      photographerId: '3',
      photographerName: '스냅마스터 작가',
      photographerNickname: '스냅마스터',
      photographerImage: 'https://picsum.photos/200/200?random=7',
      bookingDate: '2025-07-20',
      bookingTime: '09:00',
      shootingDuration: '3시간',
      status: 'completed',
      totalPrice: 120000,
      location: '서울',
      shootingType: '인물',
      createdAt: '2025-07-10T08:00:00Z',
      updatedAt: '2025-07-20T12:30:00Z',
    },
    {
      id: 'booking-10',
      photographerId: '6',
      photographerName: '펫포토그래퍼 작가',
      photographerNickname: '펫포토그래퍼',
      photographerImage: 'https://picsum.photos/200/200?random=16',
      bookingDate: '2025-07-10',
      bookingTime: '15:00',
      shootingDuration: '2시간',
      status: 'completed',
      totalPrice: 90000,
      location: '서울',
      shootingType: '반려동물',
      createdAt: '2025-07-01T10:00:00Z',
      updatedAt: '2025-07-10T17:30:00Z',
    },
    {
      id: 'booking-11',
      photographerId: '8',
      photographerName: '제품사진전문가 작가',
      photographerNickname: '제품사진전문가',
      photographerImage: 'https://picsum.photos/200/200?random=22',
      bookingDate: '2025-06-25',
      bookingTime: '13:00',
      shootingDuration: '1시간',
      status: 'completed',
      totalPrice: 100000,
      location: '서울',
      shootingType: '사물',
      createdAt: '2025-06-15T11:00:00Z',
      updatedAt: '2025-06-25T14:30:00Z',
    },
    {
      id: 'booking-12',
      photographerId: '4',
      photographerName: '뷰티포토 작가',
      photographerNickname: '뷰티포토',
      photographerImage: 'https://picsum.photos/200/200?random=10',
      bookingDate: '2025-06-10',
      bookingTime: '10:00',
      shootingDuration: '2시간',
      status: 'completed',
      totalPrice: 70000,
      location: '부산',
      shootingType: '인물',
      createdAt: '2025-06-01T09:00:00Z',
      updatedAt: '2025-06-10T12:30:00Z',
    },
    {
      id: 'booking-13',
      photographerId: '7',
      photographerName: '웨딩스냅전문 작가',
      photographerNickname: '웨딩스냅전문',
      photographerImage: 'https://picsum.photos/200/200?random=19',
      bookingDate: '2025-05-20',
      bookingTime: '11:00',
      shootingDuration: '4시간',
      status: 'completed',
      totalPrice: 200000,
      location: '경기',
      shootingType: '웨딩',
      createdAt: '2025-05-10T10:00:00Z',
      updatedAt: '2025-05-20T16:00:00Z',
    },
    {
      id: 'booking-14',
      photographerId: '2',
      photographerName: '포토스튜디오 김 작가',
      photographerNickname: '포토스튜디오 김',
      photographerImage: 'https://picsum.photos/200/200?random=4',
      bookingDate: '2025-05-05',
      bookingTime: '14:00',
      shootingDuration: '1시간',
      status: 'completed',
      totalPrice: 80000,
      location: '경기',
      shootingType: '인물',
      createdAt: '2025-04-25T12:00:00Z',
      updatedAt: '2025-05-05T15:30:00Z',
    },
    {
      id: 'booking-15',
      photographerId: '5',
      photographerName: '감성사진관 작가',
      photographerNickname: '감성사진관',
      photographerImage: 'https://picsum.photos/200/200?random=13',
      bookingDate: '2025-04-18',
      bookingTime: '16:00',
      shootingDuration: '1.5시간',
      status: 'completed',
      totalPrice: 60000,
      location: '인천',
      shootingType: '인물',
      createdAt: '2025-04-08T14:00:00Z',
      updatedAt: '2025-04-18T17:45:00Z',
    },
    {
      id: 'booking-16',
      photographerId: '1',
      photographerName: '유앤미스냅 작가',
      photographerNickname: '유앤미스냅',
      photographerImage: 'https://picsum.photos/200/200?random=1',
      bookingDate: '2025-04-01',
      bookingTime: '10:00',
      shootingDuration: '2시간',
      status: 'completed',
      totalPrice: 50000,
      location: '서울',
      shootingType: '커플',
      createdAt: '2025-03-20T09:00:00Z',
      updatedAt: '2025-04-01T12:30:00Z',
    },
    {
      id: 'booking-17',
      photographerId: '3',
      photographerName: '스냅마스터 작가',
      photographerNickname: '스냅마스터',
      photographerImage: 'https://picsum.photos/200/200?random=7',
      bookingDate: '2025-03-15',
      bookingTime: '13:00',
      shootingDuration: '3시간',
      status: 'completed',
      totalPrice: 120000,
      location: '서울',
      shootingType: '웨딩',
      createdAt: '2025-03-05T11:00:00Z',
      updatedAt: '2025-03-15T16:30:00Z',
    },
    {
      id: 'booking-18',
      photographerId: '6',
      photographerName: '펫포토그래퍼 작가',
      photographerNickname: '펫포토그래퍼',
      photographerImage: 'https://picsum.photos/200/200?random=16',
      bookingDate: '2025-02-28',
      bookingTime: '11:00',
      shootingDuration: '2시간',
      status: 'completed',
      totalPrice: 90000,
      location: '서울',
      shootingType: '반려동물',
      createdAt: '2025-02-18T10:00:00Z',
      updatedAt: '2025-02-28T13:30:00Z',
    },
    {
      id: 'booking-19',
      photographerId: '8',
      photographerName: '제품사진전문가 작가',
      photographerNickname: '제품사진전문가',
      photographerImage: 'https://picsum.photos/200/200?random=22',
      bookingDate: '2025-02-10',
      bookingTime: '15:00',
      shootingDuration: '1시간',
      status: 'completed',
      totalPrice: 100000,
      location: '서울',
      shootingType: '사물',
      createdAt: '2025-02-01T13:00:00Z',
      updatedAt: '2025-02-10T16:30:00Z',
    },
    {
      id: 'booking-20',
      photographerId: '4',
      photographerName: '뷰티포토 작가',
      photographerNickname: '뷰티포토',
      photographerImage: 'https://picsum.photos/200/200?random=10',
      bookingDate: '2025-01-25',
      bookingTime: '14:00',
      shootingDuration: '2시간',
      status: 'completed',
      totalPrice: 70000,
      location: '부산',
      shootingType: '인물',
      createdAt: '2025-01-15T12:00:00Z',
      updatedAt: '2025-01-25T16:30:00Z',
    },
    {
      id: 'booking-21',
      photographerId: '7',
      photographerName: '웨딩스냅전문 작가',
      photographerNickname: '웨딩스냅전문',
      photographerImage: 'https://picsum.photos/200/200?random=19',
      bookingDate: '2025-01-10',
      bookingTime: '10:00',
      shootingDuration: '4시간',
      status: 'completed',
      totalPrice: 200000,
      location: '경기',
      shootingType: '웨딩',
      createdAt: '2024-12-30T09:00:00Z',
      updatedAt: '2025-01-10T15:00:00Z',
    },
    {
      id: 'booking-22',
      photographerId: '2',
      photographerName: '포토스튜디오 김 작가',
      photographerNickname: '포토스튜디오 김',
      photographerImage: 'https://picsum.photos/200/200?random=4',
      bookingDate: '2024-12-20',
      bookingTime: '13:00',
      shootingDuration: '1시간',
      status: 'completed',
      totalPrice: 80000,
      location: '경기',
      shootingType: '사물',
      createdAt: '2024-12-10T11:00:00Z',
      updatedAt: '2024-12-20T14:30:00Z',
    },
    {
      id: 'booking-23',
      photographerId: '5',
      photographerName: '감성사진관 작가',
      photographerNickname: '감성사진관',
      photographerImage: 'https://picsum.photos/200/200?random=13',
      bookingDate: '2024-12-05',
      bookingTime: '16:00',
      shootingDuration: '1.5시간',
      status: 'completed',
      totalPrice: 60000,
      location: '인천',
      shootingType: '커플',
      createdAt: '2024-11-25T14:00:00Z',
      updatedAt: '2024-12-05T17:45:00Z',
    },
    {
      id: 'booking-24',
      photographerId: '1',
      photographerName: '유앤미스냅 작가',
      photographerNickname: '유앤미스냅',
      photographerImage: 'https://picsum.photos/200/200?random=1',
      bookingDate: '2024-11-18',
      bookingTime: '11:00',
      shootingDuration: '2시간',
      status: 'completed',
      totalPrice: 50000,
      location: '서울',
      shootingType: '우정',
      createdAt: '2024-11-08T10:00:00Z',
      updatedAt: '2024-11-18T13:30:00Z',
    },
    {
      id: 'booking-25',
      photographerId: '3',
      photographerName: '스냅마스터 작가',
      photographerNickname: '스냅마스터',
      photographerImage: 'https://picsum.photos/200/200?random=7',
      bookingDate: '2024-11-01',
      bookingTime: '09:00',
      shootingDuration: '3시간',
      status: 'completed',
      totalPrice: 120000,
      location: '서울',
      shootingType: '인물',
      createdAt: '2024-10-20T08:00:00Z',
      updatedAt: '2024-11-01T12:30:00Z',
    },
  ];

  // Filter by status if provided
  let filtered = dummyBookings;
  if (params.status) {
    filtered = dummyBookings.filter((b) => b.status === params.status);
  }

  // Sort by booking date descending (most recent first)
  filtered.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());

  // Pagination
  const startIndex = (params.page - 1) * params.pageSize;
  const endIndex = startIndex + params.pageSize;
  const paginatedData = filtered.slice(startIndex, endIndex);

  return {
    bookings: paginatedData,
    totalCount: filtered.length,
    hasNextPage: endIndex < filtered.length,
    nextPage: endIndex < filtered.length ? params.page + 1 : null,
  };
}
