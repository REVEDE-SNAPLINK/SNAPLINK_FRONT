import { getApiBaseUrl } from '@/config/api.ts';
import { UploadImageParams } from '@/types/image.ts';
import { buildQuery } from '@/utils/format.ts';
import { authFetch, authMultipartFetch, MultipartPart } from '@/api/utils.ts';
import RNBlobUtil from 'react-native-blob-util';
import { PageableInfo, SortItem } from '@/api/photographers.ts';

const communityBase = () => `${getApiBaseUrl()}/api/community`;

export const COMMUNITY_CATEGORIES = {
  'DAILY': '스냅일상',
  'TIPS': '촬영꿀팁',
  'NEWS': '스냅소식'
} as const;

export type COMMUNITY_CATEGORY_ENUM = keyof typeof COMMUNITY_CATEGORIES;
export type COMMUNITY_CATEGORY_VALUE =
  (typeof COMMUNITY_CATEGORIES)[keyof typeof COMMUNITY_CATEGORIES];

export function getCategoryEnumByValue(
  value?: COMMUNITY_CATEGORY_VALUE
): COMMUNITY_CATEGORY_ENUM | null {
  if (!value) return null;

  return (
    Object.entries(COMMUNITY_CATEGORIES).find(
      ([, v]) => v === value
    )?.[0] as COMMUNITY_CATEGORY_ENUM | undefined
  ) ?? null;
}

export const CATEGORY_KEYS = Object.keys(
  COMMUNITY_CATEGORIES,
) as COMMUNITY_CATEGORY_ENUM[];


export interface CreateCommunityPostParams {
  category: COMMUNITY_CATEGORY_ENUM;
  content: string;
  taggedUserIds: string[];
  images: UploadImageParams[];
}

export const createCommunityPost = async (data: CreateCommunityPostParams) => {
  const url = `${communityBase()}/posts`;

  const parts: MultipartPart[] = [
    // request는 JSON 파트
    {
      name: 'request',
      type: 'application/json',
      data: JSON.stringify({
        category: data.category,
        content: data.content,
        taggedUserIds: data.taggedUserIds,
      }),
    },

    // images는 file 파트들
    ...data.images.map((img) => ({
      name: 'images',
      filename: img.name ?? 'image.jpg',
      type: img.type,
      data: RNBlobUtil.wrap(img.uri.replace('file://', '')),
    })),
  ];

  const res = await authMultipartFetch(url, parts, 'POST');

  if (res.info().status < 200 || res.info().status >= 300) {
    throw new Error('게시글을 등록할 수 없습니다.');
  }
}

export interface CommunityPostImage {
  Id: number;
  urls: string;
}

export interface CommunityPost {
  id: number;
  categoryLabel: COMMUNITY_CATEGORY_VALUE;
  content: string;
  images: CommunityPostImage[];
  author: {
    userId: string;
    nickname: string;
    profileImageUrl: string;
  },
  taggedUsers: {
    userId: string;
    nickname: string;
  }[];
  isisPhotographer: boolean;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  createdAt: string;
}

export interface Sort {
  direction: 'ASC' | 'DESC' | string;
  nullHandling: string;
  ascending: boolean;
  property: string;
  ignoreCase: boolean;
}

export interface Pageable {
  pageNumber: number;
  pageSize: number;
  offset: number;
  paged: boolean;
  unpaged: boolean;
  sort: Sort[];
}

export interface CommunityPostAuthor {
  userId: string;
  nickname: string;
  profileImageUrl: string;
}

export interface GetPageable {
  page?: number;
  size?: number;
  sort?: string[];
}

export interface PageResponse<T> {
  totalPages?: number; // 어떤 응답은 totalPages/totalElements가 없어서 optional로 둠(스펙 상 혼재)
  totalElements?: number;

  pageable: PageableInfo;

  numberOfElements: number;
  size: number;
  number: number;

  sort: SortItem[];

  first: boolean;
  last: boolean;
  empty: boolean;

  content: T[];
}

export type GetCommunityPostsResponse = PageResponse<CommunityPost>;

export interface SortInfo {
  unsorted: boolean;
  sorted: boolean;
  empty: boolean;
}

export interface CommentPageableInfo {
  pageNumber: number;
  pageSize: number;
  sort: SortInfo;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

export interface CommentPageResponse<T> {
  totalPages?: number;
  totalElements?: number;

  pageable: CommentPageableInfo;

  numberOfElements: number;
  size: number;
  number: number;

  // ✅ 배열이 아니라 객체
  sort: SortInfo;

