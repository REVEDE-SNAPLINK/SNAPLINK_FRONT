import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';


/**
 * 숫자를 comma로 포맷팅합니다.
 *
 * @example
 * ```typescript
 * formatNumber(1000) // "1,000"
 * formatNumber(1234567) // "1,234,567"
 * formatNumber(1234.56) // "1,234.56"
 * ```
 */
export function formatNumber(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    return '0';
  }

  return num.toLocaleString('en-US');
}

/**
 * 숫자를 통화 형식으로 포맷팅합니다.
 *
 * @example
 * ```typescript
 * formatCurrency(1000) // "₩1,000"
 * formatCurrency(1234567) // "₩1,234,567"
 * formatCurrency(1234567, '$') // "$1,234,567"
 * ```
 */
export function formatCurrency(value: number | string, symbol: string = '₩'): string {
  return `${symbol}${formatNumber(value)}`;
}

/**
 * 숫자를 축약 형식으로 포맷팅합니다.
 *
 * @example
 * ```typescript
 * formatCompactNumber(1000) // "1K"
 * formatCompactNumber(1234567) // "1.2M"
 * formatCompactNumber(1234) // "1.2K"
 * ```
 */
export function formatCompactNumber(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    return '0';
  }

  if (num < 1000) {
    return num.toString();
  }

  if (num < 1000000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }

  if (num < 1000000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }

  return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
}

/**
 * 한국 통화 형식으로 포맷팅합니다 (만원 단위).
 *
 * @example
 * ```typescript
 * formatKoreanCurrency(5000) // "5,000원"
 * formatKoreanCurrency(50000) // "5만원"
 * formatKoreanCurrency(1234567) // "123만원"
 * formatKoreanCurrency(200000, '원') // "20만원"
 * ```
 */
export function formatKoreanCurrency(value: number, unit: string = '원'): string {
  if (value >= 10000) {
    const manValue = Math.floor(value / 10000);
    return `${manValue.toLocaleString()}만${unit}`;
  }
  return `${value.toLocaleString()}${unit}`;
}

/**
 * 필터 가격 범위를 포맷팅합니다.
 *
 * @example
 * ```typescript
 * formatPriceRange(5000, 50000) // "5,000원 ~ 5만원"
 * formatPriceRange(10000, 1000000) // "1만원 ~ 100만원"
 * ```
 */
export function formatPriceRange(min: number, max: number, unit: string = '원'): string {
  return `${formatKoreanCurrency(min, unit)} ~ ${formatKoreanCurrency(max, unit)}`;
}

/**
 * 날짜와 시간을 지정된 형식으로 포맷팅합니다.
 *
 * @example
 * ```typescript
 * formatDateTime('2025-11-20', '14:00') // "2025.11.20 14:00"
 * formatDateTime('2025-01-05', '09:30') // "2025.01.05 09:30"
 * ```
 */
export function formatDateTime(date: string, time: string): string {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}.${month}.${day} ${time}`;
}

const DAY_KO = ['일', '월', '화', '수', '목', '금', '토'];

export const formatReservationDateTime = (
  reservedDate: string,
  startTime: string,
): string => {
  const date = dayjs(reservedDate);
  const day = DAY_KO[date.day()]; // 0(Sun) ~ 6(Sat)

  return `${date.format('YYYY.MM.DD')}(${day}) ${startTime}`;
};

export const normalizeImageMime = (t?: string) => {
  if (!t) return 'image/jpeg';
  const lower = t.toLowerCase();
  if (lower === 'image/jpg') return 'image/jpeg';
  if (lower.includes('/')) return lower;

  if (lower === 'jpg' || lower === 'jpeg') return 'image/jpeg';
  if (lower === 'png') return 'image/png';
  if (lower === 'heic') return 'image/heic';
  return 'image/jpeg';
};

const mimeToExt = (mime: string) => {
  switch (mime) {
    case 'image/jpeg': return 'jpg';
    case 'image/png': return 'png';
    case 'image/heic': return 'heic';
    default: return 'jpg';
  }
};

export const generateImageFilename = (mimeType?: string, prefix = 'img') => {
  const normalized = normalizeImageMime(mimeType);
  const ext = mimeToExt(normalized);

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
};

type QueryValue =
  | string
  | number
  | boolean
  | Date
  | undefined
  | null
  | Array<string | number | boolean>;

export const buildQuery = <T extends { [K in keyof T]?: QueryValue }>(
  query?: T,
): string => {
  const params = new URLSearchParams();
  if (!query) return '';

  Object.entries(query as Record<string, QueryValue>).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach(v => params.append(key, String(v)));
    } else if (value instanceof Date) {
      params.set(key, value.toISOString());
    } else {
      params.set(key, String(value));
    }
  });

  return params.toString();
};

dayjs.extend(utc);
dayjs.extend(timezone);

export const formatChatDayjs = (iso: string) =>
  dayjs(iso).tz('Asia/Seoul').format('A hh:mm')  // "오전 10:24"
    .replace('AM', '오전')
    .replace('PM', '오후');

export const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const past = new Date(dateString);
  const diff = now.getTime() - past.getTime();

  const second = 1000;
  const minute = 60 * second;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) {
    const secs = Math.floor(diff / second);
    return `${secs}초 전`;
  } else if (diff < hour) {
    const mins = Math.floor(diff / minute);
    return `${mins}분 전`;
  } else if (diff < day) {
    const hours = Math.floor(diff / hour);
    return `${hours}시간 전`;
  } else {
    const days = Math.floor(diff / day);
    return `${days}일 전`;
  }
}