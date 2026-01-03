import { Client, IMessage, ReconnectionTimeMode, StompSubscription, Versions } from '@stomp/stompjs';
import type { ChatMessage, ChatMessageType } from '@/api/chat';
import { useAuthStore } from '@/store/authStore';

const WS_URL = 'wss://api.snaplink.run/ws/chat';

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
    if (this.client && this.connected) {
      console.log('[ChatStompClient] Already connected');
      return;
    }

    // ✅ 이미 연결 시도 중인 경우: 그 Promise를 await
    if (this.connectPromise) {
      console.log('[ChatStompClient] Connection already in progress, waiting...');
      await this.connectPromise;
      return;
    }

    const { getAccessToken } = useAuthStore.getState();

    // ✅ STOMP connectHeaders에 전달할 토큰 가져오기
    console.log('[ChatStompClient] Getting access token for STOMP headers...');
    const accessToken = await getAccessToken();
    console.log('[ChatStompClient] Access token obtained:', accessToken ? 'Yes' : 'No');

    console.log('[ChatStompClient] Creating new STOMP client...');
    console.log('[ChatStompClient] WebSocket URL:', WS_URL);
    this.client = new Client({
      brokerURL: WS_URL,
      connectHeaders: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      connectionTimeout: 5000,

      // ✅ 수정 2: React Native 호환성 개선
      forceBinaryWSFrames: true,      // Android에서 필수
      stompVersions: new Versions([Versions.V1_2]),

      // ✅ 수정 3: 빠른 감지 및 재시도
      reconnectDelay: 2000,           // 실패 후 2초 후 재시도
      maxReconnectDelay: 15000,
      heartbeatIncoming: 5000,        // 하트비트 감소
      heartbeatOutgoing: 5000,
      appendMissingNULLonIncoming: true,

      reconnectTimeMode: ReconnectionTimeMode.EXPONENTIAL,
      debug: (str) => {
        console.log('[STOMP Debug]', str);
      },

      beforeConnect: async () => {
        console.log('[ChatStompClient] beforeConnect called');
      },

      onConnect: (frame) => {
        console.log('[ChatStompClient] onConnect: Connected successfully', frame);
        this.connected = true;
        console.log('[ChatStompClient] onConnect: Set connected = true');
        // 연결 전에 쌓인 publish flush
        console.log('[ChatStompClient] onConnect: Flushing', this.pendingPublishes.length, 'pending publishes');
        this.pendingPublishes.forEach((fn) => fn());
        this.pendingPublishes = [];
      },

      onDisconnect: () => {
        console.log('[ChatStompClient] onDisconnect: Disconnected');
        this.connected = false;
      },
      onWebSocketClose: (event) => {
        console.log('[ChatStompClient] onWebSocketClose:', event);
        this.connected = false;
      },

      onStompError: (frame) => {
        console.error('[ChatStompClient] onStompError:', frame);
        onError?.(frame);
      },
      onWebSocketError: (event) => {
        console.error('[ChatStompClient] WebSocket error details:', {
          message: event.message,
          code: event.code,
          reason: event.reason,
        });
        onError?.(event);
      },
    });

    // ✅ connect()는 "연결 완료"까지 await 하도록 Promise로 감싼다
    this.connectPromise = new Promise<void>((resolve, reject) => {
      const prevOnConnect = this.client!.onConnect;
      const prevOnStompError = this.client!.onStompError;
      const prevOnWebSocketError = this.client!.onWebSocketError;

      this.client!.onConnect = (frame) => {
        console.log('[ChatStompClient] connectPromise: onConnect callback triggered');
        // 먼저 원래 onConnect 호출 (여기서 this.connected = true 설정됨)
        prevOnConnect?.(frame as any);
        console.log('[ChatStompClient] connectPromise: After prevOnConnect, connected =', this.connected);
        // connected 플래그가 설정되었으므로 resolve
        console.log('[ChatStompClient] connectPromise: Resolving promise');
        resolve();
      };

      this.client!.onStompError = (frame) => {
        console.log('[ChatStompClient] connectPromise: STOMP error, rejecting');
        prevOnStompError?.(frame);
        reject(frame);
      };

      this.client!.onWebSocketError = (event) => {
        console.log('[ChatStompClient] connectPromise: WebSocket error, rejecting');
        prevOnWebSocketError?.(event);
        reject(event);
      };

      console.log('[ChatStompClient] Activating STOMP client...');
      this.client!.activate();
    });

    try {
      await this.connectPromise;
      console.log('[ChatStompClient] connect() completed, connected =', this.connected);
    } finally {
      this.connectPromise = null;
    }
  }

  async disconnect() {
    console.log('[ChatStompClient] Disconnecting...');
    // 구독 해제
    this.subscriptions.forEach((sub, key) => {
      console.log('[ChatStompClient] Unsubscribing from:', key);
      sub.unsubscribe();
    });
    this.subscriptions.clear();

    this.pendingPublishes = [];
    this.connected = false;

    if (this.client) {
      await this.client.deactivate();
      this.client = null;
      console.log('[ChatStompClient] Disconnected successfully');
    }
  }

  /** 채팅방 구독 (/topic/chat/room/{roomId}) */
  subscribeRoom(roomId: number, onMessage: OnMessage) {
    if (!this.client || !this.connected) {
      throw new Error('STOMP client not connected');
    }

    const key = `room:${roomId}`;
    if (this.subscriptions.has(key)) {
      console.log('[ChatStompClient] Already subscribed to room:', roomId);
      return;
    }

    console.log('[ChatStompClient] Subscribing to room:', roomId);
    const sub = this.client.subscribe(`/topic/chat/room/${roomId}`, (frame: IMessage) => {
      console.log('[ChatStompClient] Received frame:', frame.body);
      const payload = JSON.parse(frame.body) as ChatMessage;
      console.log('[ChatStompClient] Parsed message:', payload);
      onMessage(payload);
    });

    this.subscriptions.set(key, sub);
    console.log('[ChatStompClient] Subscribed to room:', roomId);
  }

  /** 입장: /app/chat/enter (payload: roomId number) */
  enter(roomId: number) {
    console.log('[ChatStompClient] Entering room:', roomId);
    this.safePublish(() => {
      this.client!.publish({
        destination: '/app/chat/enter',
        body: JSON.stringify(roomId),
      });
      console.log('[ChatStompClient] Enter message published');
    });
  }

  /** 퇴장: /app/chat/leave */
  leave(roomId: number) {
    console.log('[ChatStompClient] Leaving room:', roomId);
    this.safePublish(() => {
      this.client!.publish({
        destination: '/app/chat/leave',
        body: JSON.stringify(roomId),
      });
      console.log('[ChatStompClient] Leave message published');
    });
  }

  /** 메시지 전송: /app/chat/message */
  sendMessage(req: ChatMessageRequest) {
    console.log('[ChatStompClient] Sending message:', JSON.stringify(req, null, 2));
    this.safePublish(() => {
      this.client!.publish({
        destination: '/app/chat/message',
        body: JSON.stringify(req),
      });
      console.log('[ChatStompClient] Message published to /app/chat/message');
    });
  }

  /** 연결 전이면 큐잉, 연결 후면 바로 publish */
  private safePublish(fn: () => void) {
    if (!this.client) {
      console.error('[ChatStompClient] safePublish: Client not initialized');
      throw new Error('STOMP client not initialized');
    }

    if (!this.connected) {
      console.log('[ChatStompClient] safePublish: Not connected, queueing publish');
      this.pendingPublishes.push(fn);
      return;
    }

    console.log('[ChatStompClient] safePublish: Publishing immediately');
    fn();
  }
}