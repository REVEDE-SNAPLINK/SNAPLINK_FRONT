import { GetPageable } from '@/api/community.ts';
import { GetBookingListParams } from '@/api/bookings.ts';
import type { SearchPhotographersBody } from '@/api/photographers';
import type { GetPhotographerMonthSchedulesParams, GetPhotographerDayDetailParams } from '@/api/schedules';

// Meta data (regions, concepts, tags)
export const metaKeys = {
  all: ['meta'] as const,
  regions: () => [...metaKeys.all, 'regions'] as const,
  concepts: () => [...metaKeys.all, 'concepts'] as const,
  tags: () => [...metaKeys.all, 'tags'] as const,
};

// Community
export const communityKeys = {
  all: ['community'] as const,
  posts: () => [...communityKeys.all, 'posts'] as const,
  postsList: (params: Omit<GetPageable, 'page'>) =>
    [...communityKeys.posts(), 'infinite', params] as const,
  post: (postId: number) => [...communityKeys.posts(), 'detail', postId] as const,
  comments: (postId: number, params?: GetPageable) =>
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

  notifications: () => [...notificationsQueryKeys.all, 'notifications'] as const,

  // user search by nickname
  search: () => [...userQueryKeys.all, 'search'] as const,
  searchInfinite: (nickname: string, pageableWithoutPage: Omit<GetPageable, 'page'>) =>
    [...userQueryKeys.search(), 'infinite', nickname, pageableWithoutPage] as const,
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

  // -------- portfolio --------
  portfolio: (postId: number) =>
    [...photographersQueryKeys.all, 'portfolio', postId] as const,

  // -------- search (infinite) --------
  search: () => [...photographersQueryKeys.all, 'search'] as const,

  searchMainTop3: (sort?: 'averageRating,desc') =>
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

  // -------- status --------
  statusMe: () => [...photographersQueryKeys.all, 'status', 'me'] as const,

  // -------- holidays --------
  holidays: () => [...photographersQueryKeys.all, 'holidays'] as const,

  // -------- regions, concepts, tags --------
  regionsConceptsTags: (photographerId: string) =>
    [...photographersQueryKeys.all, 'regionsConceptsTags', photographerId] as const,
};

// Booking
export const bookingsQueryKeys = {
  all: ['bookings'] as const,

  lists: () => [...bookingsQueryKeys.all, 'list'] as const,

  userList: () => [...bookingsQueryKeys.lists(), 'user'] as const,
  photographerList: () => [...bookingsQueryKeys.lists(), 'photographer'] as const,

  userListInfinite: (params: Omit<GetBookingListParams, 'page'>) =>
    [...bookingsQueryKeys.userList(), 'infinite', params] as const,

  photographerListInfinite: (params: Omit<GetBookingListParams, 'page'>) =>
    [...bookingsQueryKeys.photographerList(), 'infinite', params] as const,

  monthlySchedule: (photographerId: string, year: string, month: string) =>
    [...bookingsQueryKeys.all, 'monthlySchedule', photographerId, year, month] as const,

  availableDays: (photographerId: string, date: string) =>
    [...bookingsQueryKeys.all, 'availableDays', photographerId, date] as const,

  booking: (bookingId: number) =>
    [...bookingsQueryKeys.all, 'detail', bookingId] as const,

  bookingPhotos: (bookingId: number) =>
    [...bookingsQueryKeys.all, 'reservation', bookingId, 'photos'] as const,
};

// Reviews
export const reviewsQueryKeys = {
  all: ['reviews'] as const,
  myReviews: () => [...reviewsQueryKeys.all, 'my'] as const,
  myReviewsInfinite: (pageableWithoutPage: Omit<GetPageable, 'page'>) =>
    [...reviewsQueryKeys.myReviews(), 'infinite', pageableWithoutPage] as const,
  // 특정 작가의 리뷰 목록/요약은 photographers 쪽 키를 이미 쓰고 있다면 그쪽 invalidate도 가능
  review: (reviewId: number) => [...reviewsQueryKeys.all, 'detail', reviewId] as const,
  bookingReviewMe: (bookingId: number) => [...reviewsQueryKeys.all, 'booking', bookingId, 'me'] as const,
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

  roomDetail: (roomId: number) => [...chatQueryKeys.all, 'roomDetail', roomId] as const,

  // infinite: pageParam으로 paging 처리하므로 page 제외
  messagesInfinite: (roomId: number, paramsWithoutPage: Omit<import('@/api/chat').GetChatMessagesParams, 'page'>) =>
    [...chatQueryKeys.room(roomId), 'messages', 'infinite', paramsWithoutPage] as const,

  blocks: () => [...chatQueryKeys.all, 'blocks'] as const,
  blockList: () => [...chatQueryKeys.blocks(), 'list'] as const,
  block: (targetId: string) => [...chatQueryKeys.blocks(), 'item', targetId] as const,

  // blocked chat rooms list (roomIds)
  blockedRooms: () => [...chatQueryKeys.all, 'blockedRooms'] as const,
};

// Schedules
export const schedulesQueryKeys = {
  all: ['schedules'] as const,

  photographerMonth: (params: GetPhotographerMonthSchedulesParams) =>
    [...schedulesQueryKeys.all, 'photographer', 'month', params] as const,

  photographerDay: (params: GetPhotographerDayDetailParams) =>
    [...schedulesQueryKeys.all, 'photographer', 'day', params] as const,

  availableDays: (params: GetPhotographerMonthSchedulesParams) =>
    [...schedulesQueryKeys.all, 'availableDays', params] as const,

  availableTimes: (params: GetPhotographerDayDetailParams) =>
    [...schedulesQueryKeys.all, 'availableTimes', params] as const,

  weeklySchedule: (photographerId: string) =>
    [...schedulesQueryKeys.all, 'weekly', photographerId] as const,

  personalSchedule: (id: number) =>
    [...schedulesQueryKeys.all, 'personal', id] as const,
};

// Shootings
export const shootingsQueryKeys = {
  all: ['shootings'] as const,

  // 내 촬영 상품 목록
  me: () => [...shootingsQueryKeys.all, 'me'] as const,

  // 특정 작가의 촬영 상품 목록
  shootings: (photographerId: string) =>
    [...shootingsQueryKeys.all, 'photographer', photographerId] as const,

  // 특정 촬영 상품
  shooting: (shootingId: number) =>
    [...shootingsQueryKeys.all, 'shooting', shootingId] as const,

  // 특정 촬영 상품의 옵션들
  options: (productId: number) =>
    [...shootingsQueryKeys.all, 'options', productId] as const,
};

export const noticeQueryKeys = {
  all: ['notices'] as const,

  lists: () => [...noticeQueryKeys.all, 'list'] as const,

  notice: (id: number) => [...noticeQueryKeys.all, 'notice', id] as const,
}