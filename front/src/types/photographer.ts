export type PhotographerInfo = {
  id: string;
  uri?: string;
  info: string;
  price: number;
};

export type Photographer = {
  id: string;
  nickname: string;
  profileImage?: string;
  rating: number;
  reviewCount: number;
  portfolioImages: string[];
  shootingUnit: string; // e.g., "기본촬영/2시간"
  price: number;
  isPartner: boolean; // 파트너 작가
  gender: '여성작가' | '남성작가';
  shootingTypes: string[]; // e.g., ["커플", "웨딩", "인물"]
  styleTags: string[]; // e.g., ["우정", "자연광", "감성", "빈티지"] - UI에는 표시 안 됨
  region: string; // e.g., "서울", "경기"
  createdAt: string; // ISO date string for sorting
};

export type PhotographerDetails = Photographer & {
  name: string; // 실명
  introduction: string; // 소개글
  portfolioCount: number; // 전체 포트폴리오 개수
};

export type PortfolioImage = {
  id: string;
  url: string;
  createdAt: string;
};