# Firebase Analytics & Crashlytics 구현 가이드

## 🚀 빠른 시작

이 문서는 SNAPLINK 앱에서 Firebase Analytics 및 Crashlytics를 효과적으로 활용하기 위한 실전 가이드입니다.

---

## 📋 목차

1. [Crashlytics 에러 로깅 강화](#1-crashlytics-에러-로깅-강화)
2. [누락된 이벤트 추가](#2-누락된-이벤트-추가)
3. [User Properties 설정](#3-user-properties-설정)
4. [Firebase Console 확인 방법](#4-firebase-console-확인-방법)
5. [권장 코드 패턴](#5-권장-코드-패턴)

---

## 1. Crashlytics 에러 로깅 강화

### 1.1 API 에러 자동 로깅

**위치**: `front/src/api/utils.ts`

현재 `authFetch`는 단순히 fetch를 래핑만 하고 있습니다. 에러 로깅을 추가해야 합니다.

```typescript
import crashlytics from '@react-native-firebase/crashlytics';

export const authFetch = async (
  url: string,
  options?: Omit<RequestInit, 'body'> & { json?: any }
): Promise<Response> => {
  try {
    const token = await getToken();

    const headers: HeadersInit = {
      ...options?.headers,
      Authorization: `Bearer ${token}`,
    };

    if (options?.json) {
      headers['Content-Type'] = 'application/json';
    }

    const requestOptions: RequestInit = {
      ...options,
      headers,
      body: options?.json ? JSON.stringify(options.json) : undefined,
    };

    const response = await fetch(url, requestOptions);

    // ✅ API 에러 로깅 추가
    if (!response.ok) {
      const errorData = {
        url,
        status: response.status,
        statusText: response.statusText,
        method: options?.method || 'GET',
      };

      // Non-fatal error 기록
      crashlytics().recordError(
        new Error(`API Error: ${response.status} ${url}`),
        errorData
      );

      // 심각한 에러 (5xx)는 추가 로깅
      if (response.status >= 500) {
        crashlytics().log(`🚨 Server Error: ${response.status} ${url}`);
      }
    }

    return response;
  } catch (error) {
    // ✅ 네트워크 에러 로깅
    crashlytics().recordError(error as Error, {
      url,
      type: 'NetworkError',
      message: (error as Error).message,
    });

    crashlytics().log(`🔴 Network Error: ${url}`);
    throw error;
  }
};
```

### 1.2 User Context 설정

**위치**: `front/src/store/authStore.ts`

로그인 시 사용자 정보를 Crashlytics에 설정합니다.

```typescript
import crashlytics from '@react-native-firebase/crashlytics';
import analytics from '@react-native-firebase/analytics';

// setUser 함수 내부에 추가
setUser: (user: { userId: string; userType: UserType; isFirst: boolean }) => {
  set({ ...user });

  // ✅ Crashlytics 사용자 설정
  crashlytics().setUserId(user.userId);
  crashlytics().setAttributes({
    userType: user.userType,
    isFirstLogin: String(user.isFirst),
  });

  // ✅ Analytics 사용자 속성 설정
  analytics().setUserId(user.userId);
  analytics().setUserProperties({
    user_type: user.userType,
    signup_date: new Date().toISOString().split('T')[0],
  });

  // 로그인 이벤트
  analytics().logEvent('login', {
    user_id: user.userId,
    user_type: user.userType,
    method: 'kakao',
  });
},
```

### 1.3 주요 액션 Breadcrumb 추적

**위치**: 각 Container 파일에 추가

```typescript
// 예: PhotographerDetailsContainer.tsx
useEffect(() => {
  crashlytics().log(`📱 Viewing photographer profile: ${photographerId}`);
}, [photographerId]);

// BookingRequestContainer.tsx
const onSubmit = (data) => {
  crashlytics().log(`📝 Booking request submitted for photographer: ${photographerId}`);
  // ... 기존 코드
};

// ChatDetailsContainer.tsx
const handleSendMessage = () => {
  crashlytics().log(`💬 Message sent in room: ${roomId}`);
  // ... 기존 코드
};
```

---

## 2. 누락된 이벤트 추가

### 2.1 채팅 메시지 전송 이벤트

**위치**: `front/src/screens/common/ChatDetails/ChatDetailsContainer.tsx`

```typescript
import analytics from '@react-native-firebase/analytics';
import { useState } from 'react';

export default function ChatDetailsContainer() {
  const [messageCount, setMessageCount] = useState(0);
  const [isFirstMessage, setIsFirstMessage] = useState(true);

  const handleSendMessage = (message: string) => {
    // ✅ 메시지 전송 이벤트
    analytics().logEvent('chat_message_sent', {
      user_id: userId,
      room_id: roomId,
      is_first_message: isFirstMessage,
      message_length: message.length,
      message_count: messageCount + 1,
    });

    if (isFirstMessage) {
      setIsFirstMessage(false);
    }
    setMessageCount(prev => prev + 1);

    // Breadcrumb
    crashlytics().log(`💬 Message sent in room ${roomId} (count: ${messageCount + 1})`);

    // ... 기존 메시지 전송 로직
  };

  // ... 나머지 코드
}
```

### 2.2 작가 응답 이벤트

**위치**: `front/src/screens/common/ChatDetails/ChatDetailsContainer.tsx` (WebSocket 메시지 수신 핸들러)

```typescript
const [lastUserMessageTime, setLastUserMessageTime] = useState<number | null>(null);
const [photographerFirstResponse, setPhotographerFirstResponse] = useState(true);

const onMessageReceived = (chatMessage: any) => {
  // 기존 메시지 처리 로직
  setMessages(prev => [...prev, chatMessage]);

  // ✅ 작가 응답 추적 (상대방이 작가인 경우)
  if (chatMessage.senderId !== userId && userType === 'user') {
    const now = Date.now();
    const responseTime = lastUserMessageTime ? (now - lastUserMessageTime) / 1000 : null;

    analytics().logEvent('photographer_response', {
      photographer_id: chatMessage.senderId,
      room_id: roomId,
      is_first_response: photographerFirstResponse,
      response_time_seconds: responseTime,
      user_id: userId,
    });

    if (photographerFirstResponse) {
      setPhotographerFirstResponse(false);

      // 첫 응답 시간 별도 추적
      if (responseTime !== null) {
        analytics().logEvent('photographer_first_response_time', {
          photographer_id: chatMessage.senderId,
          response_time_seconds: responseTime,
          response_time_minutes: Math.round(responseTime / 60),
        });
      }
    }

    crashlytics().log(`✉️ Photographer responded in room ${roomId} (${responseTime}s)`);
  }

  // 사용자 메시지 전송 시각 기록
  if (chatMessage.senderId === userId) {
    setLastUserMessageTime(Date.now());
  }
};
```

### 2.3 프로필 퍼널 이벤트

**위치**: `front/src/screens/common/PhotographerDetails/PhotographerDetailsContainer.tsx`

```typescript
import { useRef, useCallback } from 'react';

export default function PhotographerDetailsContainer() {
  const scrollDepthTracked = useRef({ 25: false, 50: false, 75: false, 100: false });

  // 포트폴리오 클릭
  const handlePressPortfolioItem = (portfolioId: number) => {
    analytics().logEvent('profile_portfolio_clicked', {
      photographer_id: photographerId,
      portfolio_id: portfolioId,
      user_id: userId,
      user_type: userType,
      source: 'profile_page',
    });

    crashlytics().log(`🖼️ Portfolio clicked: ${portfolioId} on profile ${photographerId}`);

    navigation.navigate('PostDetail', { postId: portfolioId });
  };

  // 리뷰 탭 클릭
  const handlePressReviewTab = () => {
    analytics().logEvent('profile_review_tab_clicked', {
      photographer_id: photographerId,
      user_id: userId,
      user_type: userType,
    });

    crashlytics().log(`⭐ Review tab clicked on profile ${photographerId}`);
  };

  // 스크롤 깊이 추적
  const handleScroll = useCallback((event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollPercentage = ((contentOffset.y + layoutMeasurement.height) / contentSize.height) * 100;

    [25, 50, 75, 100].forEach(depth => {
      if (scrollPercentage >= depth && !scrollDepthTracked.current[depth]) {
        analytics().logEvent('profile_scroll_depth', {
          photographer_id: photographerId,
          depth_percentage: depth,
          user_id: userId,
        });

        scrollDepthTracked.current[depth] = true;
      }
    });
  }, [photographerId, userId]);

  return (
    <PhotographerDetailsView
      onScroll={handleScroll}
      onPressPortfolioItem={handlePressPortfolioItem}
      onPressReviewTab={handlePressReviewTab}
      // ... 기타 props
    />
  );
}
```

### 2.4 예약 퍼널 이탈 추적

**위치**: `front/src/screens/user/Booking/BookingContainer.tsx`

```typescript
import { useEffect, useRef } from 'react';

export default function BookingContainer() {
  const bookingCompletedRef = useRef(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // 예약 폼 진입 로그
    analytics().logEvent('booking_form_opened', {
      photographer_id: photographerId,
      product_id: productId,
      user_id: userId,
    });

    crashlytics().log(`📝 Booking form opened for photographer ${photographerId}`);

    // 컴포넌트 언마운트 시 (예약 완료하지 않고 나가는 경우)
    return () => {
      if (!bookingCompletedRef.current) {
        analytics().logEvent('booking_form_abandoned', {
          photographer_id: photographerId,
          product_id: productId,
          step: currentStep,
          user_id: userId,
          abandonment_reason: 'navigation',
        });

        crashlytics().log(`❌ Booking abandoned at step ${currentStep} for ${photographerId}`);
      }
    };
  }, []);

  const onBookingSuccess = () => {
    bookingCompletedRef.current = true;
    // ... 기존 성공 로직
  };

  // ... 나머지 코드
}
```

### 2.5 채팅에서 예약 전환 추적

**위치**: `front/src/screens/common/ChatDetails/ChatDetailsView.tsx` 또는 Container

```typescript
const handlePressBooking = () => {
  // ✅ 채팅에서 예약하기 클릭
  analytics().logEvent('booking_intent_from_chat', {
    photographer_id: opponentId,
    room_id: roomId,
    user_id: userId,
    message_count: messages.length,
  });

  crashlytics().log(`📅 Booking initiated from chat room ${roomId}`);

  navigation.navigate('Booking', { photographerId: opponentId });
};
```

---

## 3. User Properties 설정

### 3.1 회원가입 시

**위치**: `front/src/screens/auth/UserOnboarding/UserOnboardingContainer.tsx`

```typescript
const onSignupComplete = async () => {
  const signupDate = new Date().toISOString().split('T')[0];

  // ✅ User Properties 설정
  await analytics().setUserProperties({
    user_type: userType,
    signup_date: signupDate,
    signup_method: 'kakao',
    has_profile_image: profileImageUri ? 'true' : 'false',
  });

  await analytics().logEvent('sign_up', {
    user_id: userId,
    user_type: userType,
    signup_date: signupDate,
    method: 'kakao',
  });

  // Crashlytics
  crashlytics().setUserId(userId);
  crashlytics().setAttributes({
    userType: userType,
    signupDate: signupDate,
  });

  crashlytics().log(`✅ User signed up: ${userId} (${userType})`);
};
```

### 3.2 예약 완료 후

**위치**: `front/src/screens/user/BookingRequest/BookingRequestContainer.tsx`

```typescript
const onBookingSuccess = async () => {
  // ✅ 사용자 속성 업데이트 (총 예약 수)
  const totalBookings = (userBookingCount || 0) + 1;

  await analytics().setUserProperties({
    total_bookings: String(totalBookings),
    last_booking_date: new Date().toISOString().split('T')[0],
  });

  // ... 기존 성공 로직
};
```

---

## 4. Firebase Console 확인 방법

### 4.1 Analytics 대시보드

1. **Firebase Console 접속**
   - https://console.firebase.google.com/
   - 프로젝트 선택: SNAPLINK

2. **Analytics 메뉴**
   - 좌측 메뉴에서 "Analytics" 클릭
   - Dashboard에서 기본 지표 확인

### 4.2 DAU/MAU 확인

**경로**: Analytics > Dashboard

- **Active users** 카드에서 확인
- 기간 설정:
  - 오늘 (DAU)
  - 지난 7일 (WAU)
  - 지난 30일 (MAU)

### 4.3 이벤트 분석

**경로**: Analytics > Events

1. 이벤트 목록에서 관심 이벤트 클릭
2. 상세 페이지에서 확인:
   - Event count (발생 횟수)
   - Event count per user (사용자당 발생)
   - Total users (이벤트를 발생시킨 총 사용자 수)

**주요 이벤트 확인 예시**:
- `photographer_profile_view`: 작가 프로필 조회 수
- `booking_confirmed`: 예약 확정 수
- `chat_message_sent`: 채팅 메시지 전송 수
- `photographer_response`: 작가 응답 수

### 4.4 퍼널 분석 설정

**경로**: Analytics > Analysis > Funnel analysis

**예약 퍼널 설정**:
1. "Create new analysis" 클릭
2. "Funnel analysis" 선택
3. 단계 추가:
   - Step 1: `photographer_profile_view`
   - Step 2: `booking_intent`
   - Step 3: `booking_request_submitted`
   - Step 4: `booking_confirmed`
4. "Apply" 클릭
5. 각 단계별 전환율 확인

**채팅 기반 문의 퍼널**:
- Step 1: `chat_initiated`
- Step 2: `chat_message_sent`
- Step 3: `photographer_response`
- Step 4: `booking_intent_from_chat`
- Step 5: `booking_confirmed`

### 4.5 Retention 확인

**경로**: Analytics > Retention

1. "All users" cohort 선택
2. 확인 지표:
   - Day 1 retention (1일 후 재방문율)
   - Day 7 retention (7일 후 재방문율)
   - Day 30 retention (30일 후 재방문율)

### 4.6 User Properties 분석

**경로**: Analytics > Latest Release > User properties

1. 커스텀 속성 확인:
   - `user_type`: 일반 사용자 vs 작가
   - `signup_date`: 가입일
   - `total_bookings`: 총 예약 수

2. Audience 생성 (예: 파워 유저)
   - Analytics > Audiences
   - "Create audience" 클릭
   - 조건: `total_bookings >= 3`

### 4.7 Crashlytics 모니터링

**경로**: Crashlytics > Dashboard

1. **Crash-free users** 확인
   - 목표: 99% 이상 유지

2. **Issues 목록**
   - 크래시 발생 빈도
   - 영향받은 사용자 수
   - 최근 발생 시각

3. **특정 이슈 상세 분석**
   - 이슈 클릭 → 스택 트레이스 확인
   - Keys, Logs, Events 탭에서 상황 재구성
   - 사용자 정보 (userId, userType) 확인

4. **Non-fatal errors 확인**
   - Dashboard에서 "Non-fatals" 탭 클릭
   - API 에러, 네트워크 에러 빈도 확인

### 4.8 실시간 모니터링

**개발 중 (DebugView)**:
- 경로: Analytics > DebugView
- 디바이스에서 실시간 이벤트 확인
- 개발 빌드에서만 동작

**프로덕션 (Realtime)**:
- 경로: Analytics > Realtime
- 현재 활성 사용자 수
- 실시간 이벤트 스트림

---

## 5. 권장 코드 패턴

### 5.1 이벤트 로깅 헬퍼 함수

**위치**: `front/src/utils/analytics.ts` (신규 생성)

```typescript
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';

/**
 * 공통 이벤트 파라미터 자동 추가
 */
export const logEvent = async (
  eventName: string,
  params?: Record<string, any>
) => {
  const commonParams = {
    timestamp: new Date().toISOString(),
    platform: Platform.OS,
  };

  await analytics().logEvent(eventName, {
    ...commonParams,
    ...params,
  });
};

/**
 * 에러 로깅 헬퍼
 */
export const logError = (
  error: Error,
  context?: Record<string, any>
) => {
  crashlytics().recordError(error, context);
  crashlytics().log(`🔴 Error: ${error.message}`);
};

/**
 * 브레드크럼 로깅 헬퍼
 */
export const logBreadcrumb = (message: string) => {
  crashlytics().log(`📍 ${message}`);
};

/**
 * 퍼널 단계 추적 헬퍼
 */
export const trackFunnelStep = async (
  funnelName: string,
  stepName: string,
  stepNumber: number,
  additionalParams?: Record<string, any>
) => {
  await logEvent(`${funnelName}_${stepName}`, {
    funnel: funnelName,
    step_number: stepNumber,
    step_name: stepName,
    ...additionalParams,
  });
};
```

**사용 예시**:

```typescript
import { logEvent, logBreadcrumb, trackFunnelStep } from '@/utils/analytics';

// 간단한 이벤트 로깅
await logEvent('profile_viewed', {
  photographer_id: photographerId,
});

// 퍼널 단계 추적
await trackFunnelStep('booking', 'form_opened', 1, {
  photographer_id: photographerId,
});

// 브레드크럼 로깅
logBreadcrumb('User navigated to booking screen');
```

### 5.2 useAnalytics 커스텀 훅

**위치**: `front/src/hooks/useAnalytics.ts` (신규 생성)

```typescript
import { useEffect, useRef } from 'react';
import { logEvent, logBreadcrumb } from '@/utils/analytics';
import { useAuthStore } from '@/store/authStore';

/**
 * 화면 진입 시 자동 이벤트 로깅
 */
export const useScreenTracking = (screenName: string) => {
  const { userId, userType } = useAuthStore();

  useEffect(() => {
    logEvent('screen_entered', {
      screen_name: screenName,
      user_id: userId,
      user_type: userType,
    });

    logBreadcrumb(`Entered screen: ${screenName}`);
  }, [screenName, userId, userType]);
};

/**
 * 퍼널 이탈 추적
 */
export const useFunnelAbandonment = (
  funnelName: string,
  currentStep: number,
  isCompleted: boolean
) => {
  const abandonmentTracked = useRef(false);

  useEffect(() => {
    return () => {
      if (!isCompleted && !abandonmentTracked.current) {
        logEvent(`${funnelName}_abandoned`, {
          step: currentStep,
          funnel: funnelName,
        });

        abandonmentTracked.current = true;
      }
    };
  }, [funnelName, currentStep, isCompleted]);
};
```

**사용 예시**:

```typescript
import { useScreenTracking, useFunnelAbandonment } from '@/hooks/useAnalytics';

export default function BookingContainer() {
  useScreenTracking('Booking');

  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  useFunnelAbandonment('booking', step, completed);

  // ... 나머지 로직
}
```

### 5.3 에러 바운더리와 Crashlytics 통합

**위치**: `front/src/components/ErrorBoundary.tsx` (신규 생성)

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';
import crashlytics from '@react-native-firebase/crashlytics';
import { View, Text, TouchableOpacity } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Crashlytics에 에러 리포팅
    crashlytics().recordError(error, {
      componentStack: errorInfo.componentStack,
      type: 'React Error Boundary',
    });

    crashlytics().log(`🔥 React Error: ${error.message}`);
    crashlytics().log(`Component Stack: ${errorInfo.componentStack}`);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>문제가 발생했습니다</Text>
          <Text style={{ color: 'gray', marginBottom: 20, textAlign: 'center' }}>
            {this.state.error?.message}
          </Text>
          <TouchableOpacity
            onPress={this.handleReset}
            style={{ backgroundColor: '#007AFF', padding: 12, borderRadius: 8 }}
          >
            <Text style={{ color: 'white' }}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

**App.tsx에 적용**:

```typescript
import ErrorBoundary from '@/components/ErrorBoundary';

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <GestureHandlerRootView style={{ flex: 1 }}>
          {/* ... 기존 코드 */}
        </GestureHandlerRootView>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
```

---

## 6. 테스팅 가이드

### 6.1 개발 중 이벤트 확인

1. **DebugView 활성화**

iOS (Xcode):
```bash
# Edit Scheme > Run > Arguments > Arguments Passed On Launch
-FIRAnalyticsDebugEnabled
```

Android (터미널):
```bash
adb shell setprop debug.firebase.analytics.app com.snaplink
adb shell setprop log.tag.FA VERBOSE
adb shell setprop log.tag.FA-SVC VERBOSE
```

2. **Firebase Console에서 확인**
   - Analytics > DebugView
   - 실시간으로 이벤트 확인

### 6.2 이벤트 로깅 테스트

```typescript
// 테스트용 헬퍼
export const testAnalytics = async () => {
  await analytics().logEvent('test_event', {
    test_parameter: 'test_value',
  });

  console.log('✅ Test event logged. Check Firebase DebugView.');
};
```

### 6.3 Crashlytics 테스트

```typescript
// 테스트 크래시 (실제 크래시 발생)
crashlytics().crash();

// Non-fatal 에러 테스트 (크래시 없이)
crashlytics().recordError(new Error('Test error'), {
  testAttribute: 'testValue',
});
```

---

## 7. 주의사항

### 7.1 PII (개인 식별 정보) 로깅 금지

❌ **절대 로깅하면 안 되는 정보**:
- 이메일 주소
- 전화번호
- 주민등록번호
- 비밀번호
- 신용카드 정보

✅ **대신 사용할 것**:
- 사용자 ID (익명화된 고유 식별자)
- 해시된 값
- 카테고리 정보

### 7.2 이벤트 파라미터 제한

- 이벤트 이름: 최대 40자
- 파라미터 이름: 최대 40자
- 파라미터 값 (문자열): 최대 100자
- 앱당 이벤트 종류: 최대 500개

### 7.3 성능 고려사항

```typescript
// ❌ 나쁜 예: 동기 블로킹
await analytics().logEvent('event_name', params);
doSomethingElse(); // logEvent가 완료될 때까지 대기

// ✅ 좋은 예: Fire and forget
analytics().logEvent('event_name', params); // await 제거
doSomethingElse(); // 즉시 실행
```

---

## 8. 체크리스트

### 개발 완료 전 확인사항

- [ ] API 에러 로깅 추가 (`authFetch`, `authMultipartFetch`)
- [ ] User Context 설정 (로그인 시)
- [ ] 주요 액션 Breadcrumb 추가
- [ ] 채팅 메시지 이벤트 추가
- [ ] 작가 응답 이벤트 추가
- [ ] 프로필 퍼널 이벤트 추가
- [ ] 예약 퍼널 이탈 추적
- [ ] User Properties 설정
- [ ] ErrorBoundary 적용
- [ ] DebugView에서 이벤트 확인
- [ ] Crashlytics 테스트 에러 확인

### 배포 후 확인사항

- [ ] Firebase Console에서 DAU/MAU 정상 집계 확인
- [ ] 주요 이벤트 발생 확인 (24시간 내)
- [ ] Crashlytics Crash-free users > 99%
- [ ] 퍼널 분석 설정 및 전환율 확인
- [ ] Retention 지표 확인 (7일 후)

---

**마지막 업데이트**: 2026-01-09
**작성자**: Claude Code
