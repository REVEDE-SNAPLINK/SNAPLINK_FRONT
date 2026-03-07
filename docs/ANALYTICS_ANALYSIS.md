# SNAPLINK Analytics Master Specification & KPI Dashboard Logic

본 문서는 SNAPLINK의 모든 비즈니스 지표(KPI)를 측정하기 위한 데이터 수집 명세 및 대시보드 계산 로직을 기술합니다.

---

## 📊 1. 기본 KPI (App Base Metrics)

앱의 전반적인 활성도와 건강 상태를 측정합니다.

| 지표명 | 정의 및 계산 수식 | 활용 이벤트 및 파라미터 | 권장 차트 |
| :--- | :--- | :--- | :--- |
| **Active Users** | 일/주/월간 활성 유저 수 (DAU/WAU/MAU) | `session_start` 발생 건수 (Unique User Count) | Big Number + 증감률 |
| **Stickiness** | 앱 방문 강도 (DAU / MAU * 100) | `session_start` 기반 유저별 방문 빈도 | Gauge Bar (%) |
| **Session Count** | 유저당 평균 앱 방문 횟수 | `session_start` 총 건수 / `user_id` Unique Count | Line Chart + Histogram |
| **Avg. Duration** | 평균 체류 시간 (세션 시작~종료) | `session_end` 의 `duration_seconds` 중앙값 | Line + Benchmark Line |
| **Screens/Session** | 탐색 깊이 (세션당 화면 전환 수) | 세션 내 `screen_view` 발생 횟수 | Funnel Chart |
| **Retention** | 코호트 리텐션 (D1/D7/D30) | `first_open` 날짜 기준 `session_start` 재발생률 | Cohort Table |
| **App Stability** | Crash-free Users 비율 | Crashlytics 에러 미발생 유저 비율 | Traffic Light (Green/Red) |

---

## 🧲 2. 유입(획득) 및 유로 추적 (Acquisition & UTM)

| 지표명 | 정의 및 계산 수식 | 활용 이벤트 및 파라미터 | 권장 차트 |
| :--- | :--- | :--- | :--- |
| **Acquisition Scale**| 신규 유입 규모 (Install -> Sign-up) | `first_open`, `app_open`, `signup_completed` | Line Chart |
| **Activation Rate** | 첫 방문자 중 의미 있는 행동 수행 비율 | (작가상세 OR 메시지 OR 예약시도 유저) / `first_open` 유저 | Donut Chart |
| **Channel Quality** | 유입 경로별 전환 효율 분석 | `source`, `utm_medium`, `utm_campaign` | Horizontal Bar Chart |
| **Deep Link CVR** | 딥링크 유입 → 목적지 도달 성공률 | `deep_link_open` → `deep_link_landing_resolved` (resolve_success: true) | Vertical Bar Chart |

---

## 🔍 3. 탐색 및 커뮤니티 지표 (Discovery & Community)

| 지표명 | 정의 및 계산 수식 | 활용 이벤트 및 파라미터 | 권장 차트 |
| :--- | :--- | :--- | :--- |
| **Exploration Funnel**| 피드 -> 포스트 -> 프로필 -> 문의 | `community_post_view` -> `portfolio_post_view` -> `photographer_profile_view` -> `chat_initiated` | Funnel Chart |
| **Profile CTR** | 상세 게시물 조회 후 프로필 클릭률 | `photographer_profile_view` / `portfolio_post_view` | Percentage (%) |
| **Engagement** | 게시물당 상호작용 (좋아요/댓글/공유) | `community_post_like`, `community_comment_create`, `community_post_share` | Stacked Bar Chart |
| **Creator Tagging** | 게시물 내 작가 태그 비율/클릭률 | `community_post_view` 중 `has_tagged_user: true` 비율 | Pie Chart |

---

## 💬 4. 문의 및 예약 퍼널 (Conversion Funnel)

