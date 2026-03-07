# SNAPLINK 데이터 분석 및 수집 마스터 명세서 (Analytics Master)

본 문서는 SNAPLINK의 비즈니스 지표(KPI)를 분석하기 위한 대시보드 구조와, 이를 뒷받침하는 Firebase Analytics / Crashlytics의 프론트엔드 데이터 수집 명세를 하나로 묶은 통합 문서입니다.

---

## 📊 1. 비즈니스 지표 (KPI) 및 대시보드 설계

앱의 전반적인 활성도, 유입 경로, 사용자 탐색, 예약, 공급자 지표를 위한 기본 방향성입니다.

| 카테고리 | 핵심 지표 (Metrics) | 분석 내용 및 의미 | 활용 데이터(이벤트/파라미터) |
| :--- | :--- | :--- | :--- |
| **기본 활성도** | Active Users, Session Count, Avg. Duration, Retention | 유니크 방문자 수(DAU/MAU)와 이들이 앱에 머무는 강도 확인 | `session_start`, `session_end` `first_open` |
| **획득 & 유입** | Acquisition Scale, Channel Quality, Deep Link CVR | 어떤 마케팅 채널/공유 링크가 실제 회원가입과 딥링크 타겟 도착으로 이어지는가 파악 | `deep_link_open` 등 상세 파라미터 |
| **탐색 경험** | Exploration Funnel, Creator CTR, Engagement | 홈 피드 노출에서 작가 상세 프로필 확인, 커뮤니티 상호작용으로 이어지는 여정 진단 | 각 화면 `_view`, `creator_card_...` |
| **예약 퍼널** | Inquiry Funnel, Booking Form Churn, Cancellation | 문의 시작부터 결제/확정 완료에 이르는 이탈 구간 및 주체별(작가/유저) 파기 원인 분석 | `booking_intent`부터 상태 변화 이벤트 전역 |
| **공급자/웹** | Active Creators, Response Time, Web Lead Funnel | 활동 중인 작가의 응답 성실도 평가 및 B2B 웹사이트 행사 리드 수집률 확보 | `photographer_response...` 등 |

---

## 📝 2. Firebase Analytics 이벤트 및 파라미터 상세 수집 명세

모든 이벤트는 클라이언트 사이드(`utils/analytics.ts`)의 `safeLogEvent` 래핑 함수를 통해 수집됩니다. 각 이벤트와 그에 속한 각 **파라미터**는 철저히 대시보드 분석 목적을 띄고 있습니다.

### 2.1 공통 속성 (User Properties) 및 라이프사이클 이벤트

| 이벤트명 / 동작 | 수집 시점 | 세부 파라미터 명세 | 파라미터 역할 및 수집 목적 |
| :--- | :--- | :--- | :--- |
| **`setUserId`** | 로그인/가입 완료 시 전역 설정 | `userId` | 해당 기기에서 발생하는 모든 후속 오프라인/온라인 행동 이벤트들에 유저 고유 식별자를 매핑하여 한 명의 온전한 유저 행동 여정(User Journey) 선을 완성하기 위함 |
| **`setUserProperties`**| 로그인/가입 완료 시 전역 설정 | `user_type`<br>`signup_date` | `user_type`('user'\|'photographer')별 세그먼트를 분리하고, `signup_date` (YYYY-MM-DD)를 통해 동기들 간의 '가입 코호트 리텐션 곡선'을 추적하기 위함 |
| **`session_start`** | 포그라운드 진입 시 자동 발생 | - | DAU/WAU 측정 및 유저 당 하루 평균 앱 런칭 횟수를 계산하는 절댓값 기준 |
| **`session_end`** | 배경으로 돌리거나 앱을 종료할 때 | `duration_seconds` (Number) | 유저가 해당 1회 세션 동안 앱을 켜두고 활동한 시간(초)을 수치화하여 평균 체류 시간(Avg. Duration)을 분석하기 위함 |
| **`first_open`** / **`app_open`** | 최초 설치 직후 열림 / 이후 일반 실행 | `user_id`, `user_type`, `platform` | 설치 규모 및 누적 구동량을 측정하며, `platform`('ios'\|'android') 값을 통해 OS별 마케팅 효과와 사용자 분포 비율을 추출하기 위함 |
| **`screen_view`** | OS / React Navigation 에 의한 화면 전환 시 | `screen_name`, `platform`, `user_id`, `user_type`, `session_start_timestamp` | 유저의 앱 내 UI/UX 탐색 깊이(Screens/Session)를 파악하고, 어느 특정 경로로 움직이는지 Path Flow Analysis 토폴로지를 구성하기 위함 |

