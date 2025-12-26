import { API_BASE_URL } from '@/config/api';
import { authFetch, authMultipartFetch, MultipartPart } from '@/api/utils';
import { buildQuery } from '@/utils/format';
import RNBlobUtil from 'react-native-blob-util';

const CHAT_BASE = `${API_BASE_URL}/api/chat`;

/** 채팅방 리스트 아이템 */
export interface ChatRoomItem {
  roomId: number;
  opponentId: string;
  opponentNickname: string;
  opponentProfileImageUrl?: string;
  unreadCount: number;
  lastMessageTime: string; // ISO
}

/** 메시지 타입 */
export type ChatMessageType = 'TEXT' | 'IMAGE';

/** 메시지 아이템 */
export interface ChatMessage {
  messageId: number;
  roomId: number;
  senderId: string;
  senderNickname: string;
  content: string; // text or file url
  type: ChatMessageType;
  sentAt: string; // ISO
}

/** 메시지 조회 pageable */
export interface GetChatMessagesParams {
  page?: number; // 0-base
  size?: number; // default 20
  sort?: string[]; // swagger에 있지만 응답이 array라 실제 적용 여부 불명
}

/**
 * GET /api/chat/rooms
 * 참여중인 채팅방 목록 조회
 */
export const getChatRooms = async (): Promise<ChatRoomItem[]> => {
  const response = await authFetch(`${CHAT_BASE}/rooms`, { method: 'GET' });
  if (!response.ok) throw new Error(`Failed to get chat rooms ${response.status}`);
  return response.json();
};

/**
 * GET /api/chat/rooms/{roomId}/messages
 * 특정 채팅방 메시지 기록 조회 (pagination)
 * - 호출 시 해당 방 메시지는 읽음 처리됨
 * response: ChatMessage[]
 */
export const getChatMessages = async (
  roomId: number,
  params: GetChatMessagesParams,
): Promise<ChatMessage[]> => {
  const qs = buildQuery(params);
  const url = qs ? `${CHAT_BASE}/rooms/${roomId}/messages?${qs}` : `${CHAT_BASE}/rooms/${roomId}/messages`;

  const response = await authFetch(url, { method: 'GET' });
  if (!response.ok) throw new Error(`Failed to get chat messages ${response.status}`);
  return response.json();
};

/** 채팅방 생성/조회 요청 */
export interface CreateOrGetRoomRequest {
  receiverId: string;
}

/** 채팅방 생성/조회 응답 (스웨거에 roomId 반환이라고 했으니 최소로) */
export interface CreateOrGetRoomResponse {
  roomId: number;
}

/**
 * POST /api/chat/rooms
 * 1:1 채팅방 생성 또는 조회
 */
export const createOrGetChatRoom = async (
  body: CreateOrGetRoomRequest,
): Promise<CreateOrGetRoomResponse> => {
  const response = await authFetch(`${CHAT_BASE}/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Failed to create/get room ${response.status}`);
  return response.json();
};

/** 파일 업로드 파라미터 */
export interface UploadChatFileParams {
  roomId: number;
  file: { uri: string; name: string; type: string };
}

/**
 * POST /api/chat/rooms/{roomId}/upload
 * 파일 업로드 후 S3 URL(string) 반환
 * multipart/form-data: file
 */
export const uploadChatFile = async (
  params: UploadChatFileParams,
): Promise<string> => {
  const parts: MultipartPart[] = [
    {
      name: 'file',
      filename: params.file.name,
      type: params.file.type,
      data: RNBlobUtil.wrap(params.file.uri.replace('file://', '')),
    },
  ];

  const response = await authMultipartFetch(
    `${CHAT_BASE}/rooms/${params.roomId}/upload`,
    parts,
    'POST',
  );

  if (response.info().status < 200 || response.info().status >= 300) {
    throw new Error(`Failed to upload chat file ${response.info().status}`);
  }

  // 응답 데이터는 JSON string으로 반환됨
  return JSON.parse(response.data);
};