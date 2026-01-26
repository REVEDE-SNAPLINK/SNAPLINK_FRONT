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
  // 1. 문자열인 경우 숫자로 변환
  const numStr = typeof value === 'string' ? value : String(value);
  const num = parseFloat(numStr);

  // 2. 유효한 숫자인지 확인
  if (isNaN(num)) {
    return '0';
  }

  // 3. 정수 부분과 소수 부분 분리 (소수점 유지 목적)
  const parts = numStr.split('.');

  // 4. 정수 부분에 콤마 추가
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // 5. 합쳐서 반환
  return parts.join('.');
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

export function formatDate(date: string): string {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

const DAY_KO = ['일', '월', '화', '수', '목', '금', '토'];

export const formatReservationDateTime = (
  reservedDate: string,
  startTime: string,
  endTime: string,
): string => {
  const date = dayjs(reservedDate);
  const day = DAY_KO[date.day()]; // 0(Sun) ~ 6(Sat)
  const startTimeArr = startTime.split(':');
  const endTimeArr = endTime.split(':');
  const formatStartTime = `${startTimeArr[0]}:${startTimeArr[1]}`;
  const formatEndTime = `${endTimeArr[0]}:${endTimeArr[1]}`;

  return `${date.format('YYYY.MM.DD')}(${day}) ${formatStartTime}~${formatEndTime}`;
};

export const formatTime = (time: string) => {
  const arr = time.split(':');
  return `${arr[0]}:${arr[1]}`;
}

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

export const formatChatDayjs = (iso: string) => {
  if (!iso) return '';
  // Z 없는 ISO 문자열을 UTC로 파싱하고 9시간 더해서 한국 시간으로 변환
  const date = dayjs.utc(iso).add(9, 'hour');
  if (!date.isValid()) return '';
  return date.format('A hh:mm')  // "오전 10:24"
    .replace('AM', '오전')
    .replace('PM', '오후');
};

export const formatTimeAgo = (dateString: string): string => {
  // 서버에서 UTC 시간을 Z 없이 보냄
  const past = dayjs.utc(dateString);

  // Invalid date 체크
  if (!past.isValid()) {
    return '날짜 오류';
  }

  // 둘 다 UTC 기준으로 비교
  const now = dayjs.utc();
  const diff = now.diff(past);  // 밀리초

  // 음수 diff 처리 (미래 시간)
  if (diff < 0) {
    return '방금 전';
  }

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
    // 30일 이상은 날짜 형식으로 표시 (한국 시간으로 변환)
    return past.add(9, 'hour').format('YYYY.MM.DD');
  }
}
