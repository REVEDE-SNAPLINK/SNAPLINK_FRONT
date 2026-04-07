/**
 * Firebase Analytics / Crashlytics 공통 트래킹 유틸리티
 *
 * 모든 analytics 이벤트 로깅을 안전하게 수행하기 위한 래퍼.
 * - try-catch로 감싸 analytics 오류가 앱 크래시로 이어지지 않도록 보호
 * - 공통 파라미터 자동 주입
 * - impression dedupe 지원
 * - Crashlytics 컨텍스트 관리
 */
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ──────────────────────────────────────────── 
// 0) Analytics Global State & Enums
// ────────────────────────────────────────────

let globalUserId: string | undefined = undefined;
let globalUserType: 'user' | 'photographer' | 'guest' = 'guest';
// 현재 화면, 진입 출처, 직전 액션 유지
let currentScreen: string = 'Unknown';
let currentEntrySource: string = 'direct';
let currentSource: string = 'direct';
let sessionTrackingCode: string | undefined = undefined;
const EVENT_VERSION = 1;

export const setAnalyticsUserContext = (userId?: string, userType?: 'user' | 'photographer' | 'guest') => {
    if (userId !== undefined) {
        globalUserId = userId;
        analytics().setUserId(userId || null).catch(() => {});
    }
    if (userType !== undefined) {
        globalUserType = userType;
        analytics().setUserProperty('user_type', userType).catch(() => {});
    }
};

export const setAnalyticsFlowContext = (screen?: string, source?: string, entrySource?: string, trackingCode?: string) => {
    if (screen) currentScreen = screen;
    if (source) currentSource = source;
    if (entrySource) currentEntrySource = entrySource;
    if (trackingCode !== undefined) sessionTrackingCode = trackingCode;
};

export type AnalyticsUserType = 'user' | 'photographer' | 'guest';
export type AnalyticsPlatform = 'ios' | 'android';
export type LinkType = 'photographer_profile' | 'portfolio_post' | 'community_post' | 'booking' | 'review' | 'chat' | 'unknown';
export type SourceChannel = 'system_share' | 'kakao_share' | 'instagram' | 'external' | 'internal' | 'unknown';
export type FeedType = 'home_latest' | 'home_recommend' | 'search_result' | 'photographer_profile';
export type CancelReasonCategory = 'schedule_conflict' | 'changed_mind' | 'price' | 'no_response' | 'other';
export type RejectReasonCategory = 'schedule_conflict' | 'outside_location' | 'concept_mismatch' | 'other';
export type FailReason = 'invalid_link' | 'not_found' | 'auth_required' | 'parse_error' | 'network_error' | 'unknown';
export type EntityType = 'photographer' | 'portfolio_post' | 'community_post' | 'booking' | 'room' | 'review';
export type ActionType = 'click' | 'submit' | 'cancel' | 'delete' | 'edit';


// ────────────────────────────────────────────
// 1) Safe analytics event logger & Common Params Injector
// ────────────────────────────────────────────

const injectCommonParams = (params?: Record<string, any>) => {
    return {
        ...params,
        user_id: params?.user_id ?? globalUserId,
        user_type: params?.user_type ?? globalUserType,
        platform: params?.platform ?? Platform.OS,
        screen: params?.screen ?? currentScreen,
        tracking_code: params?.tracking_code ?? sessionTrackingCode,
        event_version: params?.event_version ?? EVENT_VERSION,
    };
};

/**
 * analytics().logEvent 를 안전하게 호출합니다.
 * 에러가 발생해도 앱이 크래시하지 않고 console.warn 으로만 남깁니다.
 */
export const safeLogEvent = (
    eventName: string,
    params?: Record<string, any>,
): void => {
    // Fire-and-forget 방식으로 비동기 호출 (앱 멈춤 방지)
    Promise.resolve().then(async () => {
        try {
            const enhancedParams = injectCommonParams(params);
            await analytics().logEvent(eventName, enhancedParams);
        } catch (e) {
            console.warn(`[Analytics] Failed to log event "${eventName}":`, e);
        }
    });
};

// ────────────────────────────────────────────
// 2) Crashlytics safe helpers
// ────────────────────────────────────────────

/**
 * Crashlytics에 안전하게 attribute를 설정합니다.
 */
export const safeSetCrashlyticsAttribute = (key: string, value: string): void => {
    try {
        crashlytics().setAttribute(key, value);
    } catch (e) {
        console.warn(`[Crashlytics] Failed to set attribute "${key}":`, e);
    }
};