  first: boolean;
  last: boolean;
  empty: boolean;

  content: T[];
}

export interface Comment {
  id: number;
  parentId: number | null;
  content: string;

  userId: string | null;
  nickname: string;
  profileImageUrl: string | null;

  createdAt: string;
  replyCount: number;
  isDeleted: boolean;

  replies: Comment[];
}

export type GetCommentsResponse = CommentPageResponse<Comment>;

export const getCommunityPosts = async (params: GetPageable): Promise<GetCommunityPostsResponse> => {
  const qs = buildQuery(params);

  const response = await authFetch(`${communityBase()}/posts?${qs}`, {
    method: 'GET',
  });

  if (!response.ok) throw new Error('게시글을 불러올 수 없습니다.');

  return response.json();
}

export const getCommunityPost = async (postId: number): Promise<CommunityPost> => {
  const response = await authFetch(`${communityBase()}/posts/${postId}`, {
    method: 'GET',
  })

  if (!response.ok) throw new Error('게시글을 불러올 수 없습니다.');

  return response.json();
}

export const getMyPosts = async (pageable: GetPageable): Promise<GetCommunityPostsResponse> => {
  const qs = buildQuery(pageable ?? {});
  const url = qs ? `${communityBase()}/posts/me?${qs}` : `${communityBase()}/posts/me`;

  const response = await authFetch(url, { method: 'GET' });
  if (!response.ok) throw new Error('내 게시글을 불러올 수 없습니다.');
  return response.json();
};

export const deletePost = async (postId: number) => {
  const response = await authFetch(`${communityBase()}/posts/${postId}`, {
    method: 'DELETE',
  })

  if (!response.ok) throw new Error('게시글을 삭제할 수 없습니다.');
}

export interface UpdateCommunityPostParams {
  postId: number;
  request: {
    category: COMMUNITY_CATEGORY_ENUM;
    content: string;
    deletePhotoIds: number[];
    taggedUserIds: string[];
  };
  images: UploadImageParams[];
}

export const updatePost = async (params: UpdateCommunityPostParams) => {
  const url = `${communityBase()}/posts/${params.postId}`;

  const parts: MultipartPart[] = [
    // request는 JSON 파트
    {
      name: 'request',
      type: 'application/json',
      data: JSON.stringify({
        category: params.request.category,
        content: params.request.content,
        deletePhotoIds: params.request.deletePhotoIds,
        taggedUserIds: params.request.taggedUserIds,
      }),
    },

    // images는 file 파트들
    ...params.images.map((img) => ({
      name: 'images',
      filename: img.name ?? 'image.jpg',
      type: img.type,
      data: RNBlobUtil.wrap(img.uri.replace('file://', '')),
    })),
  ];

  const res = await authMultipartFetch(url, parts, 'PUT');

  if (res.info().status < 200 || res.info().status >= 300) {
    throw new Error('게시글을 수정할 수 없습니다.');
  }
}

export const getComments = async (postId: number, pageable: GetPageable): Promise<GetCommentsResponse> => {
  // Default sort by createdAt ascending (oldest first) for consistent ordering
  const params = {
    ...pageable,
    sort: pageable.sort ?? ['createdAt,asc'],
  };
  const qs = buildQuery(params);

  const response = await authFetch(`${communityBase()}/posts/${postId}/comments?${qs}`, {
    method: 'GET',
  })

  if (!response.ok) throw new Error('댓글을 불러올 수 없습니다.');

  return response.json();
}

export const createComment = async (postId: number, content: string, parentId: number | null) => {
  const response = await authFetch(`${communityBase()}/posts/${postId}/comments`, {
    method: 'POST',
    json: {
      content,
      parentId,
    }
  });

  if (!response.ok) throw new Error('댓글을 작성할 수 없습니다.');
}

export const updateComment = async (commentId: number, content: string) => {
  const response = await authFetch(`${communityBase()}/comments/${commentId}`, {
    method: 'PATCH',
    json: {
      content,
    }
  });

  if (!response.ok) throw new Error('댓글을 수정할 수 없습니다.');
}

export const deleteComment = async (commentId: number) => {
  const response = await authFetch(`${communityBase()}/comments/${commentId}`, {
    method: 'DELETE',
  })

  if (!response.ok) throw new Error('댓글을 삭제할 수 없습니다.');
}

export const toggleLike = async (postId: number) => {
  const response = await authFetch(`${communityBase()}/posts/${postId}/like`, {
    method: 'POST',
  });

  if (!response.ok) throw new Error('좋아요를 변경할 수 없습니다.');
}
