import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

/** 디자인 기준 해상도 */
export const DESIGN_WIDTH = 375;
export const DESIGN_HEIGHT = 812;

/** 기본 스케일 비율 */
const scaleRatio = Math.min(width / DESIGN_WIDTH, height / DESIGN_HEIGHT);

/**
 * 선형 스케일링
 * @param size - 디자인 상의 크기
 * @returns 스케일링된 크기
 */
export const scale = (size: number): number => size * scaleRatio;

/**
 * 체감 비율을 고려한 중간 스케일링
 * @param size - 디자인 상의 크기
 * @param factor - 스케일 적용 비율 (0: 원본, 1: 완전 스케일)
 * @returns 스케일링된 크기
 */
export const moderateScale = (size: number, factor = 0.5): number => {
  const scaled = scale(size);
  return size + (scaled - size) * factor;
};

/**
 * 타입별 스케일 factor 규칙
 * - font: 폰트 크기, 작은 변화로도 가독성에 큰 영향
 * - spacing: 여백, padding, margin 등
 * - icon: 아이콘 크기, 시각적 일관성 중요
 * - radius: border radius, 미세한 조정 필요
 */
export const scaleRules = {
  font: 0.5,      // 50% 적용: 폰트는 과도한 스케일링 방지
  spacing: 0.6,   // 60% 적용: 적당한 여백 조정
  icon: 0.8,      // 80% 적용: 아이콘은 비교적 크게 스케일
  radius: 0.3,    // 30% 적용: radius는 미세하게 조정
} as const;

/**
 * 타입에 따른 스케일링 적용
 * @param size - 디자인 상의 크기
 * @param type - 스케일 타입
 * @returns 타입별로 스케일링된 크기
 */
export const scaleByType = (size: number, type: keyof typeof scaleRules = 'spacing'): number =>
  moderateScale(size, scaleRules[type]);