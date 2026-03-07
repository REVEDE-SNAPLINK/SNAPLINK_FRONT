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

const FIRST_INSTALL_KEY = '@snaplink_first_install';

// ────────────────────────────────────────────
// 1) Safe analytics event logger
// ────────────────────────────────────────────

/**
 * analytics().logEvent 를 안전하게 호출합니다.
 * 에러가 발생해도 앱이 크래시하지 않고 console.warn 으로만 남깁니다.
 */
export const safeLogEvent = async (
    eventName: string,
    params?: Record<string, any>,
): Promise<void> => {
    try {
        await analytics().logEvent(eventName, {
            ...params,
            platform: params?.platform ?? Platform.OS,
        });
    } catch (e) {
        console.warn(`[Analytics] Failed to log event "${eventName}":`, e);
    }
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

/**
 * 현재 화면 및 컨텍스트를 Crashlytics attribute로 설정합니다.
 * 주요 화면 진입 시 호출하면 크래시 발생 시 어디서 일어났는지 파악할 수 있습니다.
 */
export const setCrashlyticsContext = (context: {
    screen?: string;
    flow?: 'deep_link' | 'booking' | 'chat' | 'upload' | 'community' | 'browse';
    entityId?: string;
    entityType?: 'booking' | 'photographer' | 'post' | 'room' | 'review';
}): void => {
    try {
        if (context.screen) {
            crashlytics().setAttribute('currentScreen', context.screen);
        }
        if (context.flow) {
            crashlytics().setAttribute('currentFlow', context.flow);
        }
        if (context.entityId) {
            crashlytics().setAttribute('entityId', String(context.entityId));
        }
        if (context.entityType) {
            crashlytics().setAttribute('entityType', context.entityType);
        }
    } catch (e) {
        console.warn('[Crashlytics] Failed to set context:', e);
    }
};

// ────────────────────────────────────────────
// 3) Impression deduplication
// ────────────────────────────────────────────

/**
 * impression 이벤트의 중복 전송을 방지하기 위한 Set.
 * 동일 세션에서 동일 아이템이 짧은 시간 내에 반복 노출될 경우 dedupe 합니다.
 * key: `${eventName}:${itemId}:${source}`
 */
const impressionSent = new Set<string>();
const IMPRESSION_DEDUPE_INTERVAL_MS = 30_000; // 30초 이내 같은 아이템 중복 무시

const impressionTimestamps = new Map<string, number>();

/**
 * impression 이벤트를 dedupe 하여 안전하게 전송합니다.
 * 동일 key에 대해 30초 이내 재전송을 방지합니다.
 */
export const safeLogImpression = async (
    eventName: string,
    dedupeKey: string,
    params?: Record<string, any>,
): Promise<void> => {
    const now = Date.now();
    const lastSent = impressionTimestamps.get(dedupeKey);

    if (lastSent && now - lastSent < IMPRESSION_DEDUPE_INTERVAL_MS) {
        return; // 30초 이내 같은 아이템 → 무시
    }

    impressionTimestamps.set(dedupeKey, now);
    await safeLogEvent(eventName, params);
};

/**
 * 세션 전환(앱 백그라운드→포그라운드) 시 impression dedupe 캐시를 초기화합니다.
 */
export const resetImpressionCache = (): void => {
    impressionSent.clear();
    impressionTimestamps.clear();
};

// ────────────────────────────────────────────
// 4) First install detection
// ────────────────────────────────────────────

/**
 * 앱 최초 설치 여부를 확인합니다.
 * 최초 호출 시 AsyncStorage에 플래그를 저장하므로, 두 번째 호출부터는 false를 반환합니다.
 */
export const checkAndMarkFirstInstall = async (): Promise<boolean> => {
    try {
        const value = await AsyncStorage.getItem(FIRST_INSTALL_KEY);
        if (value === null) {
            // 최초 설치
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
// 5) Deep link URL parser
// ────────────────────────────────────────────

export type DeepLinkType =
    | 'photographer_profile'
    | 'portfolio_post'
    | 'community_post'
    | 'booking'
    | 'review'
    | 'chat'
    | 'unknown';

export interface ParsedDeepLink {
    linkType: DeepLinkType;
    targetId: string;
    trackingCode: string | null;
    sourceChannel: 'share' | 'external' | 'internal' | 'unknown';
}

/**
 * 딥링크 URL에서 link_type, target_id, tracking_code 등을 파싱합니다.
 */
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

    const trackingCode = queryParams['tc'] || null;

    // source 판별: tc가 있으면 share, 외부 https면 external, 내부 snaplink://면 internal
    let sourceChannel: ParsedDeepLink['sourceChannel'] = 'unknown';
    if (trackingCode) {
        sourceChannel = 'share';
    } else if (url.startsWith('https://')) {
        sourceChannel = 'external';
    } else if (url.startsWith('snaplink://')) {
        sourceChannel = 'internal';
    }

    // 경로 패턴에서 타입과 ID 추출
    let linkType: DeepLinkType = 'unknown';
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
// 6) Tracking code generator (for share links)
// ────────────────────────────────────────────

/**
 * 공유 링크에 삽입할 간단한 추적 코드를 생성합니다.
 * UUID v4 형식 (crypto 없이 Math.random 기반 — 분석용으로 충분한 수준)
 */
export const generateTrackingCode = (): string => {
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};
