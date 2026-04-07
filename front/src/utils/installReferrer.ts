/**
 * Android Install Referrer 유틸리티
 *
 * Google Play Install Referrer API를 통해 앱 설치 시 넘어온 referrer 문자열을 읽고,
 * link_code를 파싱해 link-hub에서 tracking_code를 복원한다.
 *
 * referrer 형식: "link_code=l1_abc123"
 * (link-hub/lib/redirect.ts: ANDROID_STORE_BASE_URL + "&referrer=link_code%3D{code}")
 */

import { NativeModules, Platform } from 'react-native';
import { getLinkHubUrl } from '@/config/api';

/**
 * Play Store referrer 문자열에서 link_code를 파싱한다.
 * "link_code=l1_abc123&utm_source=..." → "l1_abc123"
 */
function parseLinkCode(referrer: string): string | null {
    const match = referrer.match(/(?:^|&)link_code=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Android 전용: Play Store Install Referrer에서 link_code를 읽어
 * link-hub /api/deferred?link_code= 를 통해 deep link URL을 반환한다.
 *
 * - iOS: null 반환 (호출 자체를 막음)
 * - Play Store 미지원 / referrer 없음: null 반환
 * - 성공: { deepLinkUrl, code } 반환
 */
export async function resolveAndroidInstallReferrer(): Promise<{
    deepLinkUrl: string;
    code: string;
} | null> {
    if (Platform.OS !== 'android') return null;

    try {
        const referrer: string | null =
            await NativeModules.InstallReferrer?.getInstallReferrer();

        if (!referrer) return null;

        const linkCode = parseLinkCode(referrer);
        if (!linkCode) return null;

        console.log('📦 Android referrer link_code:', linkCode);

        const linkHubUrl = getLinkHubUrl();
        const res = await fetch(
            `${linkHubUrl}/api/deferred?link_code=${encodeURIComponent(linkCode)}`,
            { headers: { 'Content-Type': 'application/json' } },
        );

        if (!res.ok) return null;

        const data = await res.json();
        if (!data.found || !data.deepLinkUrl) return null;

        return { deepLinkUrl: data.deepLinkUrl, code: data.code };
    } catch (e) {
        console.warn('⚠️ Android Install Referrer resolution failed:', e);
        return null;
    }
}