| 지표명 | 정의 및 계산 수식 | 활용 이벤트 및 파라미터 | 권장 차트 |
| :--- | :--- | :--- | :--- |
| **Inquiry Funnel** | 문의 시작 -> 첫 메시지 -> 작가 응답 | `chat_initiated` -> `chat_message_sent` -> `photographer_response` | Funnel Chart |
| **Booking Funnel** | 예약 의도 -> 폼 제출 -> 확정 | `booking_intent` -> `booking_request_submitted` -> `booking_confirmed` | Funnel Chart |
| **Churn Analysis** | 예약 폼 단계별 이탈 지점 분석 | `booking_form_abandoned` 의 `step` 파라미터 | Horizontal Bar Chart |
| **Cancellation** | 예약 확정 후 취소 주체 및 비율 | `booking_cancelled_by_user`, `booking_cancelled_by_photographer`, `booking_rejected_by_photographer` | Pie Chart |

---

## 👨‍🎨 5. 공급자(작가) 관리 지표 (Supply Metrics)

| 지표명 | 정의 및 계산 수식 | 활용 이벤트 및 파라미터 | 권장 차트 |
| :--- | :--- | :--- | :--- |
| **Active Creators** | 활동 작가 (로그인 vs 응답 작가) | `user_type: photographer` 인 유저의 `app_open` vs `photographer_response` | Stacked Area Chart |
| **Response Rate** | 문의 대비 작가 응답 완료율 | `photographer_response` 건수 / `chat_initiated` 건수 | Gauge Chart (Green/Amber/Red) |
| **Response Time** | 첫 응답까지 걸린 시간 (중앙값) | `photographer_first_response_time` 의 `response_time_seconds` | Horizontal Bar + Top 10 Table |
| **Profile Quality** | 예약 가능 상태 유지 비율 | `shooting_service_action` 및 `personal_schedule_created` 빈도 | Donut Chart |

---

## 🏢 6. B2B 웹사이트 트래킹 (Web Funnel)

*참고: 웹사이트는 GA4 웹 태그를 통해 별도 수집되며, 앱과 User ID를 통합하여 분석합니다.*

| 지표명 | 정의 및 계산 수식 | 활용 이벤트 및 파라미터 | 권장 차트 |
| :--- | :--- | :--- | :--- |
| **Web Sessions** | 웹 방문 규모 (Users & Sessions) | `page_view`, `session_start` (Web 전용) | Dual Axis Combo Chart |
| **Lead Funnel** | 랜딩 -> 상세 -> 폼 진입 -> 제출 | `landing_view` -> `service_view` -> `web_inquiry_start` -> `web_form_submit` | Funnel Chart |
| **Lead Quality** | 행사 유형 및 지역별 리드 분포 | 리드 폼 제출 데이터의 `event_type`, `region` 속성 | Pie Chart |

---

## 🛠 7. 데이터 수집 가이드 및 파라미터 활용

### 7.1 Source Chain (이동 경로 추적)
모든 전환율 측정의 핵심 파라미터인 `source`는 아래와 같이 체인 형태로 관리합니다.
- **Home Click**: `source: "home_feed_latest"`
- **Post -> Profile**: `source: "post_detail_via_home"`
- **Profile -> Booking**: `source: "[이전화면소스]_profile"`

### 7.2 필수 User Properties
필터 환경(기간/유형) 연동을 위해 모든 이벤트에 아래 속성이 공유됩니다.
- `user_id`: 고유 식별자
- `user_type`: `user` | `photographer` | `guest`
- `platform`: `ios` | `android` | `web`
- `is_verified_photographer`: 작가 승인 여부

---

> **Document Metadata**
> - Update Level: Full KPI Mapping (Ver 2.3)
> - Generated for: Admin Dashboard Implementation
> - Last Updated: 2026-03-08

---

## 📌 관련 문서

| 문서 | 설명 |
|------|------|
| [firebase_tracking_data.md](./firebase_tracking_data.md) | 이벤트/파라미터 수집 명세서 (구현 상세) |
| [firebase_tracking_todo.md](./firebase_tracking_todo.md) | 서버/DB 조인 필요 항목 (TODO) |
