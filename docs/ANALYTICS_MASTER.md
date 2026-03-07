# SNAPLINK 데이터 분석 및 수집 마스터 명세서 (Analytics Master)

본 문서는 SNAPLINK의 비즈니스 지표(KPI)를 분석하기 위한 대시보드 구조와, 이를 뒷받침하는 Firebase Analytics / Crashlytics의 프론트엔드 데이터 수집 명세를 하나로 묶은 통합 문서입니다. 전 프론트엔드 환경에서 모든 이벤트는 `utils/analytics.ts`의 `safeLogEvent` 래핑 함수를 통해 수집됩니다.

---

## 📊 1. 비즈니스 지표 (KPI) 및 대시보드 설계

| 카테고리 | 핵심 지표 (Metrics) | 분석 내용 및 의미 | 활용 데이터(이벤트/파라미터) |
| :--- | :--- | :--- | :--- |
| **기본 활성도** | Active Users, Session Count, Avg. Duration, Retention | 유니크 방문자 수(DAU/MAU)와 이들이 앱에 머무는 강도 확인 | `session_start`, `session_end` `first_open` |
| **획득 & 유입** | Acquisition Scale, Channel Quality, Deep Link CVR | 어떤 마케팅 채널/공유 링크가 실제 회원가입과 딥링크 타겟 도착으로 이어지는가 파악 | `deep_link_open` 등 상세 파라미터 |
| **탐색 경험** | Exploration Funnel, Creator CTR, Engagement | 홈 피드 노출에서 작가 상세 프로필 확인, 커뮤니티 상호작용으로 이어지는 여정 진단 | 각 화면 `_view`, `creator_card_...` |
| **예약 퍼널** | Inquiry Funnel, Booking Form Churn, Cancellation | 문의 시작부터 결제/확정 완료에 이르는 이탈 구간 및 주체별(작가/유저) 파기 원인 분석 | `booking_intent`부터 상태 변화 이벤트 전역 |
| **공급자/웹** | Active Creators, Response Time, Web Lead Funnel | 활동 중인 작가의 응답 성실도 평가 및 B2B 웹사이트 행사 리드 수집률 확보 | `photographer_response...` 등 |

---

## 📝 2. Firebase Analytics 이벤트 및 파라미터 완전 수집 명세

모든 개별 이벤트들과 그 파라미터가 "대시보드에서 어떻게 쓰이기 위해 존재하는가"를 기술한 상세 사전입니다.

### 2.1 공통 속성 (User Properties) 및 라이프사이클 이벤트

| 이벤트명 / 동작 | 수행 파라미터 | 데이터 타입 | 파라미터 역할 및 수집 목적 |
| :--- | :--- | :--- | :--- |
| **`setUserId`** | `userId` | String | (이벤트가 아님) 기기에서 발생할 모든 후속 이벤트들에 특정 유저 식별자를 각인하여 행동 여정(User Journey)을 하나로 묶음 |
| **`setUserProperties`** | `user_type` | 'user' \| 'photographer' | 애널리틱스 뷰에서 B2C고객/B2B작가의 트래픽 스펙트럼과 세그먼트를 분리 필터링하기 위함 |
| ↳ | `signup_date` | Date String | 회원가입 일자를 기록하여 동기들 간의 '가입 코호트 리텐션 곡선' 트래킹 |
| **`session_start`** | (자동) | - | 앱 포그라운드 진입. DAU/WAU 측정 및 유저 당 하루 평균 방문 횟수를 구하는 절댓값 기준 |
| **`session_end`** | `duration_seconds` | Number | 배경(Background) 전환 시 앱 체류 시간(초)을 수치화하여 평균 체류 시간(Avg. Duration) 통계화 |
| **`first_open`** <br/>/ **`app_open`** | `user_id` | String | 신규 설치/구동 볼륨 파악 |
| ↳ | `user_type` | String | 구동자의 롤 파악 |
| ↳ | `platform` | 'ios' \| 'android' | OS별 마케팅 효과와 사용자 분포 비율을 추출 |
| **`screen_view`** | `screen_name` | String | (현재는 Navigation 변경 시 자동 수집) 유저의 앱 내 UX 탐색 깊이와 Path Flow 구성 |

### 2.2 딥링크(Deep Link) 유입 및 성과 측정

