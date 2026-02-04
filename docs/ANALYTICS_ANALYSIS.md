# Firebase Analytics & Crashlytics 현황 분석 보고서

## 📊 현재 구현 상태

### 1. Firebase 패키지 설치 현황
- ✅ `@react-native-firebase/analytics` v23.7.0
- ✅ `@react-native-firebase/app` v23.7.0
- ✅ `@react-native-firebase/crashlytics` v23.7.0
- ✅ `@react-native-firebase/messaging` v23.7.0

### 2. Analytics 초기화 및 설정

#### App.tsx
```typescript
// ✅ 앱 시작 시 app_open 이벤트 로깅
useEffect(() => {
  await analytics().logEvent('app_open');
}, []);
```

#### Navigation (index.tsx)
```typescript
// ✅ 세션 추적 (AppState 기반)
- session_start: 앱이 active 상태로 전환될 때
- session_end: 앱이 background로 전환될 때 (duration_seconds 포함)

// ✅ 화면 추적
- screen_view: 모든 화면 전환 시 자동 로깅
  - screen_name, platform, user_id, user_type, session_start_timestamp

// ⚠️ Crashlytics 사용 제한적
- crashlytics().log('App opened') 한 번만 사용
```

### 3. 현재 추적 중인 이벤트 (총 53개)

#### 사용자 인증 및 가입
- ✅ `login` - 로그인 시
- ✅ `sign_up` - 회원가입 시
- ❌ **MISSING**: 회원가입 단계별 이탈률 (회원가입 퍼널)
- ❌ **MISSING**: 소셜 로그인 유형 구분 (카카오/기타)

#### 작가 프로필 조회
- ✅ `photographer_profile_view` - 작가 프로필 페이지 진입
- ✅ `photographer_view` - 작가 정보 조회
- ✅ `search_photographer` - 작가 검색
- ✅ `profile_portfolio_clicked` - 프로필 내 포트폴리오 클릭 (photographer_id, portfolio_id, user_id, user_type, source)
- ✅ `profile_review_tab_clicked` - 리뷰 탭 클릭 (photographer_id, user_id, user_type)
- ✅ `profile_scroll_depth` - 스크롤 깊이 추적 (photographer_id, depth_percentage: 25/50/75/100, user_id, user_type)

#### AI 추천
- ✅ `ai_recommendation_start` - AI 추천 시작
- ✅ `ai_recommendation_input` - AI 추천 입력
- ✅ `ai_recommendation_result_view` - AI 추천 결과 조회
- ❌ **MISSING**: AI 추천 결과에서 작가 프로필 클릭률
- ❌ **MISSING**: AI 추천을 통한 예약 전환율

#### 예약 프로세스 (Inquiry Funnel)
- ✅ `booking_intent` - 예약 의도 (예약하기 버튼 클릭)
- ✅ `booking_request_submitted` - 예약 요청 제출
- ✅ `booking_confirmed` - 예약 확정
- ✅ `booking_detail_view` - 예약 상세 조회
- ✅ `booking_form_abandoned` - 예약 폼 이탈 추적
  - step: 'product_selection' (날짜/시간/상품 선택 단계)
  - step: 'request_details' (요청 상세 입력 단계)
  - time_spent_seconds, had_date, had_time, had_product, had_region 포함

#### 채팅 (Chat-based Inquiry)
- ✅ `chat_initiated` - 채팅 시작
- ✅ `activation_chat_entered` - 활성화 채팅방 진입
- ✅ `chat_message_sent` - 메시지 전송 (user_id, room_id, is_first_message, message_length, message_count)
- ✅ `photographer_response` - 작가 응답 (photographer_id, room_id, is_first_response, response_time_seconds)
- ✅ `photographer_first_response_time` - 작가 첫 응답 시간 (response_time_seconds, response_time_minutes)

#### 작가 예약 관리
- ✅ `photographer_booking_approved` - 작가가 예약 승인
- ✅ `photographer_booking_rejected` - 작가가 예약 거절
- ✅ `photographer_booking_completed` - 촬영 완료
- ✅ `photographer_booking_detail_view` - 작가 예약 상세 조회
- ❌ **MISSING**: 작가 응답률 계산 (24시간 내 응답 여부)
- ❌ **MISSING**: 평균 응답 시간

