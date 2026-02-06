# SNAPLINK Analytics Master Specification

본 문서는 SNAPLINK 프로젝트의 모든 수집 데이터를 상세히 기술한 마스터 명세서입니다.

---

## � 1. Global Context & User Properties

모든 이벤트에 공통적으로 포함되거나, 사용자별로 고정된 속성입니다.

### 1.1 User Properties (Firebase Analytics)
사용자의 세그먼트를 분류하는 핵심 기준입니다.
- `user_id` (String): 시스템 내 고유 식별자
- `user_type` (String): `user` (일반 고객) | `photographer` (작가)
- `signup_date` (String): ISO Date (`YYYY-MM-DD`)
- `is_photographer_verified` (Boolean): 작가 승인 여부

### 1.2 User Attributes (Crashlytics)
에러 발생 시 추적을 위한 맥락 정보입니다.
- `userId` (String)
- `userType` (String)
- `loginMethod` (String): `kakao` | `apple` | `test_account`
- `signupDate` (String)

### 1.3 Global System Events
앱의 전반적인 활성도와 체류 시간을 측정합니다.
- `app_open`: `{ user_id: String, user_type: String, platform: String }` (앱 첫 실행)
- `session_start`: (파라미터 없음, 세션 발생 시점 기록)
- `session_end`: `{ duration_seconds: Number }` (실제 앱 체류 시간)
- `screen_view`: `{ screen_name: String, platform: String, user_id: String, user_type: String }` (화면 전환 로그)

---

## 📈 2. Domain-Specific Event Specification

이 항목들은 AI가 차트와 지표(Metric)를 생성할 때 참조할 실제 이벤트 데이터 구조입니다.

### 2.1 상호작용 및 검색 (Discovery & Interaction)

| 이벤트명 | 파라미터 구조 (Key: Type) | 비즈니스 의미 |
| :--- | :--- | :--- |
| `search_photographer` | `{ search_key: String, user_id: String, user_type: String, source: "SearchPhotographer" }` | 검색어 트렌드 및 검색량 분석 |
| `photographer_profile_view` | `{ photographer_id: String, user_id: String, user_type: String, source: String }` | 작가별 인기도 및 프로필 도달률 |
| `profile_portfolio_clicked` | `{ photographer_id: String, portfolio_id: Number, user_id: String, user_type: String, source: "profile_page" }` | 포트폴리오 CTR(클릭률) 분석 |
| `profile_review_tab_clicked` | `{ photographer_id: String, user_id: String, user_type: String }` | 리뷰 섹션 관심도 측정 |
| `profile_scroll_depth` | `{ photographer_id: String, depth_percentage: Number(25/50/75/100), user_id: String, user_type: String }` | 콘텐츠 가독성 및 이탈 지점 파악 |

### 2.2 AI 추천 엔진 (AI Recommendation)

| 이벤트명 | 파라미터 구조 | 비즈니스 의미 |
| :--- | :--- | :--- |
| `ai_recommendation_start` | `{ user_id: String, user_type: String, screen: "AIRecommdationForm" }` | AI 기능 유입률 |
| `ai_recommendation_result_view` | `{ user_id: String, user_type: String, prompt: String, result_count: Number, screen: "AIRecommdationResult" }` | 추천 엔진의 공급량 및 질 분석 |
| `photographer_profile_view` | `source: "AIRecommdationResult"` 인 경우만 필터링 | AI 추천 상품의 클릭 전환율(CVR) |

### 2.3 예약 퍼널 (Booking Funnel - Client Side)

AI는 이 데이터를 기반으로 **단계별 전환/이탈 대시보드**를 생성해야 합니다.

| 이벤트명 | 파라미터 구조 | 비즈니스 의미 |
| :--- | :--- | :--- |
| `booking_intent` | `{ user_id: String, user_type: String, photographer_id: String, source: String, entry_source: String }` | 예약 프로세스 진입 (퍼널 1단계) |
| `booking_form_abandoned` | `{ step: "product_selection"\|"request_details", time_spent_seconds: Number, had_date: Bool, had_time: Bool, had_product: Bool, had_region: Bool, ... }` | **이탈 분석 핵심 데이터**. 특정 필드 입력 중 포기 여부 확인 가능 |
| `booking_request_submitted` | `{ product_id: Number, shooting_date: String, start_time: String, options: JSON_String, region: String, ... }` | 예약 성공 시도 (퍼널 2단계) |
| `booking_confirmed` | (Submitted와 동일 구조) | 실제 거래 성사 (퍼널 최종단계) |