### 2.2 외부 유입 및 딥링크 (Deep Link)

| 이벤트명 / 동작 | 수집 시점 | 세부 파라미터 명세 | 파라미터 역할 및 수집 목적 |
| :--- | :--- | :--- | :--- |
| **`deep_link_open`** | 딥링크(URI/App Link)를 터치하여 강제로 앱이 호출된 최전단 시점 | `link_url` (String)<br>`link_type` ('portfolio' 등)<br>`target_id` (String)<br>`source_channel` (String)<br>`tracking_code` (UUID)<br>`is_first_open_after_install` (Boolean) | **link_url**: 원본 URL 로그 추적<br>**link_type/target_id**: 해당 유입이 특정 포트폴리오 랜딩인지 작가 프로필 랜딩인지 분류<br>**source_channel/tracking_code**: 해당 URL이 카카오톡, 시스템 공유 등 어디서 복사된 것인지 유입 성과(Attribution) 판단<br>**is_first...**: 해당 터치로 인해 마켓을 거쳐 '설치'에 이르게 한 쾌거(Acquisition)인지 파악 |
| **`deep_link_landing_resolved`** | 파싱된 딥링크의 인자를 바탕으로 해당 탭/화면으로의 라우팅 처리가 마무리된 후 | `original_link_type` (String)<br>`resolved_screen` (String)<br>`resolve_success` (Boolean)<br>`fail_reason` (String) | 전달된 딥링크 로직이 정상 작동하여 유저가 약속된 목적지에 도달했는가(CVR)를 감시하고, `resolve_success: false` 시 `fail_reason`(잘못된 인자 유입, 삭제된 게시물 등) 파라미터로 장애/버그 유발 원인을 디버깅 |

### 2.3 회원 인증 및 탐색 인게이지먼트 (Discovery)