/**
 * Crashlytics에 안전하게 log를 남깁니다.
 */
export const safeCrashlyticsLog = (message: string): void => {
    try {
        crashlytics().log(message);
    } catch (e) {
        console.warn(`[Crashlytics] Failed to log:`, e);
    }
};

type CrashlyticsFlow = 'deep_link' | 'booking' | 'chat' | 'upload' | 'community' | 'browse' | 'auth';

/**
 * 현재 화면 및 컨텍스트를 Crashlytics attribute로 설정합니다.
 */
export const setCrashlyticsContext = (context: {
    screen?: string;
    flow?: CrashlyticsFlow;
    entityId?: string;
    entityType?: EntityType;
    bookingId?: string;
    roomId?: string;
    photographerId?: string;
    postId?: string;
}): void => {
    try {
        if (context.screen) crashlytics().setAttribute('currentScreen', context.screen);
        if (context.flow) crashlytics().setAttribute('currentFlow', context.flow);
        if (context.entityId) crashlytics().setAttribute('entityId', String(context.entityId));
        if (context.entityType) crashlytics().setAttribute('entityType', context.entityType);
        if (context.bookingId) crashlytics().setAttribute('booking_id', String(context.bookingId));
        if (context.roomId) crashlytics().setAttribute('room_id', String(context.roomId));
        if (context.photographerId) crashlytics().setAttribute('photographer_id', String(context.photographerId));
        if (context.postId) crashlytics().setAttribute('post_id', String(context.postId));
    } catch (e) {
        console.warn('[Crashlytics] Failed to set context:', e);
    }
};

export const safeCrashlyticsRecordError = (error: Error, logMessage?: string) => {
    try {
        if (logMessage) crashlytics().log(`ERROR CONTEXT: ${logMessage}`);
        crashlytics().recordError(error);
    } catch (e) {
        console.warn('[Crashlytics] Failed to record error:', e);
    }
};


// ────────────────────────────────────────────
// 3) Dedupe States (In-memory Cache)
// ────────────────────────────────────────────

const IMPRESSION_DEDUPE_INTERVAL_MS = 30_000;
const MAX_DEDUPE_CACHE_SIZE = 1000; // soft limit
const impressionTimestamps = new Map<string, number>();

/**
 * 인메모리 캐시 누수 방지를 위한 만료된 Dedupe Key 정리 함수
 */
const purgeDedupeCache = () => {
    const now = Date.now();
    if (impressionTimestamps.size > MAX_DEDUPE_CACHE_SIZE) {
        // 오래된 항목부터 삭제
        for (const [key, timestamp] of impressionTimestamps.entries()) {
            if (now - timestamp >= IMPRESSION_DEDUPE_INTERVAL_MS) {
                impressionTimestamps.delete(key);
            }
        }
    }
};

let lastScreenView: string | null = null;
const deepLinkProcessed = new Set<string>(); // raw_url 단위 캐시
const scrollDepthTriggered = new Map<string, Set<number>>(); // profile_id -> Set(25, 50, 90)

/**
 * 세션 전환(앱 백그라운드→포그라운드) 시 dedupe 캐시를 초기화합니다.
 */
export const resetAnalyticsCache = (): void => {
    impressionTimestamps.clear();
    lastScreenView = null;
    deepLinkProcessed.clear();
    scrollDepthTriggered.clear();
};

export const resetImpressionCache = (): void => {
    impressionTimestamps.clear();
};


// ────────────────────────────────────────────
// 4) High-level Tracking Helpers
// ────────────────────────────────────────────

/**
 * [Screen View] - 중복 진입 방지
 */
export const trackScreenView = async (screenName: string, params?: Record<string, any>) => {
    if (lastScreenView === screenName) return; // Dedupe
    lastScreenView = screenName;
    setAnalyticsFlowContext(screenName); // 글로벌 컨텍스트 업데이트

    try {
        await analytics().logScreenView({ screenName, screenClass: screenName });
    } catch (e) {
        console.warn(`[Analytics] Failed to log screen_view "${screenName}":`, e);
    }
};

/**
 * [Impression] - entity_id + source 기준 30초 쿨다운
 */
