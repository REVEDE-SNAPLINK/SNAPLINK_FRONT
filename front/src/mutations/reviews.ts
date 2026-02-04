import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createBookingReview,
  createReviewReply,
  CreateReservationReviewParams,
  CreateReviewReplyParams,
  updateReview,
  UpdateReviewParams,
  deleteReview,
} from '@/api/reviews';
import { reviewsQueryKeys } from '@/queries/keys';
import { photographersQueryKeys } from '@/queries/keys';
import { bookingsQueryKeys } from '@/queries/keys'; // reservations 키가 keys.ts에 있으면

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
    mutationFn: (params: CreateReservationReviewParams) => createBookingReview(params),
    onSuccess: async (_, vars) => {
      // 리뷰 작성 후 바뀌는 것들:
      // - 고객 예약 리스트/예약 상세(상태가 REVIEWED로 변할 수 있음)
      // - 작가 리뷰 목록/요약(새 리뷰가 추가됨)
      // - 해당 예약의 리뷰 조회 (bookingReviewMe)
      await Promise.all([
        qc.invalidateQueries({ queryKey: bookingsQueryKeys.lists() }),
        qc.invalidateQueries({ queryKey: bookingsQueryKeys.booking(vars.bookingId) }),
        qc.invalidateQueries({ queryKey: reviewsQueryKeys.bookingReviewMe(vars.bookingId) }),
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
export const useUpdateReviewMutation = (photographerId?: string, bookingId?: number) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateReviewParams) => updateReview(params),
    onSuccess: async (_, vars) => {
      // 리뷰 수정 후 갱신:
      // - 내 리뷰 목록
      // - 해당 리뷰 detail
      // - 해당 예약의 리뷰 조회 (bookingReviewMe)
      // - 작가 리뷰 목록/요약
      await Promise.all([
        qc.invalidateQueries({ queryKey: reviewsQueryKeys.myReviews() }),
        qc.invalidateQueries({ queryKey: reviewsQueryKeys.review(vars.reviewId) }),
        // bookingReviewMe 쿼리 무효화 (리뷰 상세 화면 갱신용)
        ...(bookingId
          ? [qc.invalidateQueries({ queryKey: reviewsQueryKeys.bookingReviewMe(bookingId) })]
          : [qc.invalidateQueries({ queryKey: [...reviewsQueryKeys.all, 'booking'] })]),
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
    mutationFn: (reviewId: number) => deleteReview(reviewId),
    onSuccess: async () => {
      // 리뷰 삭제 후 갱신:
      // - 내 리뷰 목록
      // - 고객 예약 리스트 (isReview 상태 변경)
      // - bookingReviewMe 쿼리 무효화
      // - 작가 리뷰 목록/요약
      await Promise.all([
        qc.invalidateQueries({ queryKey: reviewsQueryKeys.myReviews() }),
        qc.invalidateQueries({ queryKey: bookingsQueryKeys.userList() }),
        qc.invalidateQueries({ queryKey: [...reviewsQueryKeys.all, 'booking'] }),
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
