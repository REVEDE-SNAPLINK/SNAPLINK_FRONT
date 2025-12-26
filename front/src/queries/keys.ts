import { GetPageable } from '@/api/community.ts';
import { GetReservationListParams } from '@/api/reservations.ts';
import type { SearchPhotographersBody } from '@/api/photographers';

// Meta data (regions, concepts)
export const metaKeys = {
  all: ['meta'] as const,
  regions: () => [...metaKeys.all, 'regions'] as const,
  concepts: () => [...metaKeys.all, 'concepts'] as const,
};

// Community
export const communityKeys = {
  all: ['community'] as const,
  posts: () => [...communityKeys.all, 'posts'] as const,
  postsList: (params: Omit<GetPageable, 'page'>) =>
    [...communityKeys.posts(), 'infinite', params] as const,
  post: (postId: string) => [...communityKeys.posts(), 'detail', postId] as const,
  comments: (postId: string, params?: GetPageable) =>
    [...communityKeys.post(postId), 'comments', params] as const,
  myPosts: () => [...communityKeys.all, 'posts', 'me'] as const,
  myPostsInfinite: (pageableWithoutPage: Omit<GetPageable, 'page'>) =>
    [...communityKeys.myPosts(), 'infinite', pageableWithoutPage] as const,
};

// User
export const userQueryKeys = {
  all: ['user'] as const,

  // (너 기존 코드 호환용) 유저 프로필(확장 프로필 같은 걸로 쓰는 자리)
  profile: () => [...userQueryKeys.all, 'profile'] as const,

  // /api/user/me
  me: () => [...userQueryKeys.all, 'me'] as const,
};

// Photographer
export const photographersQueryKeys = {
  all: ['photographers'] as const,

  // -------- profile --------
  profile: (photographerId: string) =>
    [...photographersQueryKeys.all, 'profile', photographerId] as const,

  // 프로필 응답에 portfolios 페이징이 실제로 반영된다면(쿼리로 page/size/sort 주는 경우)
  profilePageable: (photographerId: string, pageable: GetPageable) =>
    [...photographersQueryKeys.profile(photographerId), 'pageable', pageable] as const,

  profileInfinite: (
    photographerId: string,
    pageableWithoutPage: Omit<GetPageable, 'page'>,
  ) => [...photographersQueryKeys.profile(photographerId), 'infinite', pageableWithoutPage] as const,

  // -------- search (infinite) --------
  search: () => [...photographersQueryKeys.all, 'search'] as const,

  searchMainTop3: (sort: 'createdAt,DESC' | 'averageRating,DESC') =>
    [
      ...photographersQueryKeys.search(),
      'mainTop3',
      { page: 0, size: 3, sort: [sort] } as const,
    ] as const,

  searchInfinite: (
    pageableWithoutPage: Omit<GetPageable, 'page'>,
    body: SearchPhotographersBody,
  ) => [...photographersQueryKeys.search(), 'infinite', pageableWithoutPage, body] as const,

  // -------- reviews --------
  reviews: (photographerId: string) =>
    [...photographersQueryKeys.all, 'reviews', photographerId] as const,

  reviewsInfinite: (photographerId: string, pageableWithoutPage: Omit<GetPageable, 'page'>) =>
    [...photographersQueryKeys.reviews(photographerId), 'infinite', pageableWithoutPage] as const,

  reviewSummary: (photographerId: string) =>
    [...photographersQueryKeys.reviews(photographerId), 'summary'] as const,

  scrappedMe: () => [...photographersQueryKeys.all, 'me', 'scrapped'] as const,
  scrappedMeInfinite: (pageableWithoutPage: Omit<GetPageable, 'page'>) =>
    [...photographersQueryKeys.scrappedMe(), 'infinite', pageableWithoutPage] as const,

  scrapStatus: (photographerId: string) =>
    [...photographersQueryKeys.all, 'scrap', 'status', photographerId] as const,
};

// Reservation
export const reservationsQueryKeys = {
  all: ['reservations'] as const,

  lists: () => [...reservationsQueryKeys.all, 'list'] as const,

  userList: () => [...reservationsQueryKeys.lists(), 'user'] as const,
  photographerList: () => [...reservationsQueryKeys.lists(), 'photographer'] as const,

  userListInfinite: (params: Omit<GetReservationListParams, 'page'>) =>
    [...reservationsQueryKeys.userList(), 'infinite', params] as const,

  photographerListInfinite: (params: Omit<GetReservationListParams, 'page'>) =>
    [...reservationsQueryKeys.photographerList(), 'infinite', params] as const,

  monthlySchedule: (photographerId: string, month: string) =>
    [...reservationsQueryKeys.all, 'monthlySchedule', photographerId, month] as const,

  availableSlots: (photographerId: string, date: string) =>
    [...reservationsQueryKeys.all, 'availableSlots', photographerId, date] as const,

  reservation: (reservationId: number) =>
    [...reservationsQueryKeys.all, 'detail', reservationId] as const,

  reservationPhotos: (reservationId: number) =>
    [...reservationsQueryKeys.reservation(reservationId), 'photos'] as const,
};

// Reviews
export const reviewsQueryKeys = {
  all: ['reviews'] as const,
  myReviews: () => [...reviewsQueryKeys.all, 'my'] as const,
  myReviewsInfinite: (pageableWithoutPage: Omit<GetPageable, 'page'>) =>
    [...reviewsQueryKeys.myReviews(), 'infinite', pageableWithoutPage] as const,
  // 특정 작가의 리뷰 목록/요약은 photographers 쪽 키를 이미 쓰고 있다면 그쪽 invalidate도 가능
  review: (reviewId: number) => [...reviewsQueryKeys.all, 'detail', reviewId] as const,
};

// Notifications
export const notificationsQueryKeys = {
  all: ['notifications'] as const,

  list: () => [...notificationsQueryKeys.all, 'list'] as const,
  unreadStatus: () => [...notificationsQueryKeys.all, 'unreadStatus'] as const,

  notification: (notificationId: number) =>
    [...notificationsQueryKeys.all, 'detail', notificationId] as const,
};

// Chat
export const chatQueryKeys = {
  all: ['chat'] as const,

  rooms: () => [...chatQueryKeys.all, 'rooms'] as const,

  room: (roomId: number) => [...chatQueryKeys.all, 'room', roomId] as const,

  // infinite: pageParam으로 paging 처리하므로 page 제외
  messagesInfinite: (roomId: number, paramsWithoutPage: Omit<import('@/api/chat').GetChatMessagesParams, 'page'>) =>
    [...chatQueryKeys.room(roomId), 'messages', 'infinite', paramsWithoutPage] as const,
};