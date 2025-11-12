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