export const trackImpression = (
    eventName: 'creator_card_impression' | 'portfolio_post_impression' | 'community_post_impression' | 'search_result_view',
    entityId: string,
    source: FeedType | string,
    params?: Record<string, any>
) => {
    purgeDedupeCache(); // 캐시 정리 수행

    const dedupeKey = `${eventName}:${entityId}:${source}`;
    const now = Date.now();
    const lastSent = impressionTimestamps.get(dedupeKey);

    if (lastSent && now - lastSent < IMPRESSION_DEDUPE_INTERVAL_MS) {
        return; // 무시
    }

    impressionTimestamps.set(dedupeKey, now);
    safeLogEvent(eventName, {
        entity_id: entityId,
        source: source,
        ...params
    });
};

/**
 * [Deep Link] - App Session 당 URL 기준 1회 발송
 */
export const trackDeepLinkOpen = (rawUrl: string, parsedData: ParsedDeepLink, params?: Record<string, any>) => {
    if (deepLinkProcessed.has(rawUrl)) return;
    deepLinkProcessed.add(rawUrl);

    // 글로벌 컨텍스트에 trackingCode 등 전파 (세션 유지)
    if (parsedData.trackingCode) {
        setAnalyticsFlowContext(undefined, 'deep_link', parsedData.sourceChannel, parsedData.trackingCode);
        sessionTrackingCode = parsedData.trackingCode; // 세션 전역 유지
        saveAttributionTrackingCode(parsedData.trackingCode); // 앱 재시작 후에도 유지
    }

    safeLogEvent('deep_link_open', {
        link_url: rawUrl.length > 500 ? rawUrl.substring(0, 500) : rawUrl,
        link_type: parsedData.linkType,
        target_id: parsedData.targetId,
        source_channel: parsedData.sourceChannel,
        ...params
    });
};

/**
 * [Scroll Depth] - 특정 ID 기준 25, 50, 90 각 1번씩만 전송
 */
export const trackProfileScrollDepth = (photographerId: string, depth: 25 | 50 | 90) => {
    if (!scrollDepthTriggered.has(photographerId)) {
        scrollDepthTriggered.set(photographerId, new Set<number>());
    }
    const triggered = scrollDepthTriggered.get(photographerId)!;

    if (triggered.has(depth)) return;
    triggered.add(depth);

    safeLogEvent('profile_scroll_depth', {
        photographer_id: photographerId,
        depth_percentage: depth,
    });
};


/**
 * [Booking ID 필수 주입 Helper]
 */
export const trackBookingEvent = (
    eventName: 'booking_intent' | 'booking_request_submitted' | 'booking_request_delivery_succeeded' | 'booking_accepted_by_photographer' | 'booking_confirmed' | 'booking_cancelled_by_user' | 'booking_cancelled_by_photographer' | 'booking_rejected_by_photographer' | 'photographer_booking_completed' | 'booking_detail_view',
    bookingId?: string,
    photographerId?: string,
    params?: Record<string, any>
) => {
    safeLogEvent(eventName, {
        booking_id: bookingId,
        photographer_id: photographerId,
        ...params
    });
};

/**
 * [Chat / Inquiry Funnel Helper]
 */
export const trackChatEvent = (
    eventName: 'inquiry_start' | 'chat_room_created' | 'chat_initiated' | 'first_message_sent' | 'chat_message_sent',
    roomId: string,
    photographerId?: string,
    params?: Record<string, any>
) => {
    safeLogEvent(eventName, {
        room_id: roomId,
        photographer_id: photographerId,
        ...params
    });
};


// ────────────────────────────────────────────
// 5) Attribution tracking code persistence
// ────────────────────────────────────────────

const ATTRIBUTION_TRACKING_CODE_KEY = '@snaplink_attribution_tracking_code';

/**
 * 링크 클릭으로 유입된 tracking_code를 AsyncStorage에 저장합니다.
 * 앱 재시작 후에도 유입 경로를 유지해 전환 이벤트에 속성 추적이 가능합니다.
 */
export const saveAttributionTrackingCode = async (code: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(ATTRIBUTION_TRACKING_CODE_KEY, code);
    } catch (e) {
        console.warn('[Analytics] Failed to save attribution tracking code:', e);
    }
};

/**
 * 저장된 attribution tracking_code를 AsyncStorage에서 불러와 세션 컨텍스트에 설정합니다.
 * 앱 시작 시 1회 호출해야 합니다.
 */