#### 사진 업로드 및 다운로드
- ✅ `photographer_booking_photos_uploaded` - 사진 업로드
- ✅ `photographer_booking_photos_added` - 사진 추가
- ✅ `photographer_booking_photos_deleted` - 사진 삭제
- ✅ `photographer_booking_photos_view` - 사진 조회
- ✅ `photo_download_start` - 사진 다운로드 시작
- ✅ `photo_zip_download_start` - ZIP 다운로드 시작

#### 리뷰
- ✅ `review_start` - 리뷰 작성 시작
- ✅ `review_create_complete` - 리뷰 작성 완료
- ✅ `review_edit_start` - 리뷰 수정 시작
- ✅ `review_edit_complete` - 리뷰 수정 완료
- ✅ `review_view` - 리뷰 조회
- ❌ **MISSING**: 리뷰 작성 완료율 (시작 대비)

#### 커뮤니티
- ✅ `community_post_view` - 커뮤니티 게시글 조회
- ✅ `community_post_like` - 좋아요
- ✅ `community_post_share` - 공유
- ✅ `community_post_edit` - 게시글 수정
- ✅ `community_post_delete` - 게시글 삭제
- ✅ `community_comment_create` - 댓글 작성
- ✅ `community_comment_edit` - 댓글 수정
- ✅ `community_comment_delete` - 댓글 삭제

#### 포트폴리오
- ✅ `portfolio_post_view` - 포트폴리오 조회
- ✅ `portfolio_post_created` - 포트폴리오 생성
- ✅ `portfolio_post_updated` - 포트폴리오 수정
- ✅ `portfolio_post_deleted` - 포트폴리오 삭제

#### 북마크
- ✅ `bookmark_toggle` - 북마크 토글

#### 작가 일정 관리
- ✅ `personal_schedule_created` - 개인 일정 생성
- ✅ `personal_schedule_updated` - 개인 일정 수정
- ✅ `personal_schedule_deleted` - 개인 일정 삭제
- ✅ `personal_schedule_duplicated` - 개인 일정 복제
- ✅ `shooting_service_action` - 촬영 서비스 액션

---

## 🚨 주요 누락 KPI 지표

### 1. DAU/WAU/MAU (Daily/Weekly/Monthly Active Users)
- **현재 상태**: ❌ 자동 추적 가능하지만 명시적 이벤트 없음
- **권장사항**: Firebase Analytics의 자동 추적 활용 (별도 이벤트 불필요)
- **확인 방법**: Firebase Console > Analytics > Events > "first_open", "user_engagement"

### 2. Session Metrics
- **현재 상태**: ✅ `session_start`, `session_end` 추적 중
- **추가 필요**:
  - Average session duration (Firebase 자동 계산)
  - Sessions per user (Firebase 자동 계산)

### 3. Retention (D1/D7/D30)
- **현재 상태**: ❌ 명시적 추적 없음
- **권장사항**: Firebase Analytics 자동 계산 활용
- **확인 방법**: Firebase Console > Analytics > Retention

### 4. Creator Profile View Funnel (작가 프로필 조회 퍼널)
현재: `photographer_profile_view` ✅
누락:
- ❌ 프로필 내 포트폴리오 클릭
- ❌ 프로필 내 리뷰 탭 클릭
- ❌ 프로필 내 스크롤 깊이
- ❌ 프로필 조회 → 채팅 시작 전환율
- ❌ 프로필 조회 → 예약 시작 전환율

### 5. Inquiry Funnel (채팅 기반 문의 퍼널)
현재: `chat_initiated` ✅, `booking_intent` ✅, `booking_request_submitted` ✅, `booking_confirmed` ✅
누락:
- ❌ 채팅 메시지 전송 (첫 메시지, 이후 메시지)
- ❌ 작가 응답 (첫 응답, 응답 시간)
- ❌ 채팅 → 예약 전환 (채팅에서 "예약하기" 클릭)
- ❌ 각 단계 이탈률

### 6. Community Interaction Tracking
현재: 게시글/댓글 액션 추적 ✅
누락:
- ❌ 피드 스크롤 깊이
- ❌ 카테고리별 조회 시간
- ❌ 외부 공유 성공률

### 7. Creator Metrics (작가 지표)
현재: 예약 승인/거절 ✅
누락:
- ❌ **응답률**: 24시간 내 첫 응답률 계산
- ❌ **평균 응답 시간**: 채팅 메시지 수신 → 작가 응답 시간
- ❌ **예약 승인률**: 승인 / (승인 + 거절)
- ❌ **리뷰 평균 평점 변화 추적**