| 이벤트명 / 동작 | 수집 시점 | 세부 파라미터 명세 | 파라미터 역할 및 수집 목적 |
| :--- | :--- | :--- | :--- |
| **`login`** / **`sign_up`** | 소셜 로그인 API가 종결되고 로컬 앱 캐시에 토큰이 들어오는 시점 | `method` ('naver', 'apple', 'test_account')<br>`user_type`, `signup_date` | `method` 파라미터로 어떤 소셜 인증 공급사 의존도가 높은지 점유율을 계산하기 위함 |
| **`home_feed_view`** | 메인 홈 탭 진입 피드 로딩 후 | - | 시작 허브 화면 도달률 및 피드 조회 횟수 파악 |
| **`creator_card_impression`** | 피드 내에서 작가 카드가 화면 뷰포트에 보여질 때 (30초 중복 핑 방지) | `photographer_id` (String)<br>`source` (String)<br>`feed_type` (String)<br>`rank_index` (Number) | **photographer_id/feed_type**: 인기 작가나 추천 작가 등 누구의 카드가 많이 뿌려졌는지 현황 파악<br>**source/rank_index**: 목록에서 몇 번째 줄(순서)에서 가장 노출 빈도가 높은지 피드 구성력의 UI 효율을 검증 |
| **`creator_card_click`** | 위 카드 중 하나를 유저가 터치했을 때 | 노출 이벤트 파라미터와 동일 | Impression 대비 실질 클릭률(CTR 매트릭스)을 구성하여 해당 작가 썸네일 포트폴리오의 매력도를 수학적으로 계량화 |
| **`search_photographer`** | 유저가 검색어를 치고 찾기 버튼을 액션 | `search_key` (String)<br>`result_count` (Number) | `search_key`에 들어간 지역/스타일 단어를 수집하여 유저들의 수요 트렌드를 읽어내고, `result_count: 0`인 실패 키워드들을 발굴하여 공급 확충 전략에 반영 |
| **`search_result_view`** | 검색 후 결과 리스트 페이지 렌더링 | 파라미터 동일 | 위 요청 대비 실제 렌더링 완료 전환률 |
| **`ai_recommendation_start`** | AI 추천 시작 버튼을 눌렀을 때 | `prompt` (String) | `prompt` 텍스트로 사용자가 AI에 어떤 긴 맥락의 요청을 내리는지 요구사항 유형화 |
| **`photographer_profile_view`** | 검색이나 피드를 넘어 상세 프로필 도달 | `photographer_id`, `source` | 최종적으로 작가 개인 페이지의 일간/주간 트래픽을 합산하고, 유입 매체(`source`)별 트래픽 셰어 비중 확인 |
| **`share_link_created`** | 포트폴리오 뷰 등에서 앱 내 [외부로 공유] 액션을 취했을 때 | `link_type`, `target_id`<br>`share_channel` ('system_share')<br>`tracking_code` (UUID) | 바이럴 확산력을 재기 위해 발급된 `tracking_code`를 서버 측 딥링크 유입 이벤트와 조인하여 K-factor 증폭 계간 산출 |
| **`bookmark_toggle`** | 찜하기 버튼 토글 (Click) | `photographer_id`, `user_id` | 당장 예약하진 않아도 킵해두는 유저의 대기수요율 측정 |

### 2.4 문의 / 예약 (Booking Funnel) 및 사후 처리

| 이벤트명 / 동작 | 수집 시점 | 세부 파라미터 명세 | 파라미터 역할 및 수집 목적 |
| :--- | :--- | :--- | :--- |
| **`booking_intent`** | 예약/문의 버튼을 눌러보거나 진입하려는 순간 | - | 프로필 방문 후 실제 퍼널 진입 의사가 있는 활성 유저(Activation) 비율 산출 단서 |
| **`chat_initiated`** | 실제 채팅방 컨텍스트 진입 완료 | - | 단순 의사가 아닌 메시지 입력 직전 단계 돌파율 확인 |
| **`booking_form_abandoned`** | '예약 신청서' 폼 작성 화면에서 중도 이탈(뒤로가기/포기) 시 | `step` (String)<br>`time_spent_seconds` (Number)<br>기타 작성 중이던 상품 타입 정보 | **step**: 날짜 선택, 상품 선택 등 어느 부분에서 가장 많이 막히고 이탈하는지 파이프라인 누수 병목(Bottleneck) 확인<br>**time_spent...**: 유저가 포기하기 전까지 얼마나 고민하다 나갔는지 UX 난이도 추측 |
| **`booking_request_submitted`** | 폼 작성 및 정보 최종 전송 타격 시 | `request_details_length` 등 | 유저가 남긴 요청사항의 길이 및 구체성 파악을 통해 리드(Lead) 질 평가 |
| **`booking_confirmed`** | 작가 승인까지 완료되어 매출 확정이 이뤄진 케이스 | - | 최종 KPI인 결제/수주 확정 총량 수집 |
| **`booking_cancelled_...`** / **`booking_rejected_...`** | 사용자 변심 취소 / 작가의 요청 반려가 일어났을 때 | `reason_length` (Number) | 취소 주체가 누구인지 분류하여 '노쇼율' VS '작가 영업 포기율'을 가려내고, 이유 칸에 써맨 텍스트 크기 단위로 변심/반려 사유의 진정성 파악 |
| **`photo_zip_download_as_is`** / **`extracted`** / **`individual`** | 보정본 또는 원본 납품 사진 다운로드 관련 | `count` (다운로드 사진 수량) | 유저가 Zip 형태로 일괄 저장하는 비율 대비, 개별 사진만 쏙 빼가는 비율을 파악해 차후 Cloud UX 방식 개편 기획안에 활용 |
| **`review_start`** / **`review_create_complete`** | 예약 후기 생성 구간 진입 및 DB 쓰기 완료 | `booking_id`, `user_id` | 예약/납품을 마친 사용자들을 얼마나 후기 인벤토리 작성으로 이끌어냈는가 증명률 확보 |

