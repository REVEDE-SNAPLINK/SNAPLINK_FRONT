import type { ChatRoomItem, ChatMessage } from '@/api/chat';
import { mockPhotographers } from './mockPhotographers';

/**
 * 개발 모드용 더미 채팅 데이터
 */

// 채팅방 목록 (작가와 연결)
let mockChatRooms: ChatRoomItem[] = [
  {
    roomId: 1,
    opponentId: '1',
    opponentNickname: '김작가',
    unreadCount: 2,
    lastMessageTime: '2025-01-20T15:30:00Z',
  },
  {
    roomId: 2,
    opponentId: '2',
    opponentNickname: '이사진',
    unreadCount: 0,
    lastMessageTime: '2025-01-19T10:00:00Z',
  },
  {
    roomId: 3,
    opponentId: '3',
    opponentNickname: '박스냅',
    unreadCount: 5,
    lastMessageTime: '2025-01-18T14:20:00Z',
  },
].map((room) => {
  // 작가 데이터에서 프로필 이미지 가져오기
  const photographer = mockPhotographers.find((p) => p.id === room.opponentId);
  return {
    ...room,
    opponentProfileImageUrl: photographer?.profileImageUrl,
  };
}) as ChatRoomItem[];

// 채팅 메시지들 (roomId별로 관리)
let mockChatMessages: Record<number, ChatMessage[]> = {
  1: [
    {
      messageId: 1,
      roomId: 1,
      senderId: '1',
      senderNickname: '김작가',
      content: '안녕하세요! 촬영 관련 문의 주셔서 감사합니다.',
      type: 'TEXT',
      sentAt: '2025-01-20T14:00:00Z',
    },
    {
      messageId: 2,
      roomId: 1,
      senderId: 'me',
      senderNickname: '나',
      content: '2월 1일 오후 2시에 프로필 촬영 가능할까요?',
      type: 'TEXT',
      sentAt: '2025-01-20T14:05:00Z',
    },
    {
      messageId: 3,
      roomId: 1,
      senderId: '1',
      senderNickname: '김작가',
      content: '네 가능합니다! 장소는 어디로 생각하고 계신가요?',
      type: 'TEXT',
      sentAt: '2025-01-20T14:10:00Z',
    },
    {
      messageId: 4,
      roomId: 1,
      senderId: 'me',
      senderNickname: '나',
      content: '강남역 근처 스튜디오를 생각하고 있어요',
      type: 'TEXT',
      sentAt: '2025-01-20T15:00:00Z',
    },
    {
      messageId: 5,
      roomId: 1,
      senderId: '1',
      senderNickname: '김작가',
      content: '좋습니다! 제가 자주 가는 스튜디오가 있는데 괜찮으시면 예약해드릴게요.',
      type: 'TEXT',
      sentAt: '2025-01-20T15:30:00Z',
    },
  ],
  2: [
    {
      messageId: 6,
      roomId: 2,
      senderId: '2',
      senderNickname: '이사진',
      content: '웨딩 촬영 포트폴리오 보내드립니다.',
      type: 'TEXT',
      sentAt: '2025-01-19T09:00:00Z',
    },
    {
      messageId: 7,
      roomId: 2,
      senderId: '2',
      senderNickname: '이사진',
      content: 'https://picsum.photos/800/600?random=wedding1',
      type: 'IMAGE',
      sentAt: '2025-01-19T09:05:00Z',
    },
    {
      messageId: 8,
      roomId: 2,
      senderId: 'me',
      senderNickname: '나',
      content: '포트폴리오 잘 봤습니다! 너무 예뻐요',
      type: 'TEXT',
      sentAt: '2025-01-19T10:00:00Z',
    },
  ],
  3: [
    {
      messageId: 9,
      roomId: 3,
      senderId: 'me',
      senderNickname: '나',
      content: '반려동물 촬영 문의드립니다',
      type: 'TEXT',
      sentAt: '2025-01-18T13:00:00Z',
    },
    {
      messageId: 10,
      roomId: 3,
      senderId: '3',
      senderNickname: '박스냅',
      content: '안녕하세요! 어떤 반려동물이신가요?',
      type: 'TEXT',
      sentAt: '2025-01-18T13:30:00Z',
    },
    {
      messageId: 11,
      roomId: 3,
      senderId: 'me',
      senderNickname: '나',
      content: '강아지 2마리입니다',
      type: 'TEXT',
      sentAt: '2025-01-18T14:00:00Z',
    },
    {
      messageId: 12,
      roomId: 3,
      senderId: '3',
      senderNickname: '박스냅',
      content: '귀여우시겠어요 ㅎㅎ 실외 촬영 원하시나요?',
      type: 'TEXT',
      sentAt: '2025-01-18T14:10:00Z',
    },
    {
      messageId: 13,
      roomId: 3,
      senderId: 'me',
      senderNickname: '나',
      content: '네! 날씨 좋은 날 한강공원에서 하고 싶어요',
      type: 'TEXT',
      sentAt: '2025-01-18T14:20:00Z',
    },
  ],
};