### 8. Error & Crash Tracking
- **현재 상태**: ✅ Crashlytics 완전 통합 완료
- **구현 완료**:
  - ✅ API 에러 자동 로깅 (utils.ts의 authFetch, authMultipartFetch)
    - 4xx/5xx 에러 자동 recordError
    - Network 에러 자동 로깅
    - URL, status, method, responseText 포함
  - ✅ 사용자 컨텍스트 설정 (authStore.ts)
    - setUserId on login/signup
    - setAttributes (userType, loginMethod, signupDate)
  - ✅ ErrorBoundary 구현 (src/components/ErrorBoundary.tsx)
    - React 컴포넌트 에러 자동 캐치
    - Component stack trace 포함
    - 사용자에게 에러 UI 표시 및 복구 옵션
  - ✅ Breadcrumb 로깅
    - 채팅 메시지 전송/수신
    - 프로필 포트폴리오 클릭
    - 리뷰 탭 클릭

---

## 🔧 개선 권장사항

### 1. Crashlytics 활용 강화 (HIGH PRIORITY)

#### API 에러 로깅
```typescript
// src/api/utils.ts 또는 공통 fetch wrapper
export const authFetch = async (url: string, options?: RequestInit) => {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      // Log non-fatal error to Crashlytics
      crashlytics().recordError(new Error(`API Error: ${response.status} ${url}`), {
        url,
        status: response.status,
        method: options?.method || 'GET',
      });
    }

    return response;
  } catch (error) {
    // Log network errors
    crashlytics().recordError(error as Error, {
      url,
      type: 'NetworkError',
    });
    throw error;
  }
};
```

#### User Context 설정
```typescript
// src/store/authStore.ts (로그인 시)
crashlytics().setUserId(userId);
crashlytics().setAttributes({
  userType: userType,
  email: email,
});
```

#### Breadcrumb 추적
```typescript
// 주요 액션 시
crashlytics().log('User opened photographer profile');
crashlytics().log('User started booking process');
crashlytics().log('User sent chat message');
```

### 2. 누락된 이벤트 추가 (HIGH PRIORITY)

#### 채팅 메시지 전송
```typescript
// ChatDetailsContainer.tsx
const handleSendMessage = () => {
  analytics().logEvent('chat_message_sent', {
    user_id: userId,
    room_id: roomId,
    is_first_message: messageCount === 0,
    message_length: message.length,
  });

  // 기존 메시지 전송 로직
};
```

#### 작가 응답 시간 추적
```typescript
// 채팅 메시지 수신 시 (WebSocket handler)
const onMessageReceived = (message) => {
  if (message.senderType === 'PHOTOGRAPHER') {
    const responseTime = Date.now() - lastUserMessageTime;

    analytics().logEvent('photographer_response', {
      photographer_id: photographerId,
      response_time_seconds: responseTime / 1000,
      is_first_response: isFirstResponse,
    });
  }
};
```

#### 프로필 퍼널 추적
```typescript
// PhotographerDetailsContainer.tsx
const handlePressPortfolioItem = (portfolioId) => {
  analytics().logEvent('profile_portfolio_clicked', {
    photographer_id: photographerId,
    portfolio_id: portfolioId,
    source: 'profile_page',
  });
};

const handlePressReviewTab = () => {
  analytics().logEvent('profile_review_tab_clicked', {
    photographer_id: photographerId,
  });
};

// 스크롤 깊이 추적
const handleScroll = (event) => {
  const scrollPercentage = calculateScrollPercentage(event);
  if (scrollPercentage > 50 && !scrollTracked50) {
    analytics().logEvent('profile_scroll_depth', {
      photographer_id: photographerId,
      depth: 50,
    });
    setScrollTracked50(true);
  }
};
```

#### 예약 퍼널 이탈 추적
```typescript
// BookingContainer.tsx
useEffect(() => {
  analytics().logEvent('booking_form_opened', {
    photographer_id: photographerId,
    product_id: productId,
  });

  return () => {
    // 예약 완료 없이 나가는 경우
    if (!bookingCompleted) {
      analytics().logEvent('booking_form_abandoned', {
        photographer_id: photographerId,
        product_id: productId,
        step: currentStep,
      });
    }
  };
}, []);
```

### 3. User Properties 설정

```typescript
// 로그인 시 사용자 속성 설정
analytics().setUserProperties({
  user_type: userType, // 'user' | 'photographer'
  signup_date: signupDate,
  is_photographer_verified: isVerified,
  total_bookings: totalBookings,
});
```