### 2.5 작가 공급망 운영(Supply) 및 커뮤니티(Community) 상호작용

| 이벤트명 / 동작 | 수집 시점 | 세부 파라미터 명세 | 파라미터 역할 및 수집 목적 |
| :--- | :--- | :--- | :--- |
| **`shooting_service_action`** / **`personal_schedule_created`** | 작가 탭에서 상품을 만들고 수정하거나 스케줄러 휴무 설정 달력 조작 시 | - | 공급자 단의 '활성 작가(Active Creators)' 상태를 유지하는 비율과 영업 지속성 지표 검증 |
| **`portfolio_post_created`** | 포트폴리오를 새로 업로드 | - | - |
| **`community_post_create`** | 새 커뮤니티 질문글/자유글 생성 작성 완료 시 | - | 컨수머 및 크리에이터의 커뮤니티 참여 관여도 평가 |
| **`community_post_view`** / **`share`** / **`like`** / **`comment_create`** | 피드 내 글 열람 / 웹 공유 / 하트 / 댓글 남기기 | - | 특정 커뮤니티 글이 유저 액션을 끌어모으는 바이럴 점수(Engagement Score) 산출 |
| **`activation_chat_entered`** | 타인/작가/고객 채팅방 인입 렌더링 시 | - | 푸시 알림 후 실제 소통방 대기로 진입하는 열람률 카운팅 |
| **`photographer_response`** / **`photographer_first_response_time`** | 작가가 푸시나 채팅방 안에서 문의자에게 타겟팅된 응답 발송 시 | `response_time_seconds` (Number) | 문의 발생 후 작가가 최초 응답하기까지 걸린 시간의 평균/중앙값을 추출. 서비스 신뢰도(CS)와 '우수 연락자' 칭호를 자동 판별하는 핵심 데이터로 쓰임 |
| **`chat_message_sent`** | 메세지가 성공적으로 소켓이나 서버단에 Write 되었을 때 | `message_count` (채팅 누계)<br>`message_length` (단위 메시지 텍스트 양) | 작가/고객 간 대화가 짧은 단답인지, 충분한 길이의 컨설팅인지 커뮤니케이션 밀도 분석 |

---

## 🛠 3. Firebase Crashlytics 에러 및 컨텍스트 추적 명세

Crashlytics는 단순 앱 강종(Fatal)뿐만이 아닌 보이지 않는 버그를 추적하기 위해 에러를 쌓습니다.

### 3.1 컨텍스트 속성 (Attribute) 및 행동 궤적 (Breadcrumbs)
- **Attribute 상태 머신 주입**: 에러 발생 시 동봉되는 식별자들입니다.
  - `userId`, `userType`, `loginMethod`: 익명인지/네이버인지, 유저/작가 인프라에 따른 에러군 분리용.
  - `currentScreen`, `currentFlow`: 앱 네비게이션 트리 기준, '예약 흐름 중' 터진 건지 '업로드 중' 터진 건지 등 포지션 추적용.
  - `entityId`: 문제가 있는 특정 타임라인의 작가ID, 게시물ID 확보.
- **Custom Log 주입**:
  - `App opened`, `Review tab clicked...` 등 앱이 켜지고부터 죽기 전까지 유저가 밟은 스텝을 커스텀 로그 문자열로 미리 쌓아, 재현 불가(Impossible to Reproduce) 버그의 재현 시나리오를 알아냅니다.

