/**
 * 개발 모드 더미 데이터 통합 관리
 *
 * 모든 API의 더미 데이터를 한 곳에서 import하여 사용
 */

export * from './mockReviews';
export * from './mockPhotographers';
export * from './mockReservations';
export * from './mockCommunity';
export * from './mockNotifications';
export * from './mockChat';

/**
 * 개발 모드 플래그
 * - __DEV__: React Native의 개발 모드 플래그
 * - true로 설정하면 모든 API가 더미 데이터 사용
 * - false로 설정하면 실제 API 호출
 *
 * 🔧 실제 API를 사용하려면 아래 값을 false로 변경하세요
 */
// export const USE_MOCK_DATA = __DEV__;
export const USE_MOCK_DATA = false;// false로 변경하면 실제 API 사용

/**
 * Query용 유틸리티: 개발 모드에서 더미 데이터 반환, 프로덕션에서 실제 API 호출
 */
export async function withMockData<T>(
  mockDataFn: () => T,
  apiCallFn: () => Promise<T>,
  delay: number = 500,
): Promise<T> {
  if (USE_MOCK_DATA) {
    console.log('🎭 [DEV MODE] Using mock data');
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockDataFn());
      }, delay);
    });
  }

  try {
    return await apiCallFn();
  } catch (error) {
    console.warn('⚠️ API call failed, falling back to mock data:', error);
    return mockDataFn();
  }
}

/**
 * Mutation용 유틸리티: 개발 모드에서 더미 데이터 조작, 프로덕션에서 실제 API 호출
 */
export async function withMockMutation<T>(
  mockMutationFn: () => T,
  apiMutationFn: () => Promise<T>,
  delay: number = 300,
): Promise<T> {
  if (USE_MOCK_DATA) {
    console.log('🎭 [DEV MODE] Executing mock mutation');
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockMutationFn());
      }, delay);
    });
  }

  return apiMutationFn();
}