### 4. 커스텀 퍼널 정의

Firebase Console에서 다음 퍼널들을 정의:

#### 예약 퍼널
1. `photographer_profile_view`
2. `booking_intent`
3. `booking_request_submitted`
4. `booking_confirmed`

#### 채팅 기반 문의 퍼널
1. `photographer_profile_view`
2. `chat_initiated`
3. `chat_message_sent`
4. `photographer_response`
5. `booking_intent` (from chat)
6. `booking_confirmed`

#### 리뷰 작성 퍼널
1. `photographer_booking_completed`
2. `review_start`
3. `review_create_complete`

---

## 📱 Firebase Console 확인 가이드

### 1. DAU/WAU/MAU 확인
1. Firebase Console 접속
2. Analytics > Dashboard
3. "Active users" 카드 확인
4. 시간 범위 조정: 1일(DAU), 7일(WAU), 30일(MAU)

### 2. Retention 확인
1. Analytics > Retention
2. "All users" cohort 선택
3. Day 1, Day 7, Day 30 retention 확인

### 3. 이벤트 분석
1. Analytics > Events
2. 이벤트별 발생 횟수, 사용자 수 확인
3. 특정 이벤트 클릭 → 세부 파라미터 분석

### 4. 퍼널 분석
1. Analytics > Funnels
2. "Create funnel" 클릭
3. 이벤트 시퀀스 정의 (예: profile_view → booking_intent → booking_confirmed)
4. 각 단계별 전환율 및 이탈률 확인

### 5. User Properties 분석
1. Analytics > Latest Release > User properties
2. user_type, signup_date 등 커스텀 속성 확인
3. 속성별 세그먼트 분석

### 6. Crashlytics 확인
1. Crashlytics > Dashboard
2. Crash-free users 비율 확인
3. 크래시 목록 → 발생 빈도, 영향 사용자 수 확인
4. 특정 크래시 선택 → 스택 트레이스, 로그 확인

### 7. 실시간 모니터링
1. Analytics > DebugView (개발 중)
2. Analytics > Realtime (프로덕션)
3. 현재 활성 사용자 및 이벤트 실시간 확인

---

## 🎯 우선순위별 액션 아이템

### ✅ COMPLETED (2026-01-09 구현 완료)
1. ✅ **Crashlytics 에러 로깅 강화**
   - ✅ API 에러 자동 로깅 (authFetch, authMultipartFetch)
   - ✅ User context 설정 (userId, userType, loginMethod, signupDate)
   - ✅ Breadcrumb 추적 (채팅, 프로필 액션)
   - ✅ ErrorBoundary 구현 및 App.tsx 적용

2. ✅ **채팅 이벤트 추가**
   - ✅ `chat_message_sent` (is_first_message, message_count, message_length)
   - ✅ `photographer_response` (response_time_seconds, is_first_response)
   - ✅ `photographer_first_response_time` (분/초 단위)

3. ✅ **프로필 퍼널 추적**
   - ✅ `profile_portfolio_clicked` (포트폴리오 클릭)
   - ✅ `profile_review_tab_clicked` (리뷰 탭 클릭)
   - ✅ `profile_scroll_depth` (25%, 50%, 75%, 100% 추적)

4. ✅ **예약 퍼널 이탈 추적**
   - ✅ `booking_form_abandoned` (product_selection 단계)
   - ✅ `booking_form_abandoned` (request_details 단계)
   - ✅ time_spent_seconds, 각 필드 입력 여부 추적

5. ✅ **User Properties & Analytics 설정**
   - ✅ setUserProperties (user_type, signup_date)
   - ✅ Crashlytics attributes (userType, loginMethod, signupDate)

### 🟢 LOW PRIORITY (필요 시)
1. ✅ 커뮤니티 인게이지먼트 심화
   - 스크롤 깊이
   - 카테고리별 체류 시간

2. ✅ A/B 테스팅 준비
   - Firebase Remote Config 연동
   - 실험 그룹 분리

---

## 📊 Mixpanel 도입 검토

현재 Firebase Analytics만으로도 대부분의 KPI 추적 가능하지만, 다음 경우 Mixpanel 추가 고려:

### Mixpanel이 더 나은 경우
1. **사용자 여정 분석**: 복잡한 멀티 터치 퍼널 분석
2. **코호트 분석**: 세밀한 사용자 세그먼트 분석
3. **리텐션 분석**: 더 직관적인 리텐션 대시보드
4. **실시간 알림**: 특정 이벤트 발생 시 슬랙/이메일 알림

