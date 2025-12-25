// src/ws/chatClient.ts
import { Client, IMessage } from '@stomp/stompjs';
import type { ChatMessage, ChatMessageType } from '@/api/chat';

const WS_URL = 'wss://api.snaplink.run/ws'; // swagger host: api.snaplink.run/ws

export interface ChatMessageRequest {
  content: string;
  roomId: number;
  type?: ChatMessageType; // 'TEXT' | 'IMAGE'
}

type OnMessage = (msg: ChatMessage) => void;

export class ChatStompClient {
  private client: Client | null = null;
  private subscriptions = new Map<string, () => void>();

  connect(accessToken: string) {
    if (this.client?.active) return;

    this.client = new Client({
      brokerURL: WS_URL,
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    this.client.activate();
  }

  disconnect() {
    this.subscriptions.forEach((unsub) => unsub());
    this.subscriptions.clear();
    this.client?.deactivate();
    this.client = null;
  }

  /** 채팅방 구독 (/topic/chat/room/{roomId}) */
  subscribeRoom(roomId: number, onMessage: OnMessage) {
    if (!this.client) throw new Error('STOMP client not connected');

    const key = `room:${roomId}`;
    if (this.subscriptions.has(key)) return;

    const sub = this.client.subscribe(`/topic/chat/room/${roomId}`, (frame: IMessage) => {
      const payload = JSON.parse(frame.body) as ChatMessage;
      onMessage(payload);
    });

    this.subscriptions.set(key, () => sub.unsubscribe());
  }

  /** 입장: /app/chat/enter (payload: roomId number) */
  enter(roomId: number) {
    if (!this.client) throw new Error('STOMP client not connected');
    this.client.publish({
      destination: '/app/chat/enter',
      body: JSON.stringify(roomId),
    });
  }

  /** 퇴장: /app/chat/leave */
  leave(roomId: number) {
    if (!this.client) throw new Error('STOMP client not connected');
    this.client.publish({
      destination: '/app/chat/leave',
      body: JSON.stringify(roomId),
    });
  }

  /** 메시지 전송: /app/chat/message */
  sendMessage(req: ChatMessageRequest) {
    if (!this.client) throw new Error('STOMP client not connected');
    this.client.publish({
      destination: '/app/chat/message',
      body: JSON.stringify(req),
    });
  }
}