| 이벤트명 / 동작 | 수행 파라미터 | 데이터 타입 | 파라미터 역할 및 수집 목적 |
| :--- | :--- | :--- | :--- |
| **`deep_link_open`** <br/>*(초기 딥링크 핑)* | `link_url` | String | 파싱되기 전의 날것(Raw) 원본 URL 로그 |
| ↳ | `link_type` | 'portfolio' \| 'community' 등 | 해당 유입이 커뮤니티 피드 타겟인지 작가 프로필 타겟인지 카테고리화 |
| ↳ | `target_id` | String | 목적지(작가, 게시글)의 고유 아이디 |
| ↳ | `source_channel` | String | (현재 제한적) 해당 딥링크가 시스템 공유 등 어떤 루트로 발생했는지 Attribution 판단 |
| ↳ | `tracking_code` | UUID | 유포자와 방문자를 매핑하는 트래킹 키 값. 바이럴 확산 계수(K-Factor) 역추적용 |
| ↳ | `is_first_open...` | Boolean | `true`일 경우 신규 인스톨 캠페인/마케팅이 성공한 '획득(Acquisition)'임을 증명 |
| **`deep_link_landing_...`** <br/>*(처리 결과 로그)*| `original_link_type` | String | 목표했던 링크 타입 |
| ↳ | `resolved_screen` | String | 실제로 라우팅에 성공해 진입시킨 React Navigation 스크린 이름 |
| ↳ | `resolve_success` | Boolean | 실패 시 `false` 기록, 딥링크 깨짐(Broken link)에 따른 전환율 이탈률 수치 제어 |
| ↳ | `fail_reason` | String | 알 수 없는 인자 등 딥링크 장애/버그 유발 원인 디버깅용 텍스트 |

### 2.3 탐색 및 발견 (Discovery & Engagement)

| 이벤트명 / 동작 | 수행 파라미터 | 데이터 타입 | 파라미터 역할 및 수집 목적 |
| :--- | :--- | :--- | :--- |
| **`login`** / **`sign_up`** | `method` | 'naver'\|'apple' 등 | 가입 계정 제공사 별 트래픽 점유율 및 가입 선호도 측정 |
| ↳ | `user_type` / `signup_date` | String | 1.1의 User Properties와 동일한 값 명시적 백업 기록 |
| **`home_feed_view`** | - | - | 홈 화면 전체 로드 완료에 대한 기본 앵커 |
| **`search_photographer`** | `search_key` | String | 유저가 입력한 검색어 단어(지역/스타일)의 트렌드 수요 및 빈도 집계 |
| ↳ | `result_count` | Number | 검색 결과 갯수. `0`개 결과 매칭 실패율을 파악하여 작가 공급 확충 데이터로 사용 |
| **`search_result_view`** | (위와 동일) | - | 검색 시도 대비 실제 검색 화면 렌더링 전환 성공률 |
| **`ai_recommendation_start`**| `prompt` | String | 유저가 AI 챗봇에 질의하는 요구사항(문장/맥락)을 수집하여 NLP 데이터셋 마련 |
| **`ai_recommendation..._view`**| `result_count` | Number | 추천 알고리즘 결과물 제공 성능(0개 매칭 방어율) 파악 |
| **`creator_card_impression`**| `photographer_id` | String | 피드에서 뷰포트에 카드(썸네일)가 들어왔을 때 기록 (30초 중복 핑 방지) |
| ↳ | `source` / `feed_type` | String | 이 카드가 '홈 추천'에서 떴는지, '검색 결과'에서 떴는지 인벤토리 출처 파악 |
| ↳ | `rank_index` | Number | 목록에서 몇 번째 위/아래의 카드가 더 많은 노출 점유율을 갖는지 알고리즘 배치 효율 검증 |
| **`creator_card_click`** | (Impression과 동일) | - | `Impression 대비 클릭률(CTR)` 분석. 작가 메인 썸네일과 가격표의 매력도를 수학적으로 계량화 |
| **`photographer_profile_view`**| `photographer_id`, `source` | String | 최종적으로 작가 프로필의 일간 도달 트래픽을 합산하고, 유입 매체(홈 vs 검색 vs 외부공유) 셰어 비중 확인 |
| **`photographer_view`** | `photographer_id`, `user` | String | 즐겨찾기(북마크) 인벤토리 등 여러 경로에서 작가를 확인하는 단순 조회 볼륨 |
| **`portfolio_post_view`** | `portfolio_id` | String | 작가 프로필 내부가 아닌, 특정 포트폴리오 게시글 단건에 대한 유저 조회(열람) 집중도 파악 |
| **`profile_scroll_depth`** | (스크롤 임계점 비율) | 단위(%) | 프로필 화면에서 25%, 50%, 90% 하단부까지 진입한 사람의 비율. 페이지 이탈 UX/UI 구간 디버깅 |
| **`profile_portfolio_clicked`**| (선택된 포트폴리오 ID) | - | 프로필 내 썸네일을 터치해 크게 뷰어로 킨 유저의 '심도 깊은 관여율' 측정 |
| **`profile_review..._clicked`**| - | - | 프로필 내 리뷰 탭 열람률. (리뷰 신뢰도의 영업 견인 능력을 확인) |
| **`share_link_created`** | `link_type`, `target_id` | String | 공유된 대상 식별 |
| ↳ | `share_channel` | 'system_share' | (차후 고도화) 유저가 복사해재낀 채널의 매체력 평가 |
| ↳ | `tracking_code` | UUID | 발급된 UUID. 링크 복사 버튼 클릭 빈도와 유포량을 분석 |
| **`bookmark_toggle`** | `photographer_id`, `user` | String | 찜 버튼 On/Off 시 기록. 예약 하락 시기에 작가의 잠재 고객 리스트 볼륨을 어드민에 제공 |