### 현재 Firebase만으로 충분한 이유
- 기본 KPI (DAU/MAU, Retention) 추적 가능
- 퍼널 분석 지원
- Crashlytics 통합
- 무료 티어로도 충분한 이벤트 볼륨
- 추가 SDK 통합 불필요

**권장**: 현재는 Firebase Analytics 활용도를 높이고, 추후 필요 시 Mixpanel 도입

---

## 📝 체크리스트

### 현재 구현 완료
- [x] Firebase Analytics 설치 및 초기화
- [x] 기본 세션 추적 (session_start, session_end)
- [x] 화면 추적 (screen_view)
- [x] 주요 사용자 액션 추적 (47개 이벤트)
- [x] 예약 퍼널 기본 추적

### 2026-01-09 구현 완료
- [x] **Crashlytics 에러 로깅 강화** (utils.ts)
  - [x] API 에러 자동 로깅 (4xx/5xx, network errors)
  - [x] User context 설정 (authStore.ts)
  - [x] ErrorBoundary 구현 및 적용 (App.tsx)
- [x] **채팅 이벤트 추가** (ChatDetailsContainer.tsx)
  - [x] chat_message_sent (메시지 전송)
  - [x] photographer_response (작가 응답)
  - [x] photographer_first_response_time (첫 응답 시간)
- [x] **프로필 퍼널 상세 추적** (PhotographerDetailsContainer.tsx)
  - [x] profile_portfolio_clicked (포트폴리오 클릭)
  - [x] profile_review_tab_clicked (리뷰 탭 클릭)
  - [x] profile_scroll_depth (스크롤 깊이 25/50/75/100%)
- [x] **예약 퍼널 이탈 추적** (BookingContainer.tsx, BookingRequestContainer.tsx)
  - [x] booking_form_abandoned (product_selection 단계)
  - [x] booking_form_abandoned (request_details 단계)
  - [x] time_spent_seconds 및 필드 입력 상태 추적
- [x] **User Properties 설정** (authStore.ts)
  - [x] Analytics user properties (user_type, signup_date)
  - [x] Crashlytics attributes (userType, loginMethod, signupDate)

### 추가 개선 가능 항목
- [ ] 커뮤니티 스크롤 깊이 추적
- [ ] 작가 승인률 계산 로직
- [ ] A/B 테스팅을 위한 Firebase Remote Config 연동

---

---

## 🎉 최종 구현 상태 (2026-01-09)

### 구현 완료 항목
1. **API 에러 모니터링**: authFetch, authMultipartFetch에서 모든 4xx/5xx 및 네트워크 에러 자동 로깅
2. **사용자 컨텍스트**: 로그인/회원가입 시 userId, userType, loginMethod, signupDate 자동 설정
3. **채팅 추적**: 메시지 전송, 작가 응답 시간 (첫 응답 포함) 완전 추적
4. **프로필 퍼널**: 포트폴리오 클릭, 리뷰 탭 클릭, 스크롤 깊이 (4단계) 추적
5. **예약 이탈 분석**: 2단계 퍼널 (상품 선택 / 요청 상세) 각각 이탈 시간 및 진행 상태 추적
6. **ErrorBoundary**: React 컴포넌트 에러 자동 캐치 및 Crashlytics 리포팅

### 추적 가능한 주요 KPI
- ✅ DAU/MAU (Firebase 자동 계산)
- ✅ Retention (D1/D7/D30) (Firebase 자동 계산)
- ✅ Session duration (Firebase 자동 계산)
- ✅ 예약 퍼널 전환율 및 이탈률
- ✅ 채팅 응답 시간 (작가 응답률 계산 가능)
- ✅ 프로필 인게이지먼트 (포트폴리오 클릭률, 리뷰 조회율, 스크롤 깊이)
- ✅ API 에러율 및 크래시 발생률

### Firebase Console 주요 확인 지표
1. **Analytics > Dashboard**: DAU, 활성 사용자, 상위 이벤트
2. **Analytics > Events**: 53개 이벤트 발생 현황
3. **Analytics > Funnels**: 예약 퍼널, 채팅 퍼널 전환율
4. **Crashlytics > Dashboard**: Crash-free users, 에러 발생 빈도
5. **Analytics > User properties**: user_type별 세그먼트 분석

---

생성 일시: 2026-01-09
최종 업데이트: 2026-01-09 (구현 완료 후)
작성자: Claude Code