### 2.4 채팅 및 응답성 (Chat & Responsiveness)

| 이벤트명 | 파라미터 구조 | 비즈니스 의미 |
| :--- | :--- | :--- |
| `chat_initiated` | `{ photographer_id: String, room_id: Number, source: String, entry_source: String }` | 신규 문의 시작율 |
| `chat_message_sent` | `{ is_first_message: Bool, message_length: Number, message_count: Number, ... }` | 대화 활성도 및 문의 깊이 분석 |
| `photographer_response` | `{ response_time_seconds: Number, is_first_response: Bool, ... }` | **작가 응답 시간 분석**. 응답 지연 작가 파악용 |
| `photographer_first_response_time` | `{ response_time_seconds: Number, response_time_minutes: Number }` | 고객 대기 시간 통계 |

### 2.5 작가 관리 및 서비스 품질 (Creator Management)

| 이벤트명 | 파라미터 구조 | 비즈니스 의미 |
| :--- | :--- | :--- |
| `shooting_service_action` | `{ action_type: "create"\|"edit"\|"delete"\|"edit_schedule", product_id?: Number }` | 작가의 상품 관리 활성도 |
| `personal_schedule_created` | `{ start_date: String, end_date: String, title: String }` | 작가의 일정 관리(휴무/개인일정) 빈도 |
| `photographer_original_zip_uploaded`| `{ bookingId: Number, file_name: String }` | 최종 결과물 전달 속도(Lead Time) 측정 |
| `photographer_booking_approved` | `{ bookingId: Number }` | 예약 승인율 지표 |

### 2.6 커뮤니티 (Community)

| 이벤트명 | 파라미터 구조 | 비즈니스 의미 |
| :--- | :--- | :--- |
| `community_post_view` | `{ post_id: Number, author_id: String, category: String }` | 카테고리별 콘텐츠 인기 순위 |
| `community_post_like` | `{ liked: Bool }` | 사용자 반응률 |
| `community_comment_create` | `{ is_reply: Bool, parent_comment_id?: Number }` | 커뮤니티 결속력 및 활발함 정도 |

---

## 🆘 3. Error & Reliability (Crashlytics)

대시보드에서 **시스템 성능** 섹션을 구성할 때 사용합니다.

### 3.1 Network / API Error
- `crashlytics().recordError()` 호출 시 다음 Custom Keys 포함:
  - `url` (String): 호출 주소
  - `method` (String): GET, POST, DELETE 등
  - `status` (Number): HTTP Status Code (401, 404, 500 등)
  - `responseText` (String): 실패 원인에 대한 서버 메시지

---

## 🤖 4. AI Dashboard Prompt Logic (추천 지표)

AI에게 대시보드 생성을 요청할 때 다음 지표(Metrics)를 계산하도록 프롬프트 하세요.

1.  **Retention Rate**: `first_open` 유저 중 N일 뒤 `session_start` 발생 비율 (Firebase 기본)
2.  **Conversion Funnel (예약)**:
    - 1단계: `photographer_profile_view`
    - 2단계: `booking_intent`
    - 3단계: `booking_request_submitted`
    - 4단계: `booking_confirmed` (최종 전환율)
3.  **Chat CVR (문의 전환율)**: `chat_initiated` 발생 유저 중 `booking_confirmed` 발생 비율
4.  **Avg. Response Time**: `photographer_response.response_time_seconds` 합계 / 응답 수
5.  **Churn Analysis**: `booking_form_abandoned` 이벤트의 `step`별 카운팅을 통한 UI 장애물 파악
6.  **Hot Search Keys**: `search_photographer.search_key`의 빈도 분석

---

> **Document Metadata**
> - Generated for: Admin Dashboard AI Generation Prompt
> - Documentation Level: Level 3 (Full Parameter Mapping)
> - Update: 2026-02-06