### 2.4 문의 및 예약(Booking Funnel), 구매 후 경험

해당 퍼널 이벤트의 목표는 `의도 발생 → 양식 거부율 → 협의 → 확정`의 Drop-off 지점(이탈 구간)을 추적하는 것입니다.

| 이벤트명 / 동작 | 수행 파라미터 | 데이터 타입 | 파라미터 역할 및 수집 목적 |
| :--- | :--- | :--- | :--- |
| **`booking_intent`** | - | - | [예약/문의] 버튼 첫 터치. 프로필 도달 대비 실제 구매 의지가 있는 Hot 리드 비율 측정 |
| **`chat_initiated`** | - | - | 버튼 클릭 후 챗방 생성 완료 핑. 대화방 렌더링 과정의 네트워크성/UI성 중도 차단 방어 분석 |
| **`booking_form_abandoned`**| `step` | String | (고객 이탈 시) 날짜 입력, 상품 선택 등 어느 Step에서 창을 X 닫고 이탈하는지 파이프라인 누수 병목 확인 |
| ↳ | `time_spent_seconds` | Number | 해당 폼에서 고민하다 포기하기까지 걸린 시간. 작성 난이도 UX 추척 |
| ↳ | 상품/날짜 정보 등 | Any | 포기된 예약건에 담겨 있던 상품/가격대 정보 (너무 비싼 것만 이탈하는지 등 분석) |
| **`booking_request...`** | `request_details_length` | Number | 예약 폼이 전송 완료(Submit)될 때, 세부 요구사항 텍스트 길이를 통해 리드의 진정성/구체성 평가 |
| **`booking_confirmed`** | - | - | 영업 최종 수주. KPI 중 가장 핵심인 '결제금 전환' 총량 수집용 |
| **`booking_cancelled_by_user`**| `reason_length` | Number | 단순 변심/이탈 노쇼 비율 측정. 사유 텍스트 단어 길이로 진정성 파악 |
| **`booking_detail_view`** | `booking_id`, `user_id` | - | 예약 후 유저가 자신의 일정을 앱에 켜서 확인하는 리텐션 관여 정도 (불안감 측정) |
| **`review_start`** <br/>/ **`..._create_complete`** | `booking_id`, `user_id` | String | [납품 완료 후기] 모듈 진입 시점과 DB 저장 완료 시점 쌍. 리뷰 인벤토리 수집의 전환율(Review CVR) 파악 |
| **`review_view`** | `review_id`, `user_id` | String | 내 리뷰 목록이나 타인의 예약 후기를 개별적으로 한 번 더 눌러 열람한 볼륨 파악 |
| **`review_edit_start`** <br/>/ **`..._edit_complete`** | `review_id`, `user_id` | String | 작성된 리뷰를 정성껏 수정/보강하는 충성 유저의 행동 분석 |
| **`photo_download_...`**| (관련 이벤트 4종 통합명) | - | `photo_zip_download_as_is`, `photo_zip_download_extracted`, `photo_download_as_zip`, `photo_download_individual` 발생 |
| ↳ | `count` | Number | 다운로드 받은 원본/보정본 사진 수. 묶음 통채 Zip 저장율 VS 낱장 개별 다운로드 성향을 파악하여 차후 Cloud 다운로드 UI/UX 모델 개선점 추출 |

### 2.5 작가 공급망 운영(Supply)과 채팅

