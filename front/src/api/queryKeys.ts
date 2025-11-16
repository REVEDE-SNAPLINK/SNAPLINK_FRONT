/**
 * Centralized query keys for React Query
 *
 * Benefits:
 * - Consistent query key naming across all containers
 * - Type-safe query keys
 * - Easy cache invalidation
 * - Better cache hit rate by preventing key mismatches
 *
 * Usage:
 * ```typescript
 * import { photographerQueryKeys } from '@/api/queryKeys';
 *
 * // Instead of:
 * queryKey: ['photographer', photographerId]
 *
 * // Use:
 * queryKey: photographerQueryKeys.detail(photographerId)
 * ```
 */

import { FilterValue } from '@/types/filter';

export const photographerQueryKeys = {
  /**
   * Base key for all photographer queries
   */
  all: ['photographer'] as const,

  /**
   * All photographer lists
   */
  lists: () => [...photographerQueryKeys.all, 'list'] as const,

  /**
   * Search photographers with filters and sorting
   * @param searchKey - Search keyword
   * @param filters - Applied filters
   * @param sortBy - Sort order
   */
  search: (searchKey: string, filters: FilterValue[], sortBy: 'recommended' | 'latest') =>
    [...photographerQueryKeys.all, 'search', searchKey, filters, sortBy] as const,

  /**
   * Single photographer details
   * @param id - Photographer ID
   */
  detail: (id: string) => [...photographerQueryKeys.all, id] as const,

  /**
   * Photographer portfolio images
   * @param id - Photographer ID
   * @param page - Optional page number for pagination
   */
  portfolio: (id: string, page?: number) =>
    page !== undefined
      ? [...photographerQueryKeys.all, id, 'portfolio', page] as const
      : [...photographerQueryKeys.all, id, 'portfolio'] as const,

  /**
   * Photographer reservation/booking data
   * @param id - Photographer ID
   */
  reservation: (id: string) =>
    [...photographerQueryKeys.all, id, 'reservation'] as const,

  /**
   * Featured/banner photographers for home screen
   */
  featured: () => [...photographerQueryKeys.all, 'featured'] as const,

  /**
   * Popular photographers (ranked by rating/reviews)
   */
  popular: () => [...photographerQueryKeys.all, 'popular'] as const,

  /**
   * Recommended photographers for home screen
   */
  recommended: () => [...photographerQueryKeys.all, 'recommended'] as const,
};

export const userQueryKeys = {
  /**
   * Base key for all user queries
   */
  all: ['user'] as const,

  /**
   * User profile data
   * @param userId - User ID
   */
  profile: (userId: string) => [...userQueryKeys.all, 'profile', userId] as const,

  /**
   * User booking history
   * @param userId - User ID
   */
  bookingHistory: (userId: string) =>
    [...userQueryKeys.all, 'bookingHistory', userId] as const,
};

/**
 * Helper function to invalidate all photographer queries
 *
 * @example
 * ```typescript
 * // Invalidate all photographer-related queries
 * queryClient.invalidateQueries({ queryKey: photographerQueryKeys.all });
 *
 * // Invalidate specific photographer
 * queryClient.invalidateQueries({ queryKey: photographerQueryKeys.detail(id) });
 * ```
 */
export const invalidatePhotographerQueries = (queryClient: any, photographerId?: string) => {
  if (photographerId) {
    queryClient.invalidateQueries({ queryKey: photographerQueryKeys.detail(photographerId) });
  } else {
    queryClient.invalidateQueries({ queryKey: photographerQueryKeys.all });
  }
};