/**
 * 채팅방 목록 조회
 */
export const getMockChatRooms = (): ChatRoomItem[] => {
  return mockChatRooms;
};

/**
 * 채팅 메시지 조회 (페이지네이션)
 */
export const getMockChatMessages = (
  roomId: number,
  page: number = 0,
  size: number = 20,
): ChatMessage[] => {
  const messages = mockChatMessages[roomId] || [];
  const startIndex = page * size;
  const endIndex = startIndex + size;

  // 최신 메시지부터 반환 (역순)
  return messages.slice().reverse().slice(startIndex, endIndex);
};

/**
 * 채팅방 생성 또는 조회
 */
export const createOrGetMockChatRoom = (receiverId: string): { roomId: number } => {
  // 기존 채팅방 찾기
  const existingRoom = mockChatRooms.find((room) => room.opponentId === receiverId);

  if (existingRoom) {
    return { roomId: existingRoom.roomId };
  }

  // 새 채팅방 생성
  const photographer = mockPhotographers.find((p) => p.id === receiverId);
  const newRoomId = Math.max(...mockChatRooms.map((r) => r.roomId), 0) + 1;

  const newRoom: ChatRoomItem = {
    roomId: newRoomId,
    opponentId: receiverId,
    opponentNickname: photographer?.nickname || `사용자${receiverId}`,
    unreadCount: 0,
    lastMessageTime: new Date().toISOString(),
  };

  mockChatRooms.unshift(newRoom);
  mockChatMessages[newRoomId] = [];

  return { roomId: newRoomId };
};

/**
 * 메시지 전송
 */
export const sendMockChatMessage = (
  roomId: number,
  content: string,
  type: 'TEXT' | 'IMAGE' = 'TEXT',
): ChatMessage => {
  const messages = mockChatMessages[roomId] || [];
  const newMessageId = Math.max(...Object.values(mockChatMessages).flat().map((m) => m.messageId), 0) + 1;

  const newMessage: ChatMessage = {
    messageId: newMessageId,
    roomId,
    senderId: 'me',
    senderNickname: '나',
    content,
    type,
    sentAt: new Date().toISOString(),
  };

  messages.push(newMessage);
  mockChatMessages[roomId] = messages;

  // 채팅방 목록의 lastMessageTime 업데이트
  const room = mockChatRooms.find((r) => r.roomId === roomId);
  if (room) {
    room.lastMessageTime = newMessage.sentAt;
  }

  return newMessage;
};

/**
 * 파일 업로드 (mock URL 반환)
 */
export const uploadMockChatFile = (roomId: number): string => {
  return `https://picsum.photos/800/600?random=${Date.now()}`;
};

/**
 * 읽음 처리
 */
export const markMockChatRoomAsRead = (roomId: number): boolean => {
  const room = mockChatRooms.find((r) => r.roomId === roomId);
  if (room) {
    room.unreadCount = 0;
    return true;
  }
  return false;
};