### 3.2 Non-Fatal 예외 보고 (recordError)
치명적 크래시가 아니더라도 디버깅을 위해 에러 로그를 전송하는 수동 추적 지점입니다.
- **React Error Boundary 방어**: React 컴포넌트 JSX 렌더링에 폭발이 일어날 경우, 앱을 죽이지 않고 대신 컴포넌트 렌더링 스택(Stack Trace) 문자열을 전체 압축해 `recordError`로 보냅니다. 프론트엔드 오류 식별에 최적화.
- **네트워크 및 REST API 패킷 에러**: HTTP 400~500번대나 Timeout 등 통신 에러 발생 시, 백엔드가 건네준 에러 JSON 바디(`Body`)와 프론트엔드 URL 호출 정보(`Method/URL`)를 혼합 합쳐 전송. 서버/클라이언트 단 에러 핑퐁 방지.
- **대용량 파일업로드(Multipart) 실패**:
  - `fileCount`, `fileTypes`, `totalPartsCount`: 사진 다중 선택 및 Zip 전송 실패 시, 용량이나 타입, 파일 분할 패킷 개수 등을 캡처 발송합니다. 특정 파일 때문에 AWS S3 혹은 라우팅 병목이 생겼는지 원인 규명용 파라미터.

---

## 🔗 4. 앱 프론트엔드 단독 불가 / 백엔드 & DB 연동 조인 필요 (TODO)

클라이언트 사이드에서 할 수 없는, 서버 팀 혹은 데이터 엔지니어 팀이 **추가 작업**을 통해 메꿔주어야 하는 한계점 목록입니다.

| 한계 발생 항목 | 상황 및 문제점 | 향후 백엔드/데이터 팀 연동 조치 방안 |
| :--- | :--- | :--- |
| **지연된 딥링크 전환**<br>(`Deferred Deep Link`) | 미설치 유저가 외부 링크 클릭 ➜ 스토어 설치로 이동 ➜ 앱 오픈 시, 이전 URL 콘텍스트가 끊김 | 웹 랜딩에서 클릭한 IP나 지문(Fingerprint)를 서버/쿠키에 적재 또는 AppsFlyer/Branch SDK 조인으로 잃어버린 '초대-설치 CVR' 전이값 확보 |
| **공유자 유입 성과 계산**<br>(`Shared Attribution`) | 단순히 `tracking_code`를 UUID로 만들어 파싱하는 걸 각자 이벤트로 쏠 뿐 묶이지 않음 | BigQuery/SQL에서 `share_link_created(UUID)`를 부모로, `deep_link_open(UUID)`들을 자식으로 LEFT JOIN하여 포인트 보상 등 연계 |
| **예약 자동 만료**<br>(`Booking Expired`) | 24시간 등 타이머가 지나면 서버 내 DB에서만 스케줄러가 파기 치며, 앱에서 감지 불가 | 서버 스케줄러가 DB 상태를 변경할 때, 앱 푸시 전파와 별개로 서버 자체 Google Analytics 라이브러리로 BigQuery에 `expired` 기록 전송 수반 |
| **통합 예약 상태 관리**<br>(`Status Machine`) | 유저/작가가 액션할 때만 조각조각으로 이벤트(`_confirmed`, `_rejected`) 발사됨 | 복잡한 퍼널(Sankey Diagram)을 완벽히 그리고 싶다면, 앱 관전이 아닌 **서버DB의 Transition 로직 트리거**가 직접 BigQuery 로깅하는 것이 가장 정확무결 |
| **작가/스케줄 스냅샷**<br>(`Daily Snapshot`) | 클라는 특정 화면 진입 시점의 순간 데이터만 훑음 | 매일 자정 배치(Batch) 잡 등으로 전체 공급 풀 중 '오늘 실제 휴무가 아닌 예약 가능 작가 비율' 같은 상태를 스냅샷 떠두는 행위가 필수불가결 |
