// src/ws/chatClient.ts
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import type { ChatMessage, ChatMessageType } from '@/api/chat';
import { useAuthStore } from '@/store/authStore';

const WS_URL = 'wss://api.snaplink.run/ws';

export interface ChatMessageRequest {
  content: string;
  roomId: number;
  type?: ChatMessageType; // 'TEXT' | 'IMAGE'
}

type OnMessage = (msg: ChatMessage) => void;

export class ChatStompClient {
  private client: Client | null = null;
  private connected = false;

  private subscriptions = new Map<string, StompSubscription>();
  private connectPromise: Promise<void> | null = null;

  // 연결 전 send를 허용하고 싶으면 큐잉(원치 않으면 제거)
  private pendingPublishes: Array<() => void> = [];

  isConnected() {
    return this.connected;
  }

  async connect(onError?: (error: any) => void) {
    // ✅ 이미 연결된 경우
    if (this.client && this.connected) return;

    // ✅ 이미 연결 시도 중인 경우: 그 Promise를 await
    if (this.connectPromise) {
      await this.connectPromise;
      return;
    }

    const { getAccessToken } = useAuthStore.getState();

    this.client = new Client({
      // ✅ RN에서는 brokerURL보다 webSocketFactory가 더 안전한 경우가 많음
      webSocketFactory: () => new WebSocket(WS_URL),
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      // ✅ CONNECT 직전에 토큰 세팅(만료/갱신 대응)
      beforeConnect: async () => {
        const t = await getAccessToken();
        this.client!.connectHeaders = t ? { Authorization: `Bearer ${t}` } : {};
      },

      onConnect: () => {
        this.connected = true;
        // 연결 전에 쌓인 publish flush
        this.pendingPublishes.forEach((fn) => fn());
        this.pendingPublishes = [];
      },

      onDisconnect: () => {
        this.connected = false;
      },
      onWebSocketClose: () => {
        this.connected = false;
      },

      onStompError: (frame) => {
        onError?.(frame);
      },
      onWebSocketError: (event) => {
        onError?.(event);
      },
    });

    // ✅ connect()는 “연결 완료”까지 await 하도록 Promise로 감싼다
    this.connectPromise = new Promise<void>((resolve, reject) => {
      const prevOnConnect = this.client!.onConnect;
      const prevOnStompError = this.client!.onStompError;
      const prevOnWebSocketError = this.client!.onWebSocketError;

      this.client!.onConnect = (frame) => {
        prevOnConnect?.(frame as any);
        resolve();
      };

      this.client!.onStompError = (frame) => {
        prevOnStompError?.(frame);
        reject(frame);
      };

      this.client!.onWebSocketError = (event) => {
        prevOnWebSocketError?.(event);
        reject(event);
      };

      this.client!.activate();
    });

    try {
      await this.connectPromise;
    } finally {
      this.connectPromise = null;
    }
  }

  async disconnect() {
    // 구독 해제
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions.clear();

    this.pendingPublishes = [];
    this.connected = false;

    if (this.client) {
      await this.client.deactivate();
      this.client = null;
    }
  }

  /** 채팅방 구독 (/topic/chat/room/{roomId}) */
  subscribeRoom(roomId: number, onMessage: OnMessage) {
    if (!this.client || !this.connected) {
      throw new Error('STOMP client not connected');
    }

    const key = `room:${roomId}`;
    if (this.subscriptions.has(key)) return;

    const sub = this.client.subscribe(`/topic/chat/room/${roomId}`, (frame: IMessage) => {
      const payload = JSON.parse(frame.body) as ChatMessage;
      onMessage(payload);
    });

    this.subscriptions.set(key, sub);
  }

  /** 입장: /app/chat/enter (payload: roomId number) */
  enter(roomId: number) {
    this.safePublish(() => {
      this.client!.publish({
        destination: '/app/chat/enter',
        body: JSON.stringify(roomId),
      });
    });
  }

  /** 퇴장: /app/chat/leave */
  leave(roomId: number) {
    this.safePublish(() => {
      this.client!.publish({
        destination: '/app/chat/leave',
        body: JSON.stringify(roomId),
      });
    });
  }

  /** 메시지 전송: /app/chat/message */
  sendMessage(req: ChatMessageRequest) {
    this.safePublish(() => {
      this.client!.publish({
        destination: '/app/chat/message',
        body: JSON.stringify(req),
      });
    });
  }

  /** 연결 전이면 큐잉, 연결 후면 바로 publish */
  private safePublish(fn: () => void) {
    if (!this.client) throw new Error('STOMP client not initialized');

    if (!this.connected) {
      // ✅ 원하면 “연결 안되면 실패”로 바꿔도 됨:
      // throw new Error('There is no underlying STOMP connection');
      this.pendingPublishes.push(fn);
      return;
    }

    fn();
  }
}