B2B 관점의 공급망 체류 및 성실도를 분석합니다.

| 이벤트명 / 동작 | 수행 파라미터 | 데이터 타입 | 파라미터 역할 및 수집 목적 |
| :--- | :--- | :--- | :--- |
| **`photographer_booking_...`**| (예약 승인류 통칭) | - | 작가 단 예약 상세(`detail_view`), 앱 단 예약 승락(`approved`) 플로우 비율. 앱에서 빠른 영업 승객이 이뤄지는지 확인. |
| **`booking_rejected_by_...`** | `reason_length` | Number | 작가가 모달창 등을 통해 직접 반려 사유를 쓰고 예약 거절을 누름. 작가의 영업 거절(No-Book) 비율, 사유 충실도를 통해 플랫폼 공급 건전성 체크 |
| **`photographer_booking_rejected`**| - | - | 작가 예약 관리 탭에서 [거절 확정] 처리가 완료됨 |
| **`booking_cancelled_by_...`** | (사유 등) | - | 이미 승낙 확정된 일정을 작가가 변심/이탈 취소한 심각한 장애 상황 패널티 추산 |
| **`photographer_booking_completed`**| - | - | 촬영 완료 상태 진입 선언 |
| **`shooting_service_action`**| - | - | 작가가 서비스 패키지나 가격을 올리고 내릴 때의 상품 업데이트 Active 활성 지수 측정 |
| **`personal_schedule_created`**<br/>/ **`..._updated`** / **`..._deleted`** | - | - | 캘린더 개인 일정 등록/수정/삭제 조작 빈도 |
| **`holiday_deleted`** | - | - | 휴무일 등록을 해제하는 작가 조작. (영업일 증가 척도) |
| **`portfolio_post_created`** / **`updated`** / **`deleted`** | - | - | 포트폴리오 피드 업데이트 Active 활성 지수 |
| **`photographer_original_...`**| (원본 업로드류 통칭) | - | 작가가 원본 납품 시 Zip 통째로 올리는지(`uploaded`), 앱단 압축을 타는지(`created`), 개별 삭제하는지(`deleted`) 파악. 업로더 UX 병목 선별기 |
| **`photographer_booking_photos_...`**| (보정본 납품류 통칭) | - | 보정본 결과물을 유저에게 전달할 때 `_view`, `_added`, `_deleted` 등 개별 뷰/수정 액션 추적. 납품 난이도 평가용 |
| **`activation_chat_entered`** | - | - | 양측 모두 채팅방 화면 첫 렌더 시 (단순 푸시 클릭이 아닌 실제 대화 콘텍스트 진입 시점 열람 체크) |
| **`photographer_response`** | - | - | 작가가 상대방에게 채팅을 하나라도 '응답' 반환 완료 |
| **`photographer_first_response_time`**| `response_time_seconds`| Number | (가장 중요) 첫 상담부터 작가의 빠른 최초 응답까지 걸린 지연 시간! "응답률 100% 작가" 등 어드민 플랫폼 칭호 부여 알고리즘의 원천 소스 |
| **`chat_message_sent`** | `message_count` | Number | 총 오간 메시지 사이클 횟수. |
| ↳ | `message_length` | Number | 작가단/고객단의 컨설팅 깊이. 즉결 결제냐, 진상/긴 상담이냐 분석 |

### 2.6 커뮤니티 (Community) 활성화 지표

유저들이 사진작가를 구하지 않을 때도 앱에 머물게 하는 체류 기능에 대한 지표입니다.

| 이벤트명 / 동작 | 수행 파라미터 | 파라미터 역할 및 수집 목적 |
| :--- | :--- | :--- |
| **`community_post_create_start`** | - | [게시글 작성] 모달 버튼 클릭 관여율 |
| **`community_post_create`** | - | 실제 작성된 콘텐츠 인벤토리 발생 (DB Write 성공률) |
| **`community_post_view`** | - | 홈탭 등에서 열린 글이 얼마나 많이 조회되는지 콘텐츠 트래픽 파악 |
| **`community_post_like`** | - | 글 호응도(하트) 인터랙션 바이럴 평가 |
| **`community_post_share`** | - | 외부로 질문/자랑을 퍼다 나르는 외부 바이럴 지수 계산용 |
| **`community_comment_create`** <br/>/ **`delete`** / **`edit`** | - | 글 안에서 댓글 왈가왈부 인게이지먼트 평가 |
| **`community_post_delete`** <br/>/ **`edit`** | - | 게시글의 휘발 및 수정 관여 |

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
