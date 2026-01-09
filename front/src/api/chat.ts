import { API_BASE_URL } from '@/config/api';
import { authFetch, authMultipartFetch, MultipartPart, toBlobPath } from '@/api/utils';
import { buildQuery } from '@/utils/format';
import RNBlobUtil from 'react-native-blob-util';

const CHAT_BASE = `${API_BASE_URL}/api/chat`;

/** 채팅방 리스트 아이템 */
export interface ChatRoomItem {
  roomId: number;
  opponentId: string;
  opponentNickname: string;
  profileImageURI?: string;
  unreadCount: number;
  lastMessageTime: string; // ISO
  lastMessage: string;
}

/** 메시지 타입 */
export type ChatMessageType = 'TEXT' | 'IMAGE' | 'FILE';

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
  if (!response.ok) throw new Error('채팅 목록을 불러올 수 없습니다.');
  return response.json();
};

/**
 * GET /api/chat/rooms/{roomId}/messages
 * 특정 채팅방 정보 조회
 */
export const getChatRoom = async (roomId: number): Promise<ChatRoomItem> => {
  const response = await authFetch(`${CHAT_BASE}/rooms/${roomId}/messages`, { method: 'GET' });
  if (!response.ok) throw new Error('채팅방 정보를 불러올 수 없습니다.');
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
  if (!response.ok) throw new Error('채팅 메시지를 불러올 수 없습니다.');
  return response.json();
};

/** 채팅방 생성/조회 요청 */
export interface CreateOrGetRoomRequest {
  receiverId: string;
}

/**
 * POST /api/chat/rooms
 * 1:1 채팅방 생성 또는 조회
 */
export const createOrGetChatRoom = async (
  body: CreateOrGetRoomRequest,
): Promise<number> => {
  const response = await authFetch(`${CHAT_BASE}/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error('채팅방을 생성할 수 없습니다.');
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
  const path = await toBlobPath(params.file.uri);

  // 디버깅/안정성: 실제 존재 확인(문Suggest 문제가 있으면 여기서 바로 잡힘)
  await RNBlobUtil.fs.stat(path);

  const parts: MultipartPart[] = [
    {
      name: 'file',
      filename: params.file.name ?? 'file',
      type: params.file.type ?? 'application/octet-stream',
      data: RNBlobUtil.wrap(path),
    },
  ];

  const response = await authMultipartFetch(
    `${CHAT_BASE}/rooms/${params.roomId}/upload`,
    parts,
    'POST',
  );

  if (response.info().status < 200 || response.info().status >= 300) {
    throw new Error('파일을 업로드할 수 없습니다.');
  }

  // 서버가 plain text URL 또는 JSON string으로 반환할 수 있음
  try {
    return JSON.parse(response.data);
  } catch {
    console.log('[uploadChatFile] Response is plain text URL:', response.data);
    return response.data;
  }
};

export const unblockChatUser = async (
  targetId: string,
) => {
  const response = await authFetch(`${CHAT_BASE}/block/${targetId}`, {
    method: 'DELETE',
  });

  if (!response.ok) throw new Error('차단을 해제할 수 없습니다.');
}

export const leaveChatRoom = async (
  roomId: number,
)=> {
  const response = await authFetch(`${CHAT_BASE}/rooms/${roomId}`, {
    method: 'DELETE',
  })

  if (!response.ok) throw new Error('채팅방을 나갈 수 없습니다.');
};

export const blockChatUser = async (
  targetId: string,
)=> {
  const response = await authFetch(`${CHAT_BASE}/block/${targetId}`, {
    method: 'POST',
  });

  if (!response.ok) throw new Error('사용자를 차단할 수 없습니다.');
}

export interface GetChatRoomDetail {
  roomId: number;
  opponentId: string;
  opponentNickname: string;
  opponentProfileImage: string;
  blocked: boolean;
}

export const getChatRoomDetail = async (
  roomId: number,
): Promise<GetChatRoomDetail> => {
  const response = await authFetch(`${CHAT_BASE}/detail/${roomId}`, {
    method: 'GET',
  });

  if (!response.ok) throw new Error('채팅방 정보를 불러올 수 없습니다.');

  return response.json();
}