export const loadAttributionTrackingCode = async (): Promise<void> => {
    try {
        const code = await AsyncStorage.getItem(ATTRIBUTION_TRACKING_CODE_KEY);
        if (code && !sessionTrackingCode) {
            sessionTrackingCode = code;
        }
    } catch (e) {
        console.warn('[Analytics] Failed to load attribution tracking code:', e);
    }
};

// ────────────────────────────────────────────
// 6) First install detection
// ────────────────────────────────────────────

const FIRST_INSTALL_KEY = '@snaplink_first_install';

export const checkAndMarkFirstInstall = async (): Promise<boolean> => {
    try {
        const value = await AsyncStorage.getItem(FIRST_INSTALL_KEY);
        if (value === null) {
            await AsyncStorage.setItem(FIRST_INSTALL_KEY, 'installed');
            return true;
        }
        return false;
    } catch (e) {
        console.warn('[Analytics] Failed to check first install:', e);
        return false;
    }
};

// ────────────────────────────────────────────
// 6) Deep link URL parser
// ────────────────────────────────────────────

export interface ParsedDeepLink {
    linkType: LinkType;
    targetId: string;
    trackingCode: string | null;
    sourceChannel: SourceChannel;
}

// link-hub LinkChannel → analytics SourceChannel 매핑
function mapLinkChannelToSourceChannel(channel: string): SourceChannel {
    switch (channel) {
        case 'instagram_ads':
        case 'instagram_profile':
            return 'instagram';
        case 'creator_personal':
        case 'app_share':
            return 'system_share';
        case 'blogger':
        case 'landing_download':
        case 'manual_campaign':
            return 'external';
        default:
            return 'unknown';
    }
}

export const parseDeepLinkUrl = (url: string): ParsedDeepLink => {
    let routePath = url;

    // 스킴 제거
    if (url.includes('://')) {
        const parts = url.split('://');
        routePath = parts[1];
        if (routePath.startsWith('link.snaplink.run/')) {
            routePath = routePath.replace('link.snaplink.run/', '');
        }
    }
    routePath = routePath.replace(/^\/+/, '');

    // Query parameter 파싱
    let queryString = '';
    const queryIndex = routePath.indexOf('?');
    if (queryIndex !== -1) {
        queryString = routePath.substring(queryIndex + 1);
        routePath = routePath.substring(0, queryIndex);
    }

    const queryParams: Record<string, string> = {};
    if (queryString) {
        queryString.split('&').forEach(param => {
            const [key, value] = param.split('=');
            if (key && value) {
                queryParams[key] = decodeURIComponent(value);
            }
        });
    }

    const trackingCode = queryParams['tracking_code'] || null;
    const channel = queryParams['channel'] || null;

    // source 판별: link-hub가 전달한 channel 파라미터를 우선 사용
    let sourceChannel: SourceChannel = 'unknown';
    if (channel) {
        sourceChannel = mapLinkChannelToSourceChannel(channel);
    } else if (url.startsWith('snaplink://')) {
        sourceChannel = 'internal';
    } else if (url.startsWith('https://')) {
        sourceChannel = 'external';
    }

    // 경로 패턴에서 타입과 ID 추출
    let linkType: LinkType = 'unknown';
    let targetId = '';

    if (routePath.includes('photographer/')) {
        linkType = 'photographer_profile';
        const match = routePath.match(/photographer\/([^/?]+)/);
        targetId = match?.[1] ?? '';
    } else if (routePath.includes('portfolio/')) {
        linkType = 'portfolio_post';
        const match = routePath.match(/portfolio\/([^/?]+)/);
        targetId = match?.[1] ?? '';
    } else if (routePath.includes('community/post/')) {
        linkType = 'community_post';
        const match = routePath.match(/post\/([^/?]+)/);
        targetId = match?.[1] ?? '';
    } else if (routePath.includes('booking/')) {
        linkType = 'booking';
        const match = routePath.match(/booking\/([^/?/]+)/);
        targetId = match?.[1] ?? '';
    } else if (routePath.includes('review/')) {
        linkType = 'review';
        const match = routePath.match(/review\/([^/?]+)/);
        targetId = match?.[1] ?? '';
    } else if (routePath.includes('chat/')) {
        linkType = 'chat';
        const match = routePath.match(/chat\/([^/?]+)/);
        targetId = match?.[1] ?? '';
    }

    return { linkType, targetId, trackingCode, sourceChannel };
};

// ────────────────────────────────────────────
// 7) Tracking code generator
// ────────────────────────────────────────────

export const generateTrackingCode = (): string => {
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};
