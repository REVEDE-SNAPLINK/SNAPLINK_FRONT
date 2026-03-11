import { Alert } from '@/components/ui';

/**
 * 네트워크 에러인지 확인합니다.
 * fetch 요청 자체가 실패한 경우 (인터넷 연결 없음, DNS 실패 등)
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    // fetch의 네트워크 에러는 TypeError로 throw됨
    const message = error.message.toLowerCase();
    return (
      message.includes('network request failed') ||
      message.includes('network error') ||
      message.includes('failed to fetch') ||
      message.includes('internet') ||
      message.includes('offline') ||
      message.includes('timeout')
    );
  }

  // Error 객체의 name이나 message로 판단
  if (error instanceof Error) {
    const name = error.name.toLowerCase();
    const message = error.message.toLowerCase();

    return (
      name === 'networkerror' ||
      name === 'aborterror' ||
      message.includes('network') ||
      message.includes('internet') ||
      message.includes('offline') ||
      message.includes('timeout') ||
      message.includes('econnrefused') ||
      message.includes('enotfound')
    );
  }

  return false;
}

/**
 * 에러 타입에 따른 사용자 친화적 가이드 메시지를 반환합니다.
 * - 네트워크 에러: 사용자가 조치 가능 (네트워크 확인)
 * - 서버/클라이언트 에러: 잠시 후 재시도 권장
 */
export function getErrorGuideMessage(error: unknown): string {
  if (isNetworkError(error)) {
    return '네트워크 연결을 확인해주세요.';
  }
  return '잠시 후 다시 시도해주세요.';
}

/**
 * 작업명과 에러 가이드를 조합한 메시지를 생성합니다.
 * @param action 작업명 (예: "예약", "리뷰 작성")
 * @param error 에러 객체
 * @returns 조합된 메시지 (예: "예약에 실패했습니다. 네트워크 연결을 확인해주세요.")
 */
export function buildErrorMessage(action: string, error: unknown): string {
  const guide = getErrorGuideMessage(error);
  return `${action}에 실패했습니다. ${guide}`;
}

export interface ErrorAlertOptions {
  /** Alert 제목 (예: "예약 실패") */
  title: string;
  /** 작업명 (예: "예약", "리뷰 작성") - 메시지 생성에 사용 */
  action: string;
  /** 에러 객체 */
  error: unknown;
  /** 확인 버튼 클릭 시 실행할 콜백 (선택) */
  onConfirm?: () => void;
}

/**
 * 에러 Alert을 표시합니다.
 * 네트워크 에러와 서버 에러를 자동으로 구분하여 적절한 메시지를 표시합니다.
 *
 * @example
 * ```tsx
 * onError: (error) => {
 *   showErrorAlert({
 *     title: '예약 실패',
 *     action: '예약',
 *     error,
 *   });
 * }
 * ```
 */
export function showErrorAlert({ title, action, error, onConfirm }: ErrorAlertOptions): void {
  const message = buildErrorMessage(action, error);

  Alert.show({
    title,
    message,
    buttons: [
      {
        text: '확인',
        onPress: onConfirm ?? (() => {}),
      },
    ],
  });
}

/**
 * 간단한 에러 Alert을 표시합니다.
 * 작업명 없이 제목과 가이드 메시지만 표시할 때 사용합니다.
 *
 * @example
 * ```tsx
 * onError: (error) => {
 *   showSimpleErrorAlert('로그인 실패', error);
 * }
 * ```
 */
export function showSimpleErrorAlert(
  title: string,
  error: unknown,
  onConfirm?: () => void,
): void {
  const message = getErrorGuideMessage(error);

  Alert.show({
    title,
    message,
    buttons: [
      {
        text: '확인',
        onPress: onConfirm ?? (() => {}),
      },
    ],
  });
}