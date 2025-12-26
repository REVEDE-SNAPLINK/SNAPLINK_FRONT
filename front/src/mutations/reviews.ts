// src/queries/reviews/mutations.ts (또는 기존 mutations 폴더)
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createReservationReview,
  createReviewReply,
  CreateReservationReviewParams,
  CreateReviewReplyParams,
  updateReview,
  UpdateReviewParams,
  deleteReview,
} from '@/api/reviews';
import { reviewsQueryKeys } from '@/queries/keys';
import { photographersQueryKeys } from '@/queries/keys';
import { reservationsQueryKeys } from '@/queries/keys'; // reservations 키가 keys.ts에 있으면
import { deleteMockReview, updateMockReview } from '@/__dev__/mockReviews';

const USE_MOCK_DATA = __DEV__;

/** 리뷰 답글 작성(작가 전용) */
export const useCreateReviewReplyMutation = (photographerId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateReviewReplyParams) => createReviewReply(params),
    onSuccess: async (_, vars) => {
      // 1) 해당 리뷰 detail이 있다면 갱신
      // 2) 작가 리뷰 목록/요약 갱신(답글이 리뷰 카드에 보일 가능성 높음)
      await Promise.all([
        qc.invalidateQueries({ queryKey: reviewsQueryKeys.review(vars.reviewId) }),
        ...(photographerId
          ? [
            qc.invalidateQueries({ queryKey: photographersQueryKeys.reviews(photographerId) }),
            qc.invalidateQueries({ queryKey: photographersQueryKeys.reviewSummary(photographerId) }),
          ]
          : []),
      ]);
    },
  });
};

/** 촬영 리뷰 작성(고객 전용) */
export const useCreateReservationReviewMutation = (photographerId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateReservationReviewParams) => createReservationReview(params),
    onSuccess: async (_, vars) => {
      // 리뷰 작성 후 바뀌는 것들:
      // - 고객 예약 리스트/예약 상세(상태가 REVIEWED로 변할 수 있음)
      // - 작가 리뷰 목록/요약(새 리뷰가 추가됨)
      await Promise.all([
        qc.invalidateQueries({ queryKey: reservationsQueryKeys.lists() }),
        qc.invalidateQueries({ queryKey: reservationsQueryKeys.reservation(vars.reservationId) }),
        ...(photographerId
          ? [
            qc.invalidateQueries({ queryKey: photographersQueryKeys.reviews(photographerId) }),
            qc.invalidateQueries({ queryKey: photographersQueryKeys.reviewSummary(photographerId) }),
          ]
          : []),
      ]);
    },
  });
};
/** 리뷰 수정(고객 전용) */
export const useUpdateReviewMutation = (photographerId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateReviewParams) => {
      if (USE_MOCK_DATA) {
        console.log('🎭 [DEV MODE] Updating mock review:', params.reviewId);
        return new Promise<void>((resolve, reject) => {
          setTimeout(() => {
            const success = updateMockReview(params.reviewId, {
              rating: params.request.rating,
              shootingTag: params.request.shootingTag,
              content: params.request.content,
              // images는 별도 처리 필요 시 추가
            });
            if (success) {
              resolve();
            } else {
              reject(new Error('Mock review not found'));
            }
          }, 300);
        });
      }
      return updateReview(params);
    },
    onSuccess: async (_, vars) => {
      // 리뷰 수정 후 갱신:
      // - 내 리뷰 목록
      // - 해당 리뷰 detail
      // - 작가 리뷰 목록/요약
      await Promise.all([
        qc.invalidateQueries({ queryKey: reviewsQueryKeys.myReviews() }),
        qc.invalidateQueries({ queryKey: reviewsQueryKeys.review(vars.reviewId) }),
        ...(photographerId
          ? [
            qc.invalidateQueries({ queryKey: photographersQueryKeys.reviews(photographerId) }),
            qc.invalidateQueries({ queryKey: photographersQueryKeys.reviewSummary(photographerId) }),
          ]
          : []),
      ]);
    },
  });
};

/** 리뷰 삭제(고객 전용) */
export const useDeleteReviewMutation = (photographerId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: number) => {
      if (USE_MOCK_DATA) {
        console.log('🎭 [DEV MODE] Deleting mock review:', reviewId);
        return new Promise<void>((resolve, reject) => {
          setTimeout(() => {
            const success = deleteMockReview(reviewId);
            if (success) {
              resolve();
            } else {
              reject(new Error('Mock review not found'));
            }
          }, 300);
        });
      }
      return deleteReview(reviewId);
    },
    onSuccess: async () => {
      // 리뷰 삭제 후 갱신:
      // - 내 리뷰 목록
      // - 작가 리뷰 목록/요약
      await Promise.all([
        qc.invalidateQueries({ queryKey: reviewsQueryKeys.myReviews() }),
        ...(photographerId
          ? [
            qc.invalidateQueries({ queryKey: photographersQueryKeys.reviews(photographerId) }),
            qc.invalidateQueries({ queryKey: photographersQueryKeys.reviewSummary(photographerId) }),
          ]
          : []),
      ]);
    },
  });
};
