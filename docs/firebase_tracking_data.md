# Firebase Analytics 및 Crashlytics 데이터 수집 명세서

SNAPLINK Client 프론트엔드(`front/src/`)에서 Firebase Analytics와 Crashlytics를 통해 수집하는 모든 이벤트 및 예외 로깅 내역입니다. 모든 이벤트 호출은 앱 크래시를 방지하기 위해 `utils/analytics.ts`의 `safeLogEvent`, `safeCrashlyticsLog` 래퍼 함수를 거쳐 이루어집니다.

> **관련 문서**: [KPI 대시보드 설계](./ANALYTICS_ANALYSIS.md) · [서버/DB 조인이 필요한 TODO](./firebase_tracking_todo.md)

---

## 1. Firebase Analytics 공통/속성 데이터

### 1.1 사용자 식별 및 속성 (User Properties)
*   **setUserId**: 로그인 및 회원가입 진행 후 Analytics에 전역적으로 `userId` 할당
    *   *목적:* 퍼널에서 특정 유저의 행동 여정(User Journey) 추적 
*   **setUserProperties**:
    *   `user_type` ('user' | 'photographer'), `signup_date` 기록
    *   *목적:* 애널리틱스 뷰에서 고객/작가 세그먼트 분리, 가입 코호트 리텐션 분석

### 1.2 앱 라이프사이클 및 네비게이션
*   **session_start** / **session_end**: 세션 시작 및 종료
    *   *파라미터:* `duration_seconds` (종료 시, 세션 체류 시간)
*   **app_open** / **first_open**: 일반 앱 실행 및 최초 설치 직후 첫 실행
    *   *파라미터:* `user_id`, `user_type`, `platform` (os별 비율 분석)
*   **screen_view**: 개별 화면 진입 이벤트
    *   *파라미터:* `screen_name`, `platform`, `user_id`, `user_type`, `session_start_timestamp`

### 1.3 딥링크(Deep Link) 유입 추적 
*   **deep_link_open**: 딥링크를 통한 앱 진입 시점 기록
    *   *파라미터:* `link_url`, `link_type`, `target_id`, `source_channel`, `tracking_code`, `is_first_open_after_install`
    *   *목적:* 공유/광고 링크의 유입 채널 파악, 설치 대비 전환율 기여도 트래킹
*   **deep_link_landing_resolved**: 딥링크 라우팅 처리 결과
    *   *파라미터:* `original_link_type`, `resolved_screen`, `resolve_success`, `fail_reason`

### 1.4 회원가입 및 로그인
*   **login** / **sign_up**: 로그인 및 회원가입 완료
    *   *파라미터:* `method` ('naver', 'apple', 'test_account'), `user_type`, `signup_date`

---

## 2. 유저 (Customer) 행동 탐색 및 예약 퍼널

### 2.1 홈 탐색 및 검색
*   **home_feed_view**: 홈 화면 피드 로드 완료
    *   *목적:* 홈 화면 도달률 인상 측정
*   **creator_card_impression** / **creator_card_click**: 작가 썸네일 노출(`30초 dedupe`) 및 클릭
    *   *파라미터:* `photographer_id`, `source`, `feed_type`, `rank_index`
*   **search_photographer** / **search_result_view**: 검색 요청 및 결과 노출
    *   *파라미터:* `search_key`, `result_count`, `source`
*   **ai_recommendation_start** / **ai_recommendation_result_view**: AI 추천 진입 및 결과 확인
    *   *파라미터:* `prompt`, `result_count`, `source`

### 2.2 작가 프로필 상세 및 공유
*   **photographer_profile_view**: 검색, 피드에서 작가 상세 프로필 도달
    *   *파라미터:* `photographer_id`, `source`
*   **profile_scroll_depth**: 프로필 진입 후 스크롤 도달률 측정 (%)
*   **profile_portfolio_clicked** / **profile_review_tab_clicked**: 개별 포트폴리오 및 리뷰 확인
*   **share_link_created**: 프로필, 포트폴리오 콘텐츠 외부 공유 (tracking_code 삽입됨)
    *   *파라미터:* `link_type`, `target_id`, `share_channel` ('system_share'), `tracking_code`
*   **bookmark_toggle**: 찜/북마크 기능 On/Off (별도의 `photographer_view` 클릭 이벤트 포함)

### 2.3 예약(Booking) 및 다운로드 퍼널
*   **booking_intent**: 예약 버튼 시작 의도 발생
*   **chat_initiated**: 상담(채팅) 시작, 채팅방 진입 전
*   **booking_form_abandoned**: 폼 진행 중 이탈 시점 기록
    *   *파라미터:* `step`, `time_spent_seconds`, 작성 중이던 상품/날짜 정보
*   **booking_request_submitted**: 폼 최종 제출
    *   *파라미터:* `request_details_length` 포함 상품 옵션 정보
*   **booking_confirmed**: 서버 제출 확정 완료 (에러 없는 최종 성공)
*   **booking_cancelled_by_user**: 대기 중인 예약 취소 요청
*   **booking_detail_view**: 완료된 예약 내역 및 사진 상세 뷰
*   **photo_download**: 사진 다운로드 액션 통계
    *   *관련 이벤트:* `photo_zip_download_as_is`, `photo_zip_download_extracted`, `photo_download_as_zip`, `photo_download_individual`

### 2.4 리뷰 생성 및 확인
*   **review_start** / **review_create_complete**: 리뷰 작성 진입 및 등록 완료
*   **review_edit_start** / **review_edit_complete**: 리뷰 수정 진입/완료

---

## 3. 작가 (Photographer) 관리 및 운영 퍼널

### 3.1 예약 관리 응답
*   **photographer_booking_detail_view**: 작가측 예약 상세 화면
*   **photographer_booking_approved**: 유저 예약을 [수락]함
*   **photographer_booking_rejected_by_photographer**: 예약 요청 거절 완료
    *   *파라미터:* `reason_length` (취소 사유 길이 분석)
*   **photographer_booking_cancelled_by_photographer**: 이미 승인된 예약을 작가가 [취소]함
*   **photographer_booking_completed**: 촬영 완료 처리 

### 3.2 포트폴리오 및 스케줄 수정
*   **portfolio_post_created** / **updated** / **deleted**: 프로필 포스트 수정/생성 
*   **shooting_service_action**: 서비스 촬영 패키지(상품) 생성/수정/삭제
*   **personal_schedule_created** / **deleted**: 일정 및 휴무 관리
    *   *관련 이벤트:* `holiday_deleted`, `personal_schedule_updated`

### 3.3 원본/보정본 파일 관리
*   작가의 업로드 성향 파악용 이벤트 그룹
    *   `photographer_original_zip_uploaded` (zip 통채 업로드)
    *   `photographer_original_zip_created` (앱 단 압축)
    *   `photographer_photos_added_zip` 등

---

## 4. 커뮤니티 (Community) 및 실시간 채팅 경험

### 4.1 커뮤니티 작성 및 반응
*   **community_post_create_start** / **community_post_create**: 새 게시글 작성 및 모달 진입
*   **community_post_view**: 게시글 상세 뷰 (조회 분포 분석)
*   **community_post_share** / **community_post_like**: 바이럴 및 인터랙션 평가
*   **community_comment_create** / **edit** / **delete**: 댓글/대댓글 인게이지먼트 평가
*   **community_post_edit** / **delete**: 본인 게시글 수정/삭제

### 4.2 실시간 채팅(Chat 세션) 품질
*   **activation_chat_entered**: 상대방/본인의 실제 채팅방 진입 열람 측정 
*   **photographer_response** / **photographer_first_response_time**: 작가 응답 속도 확인(대기 시간 지표화)
*   **chat_message_sent**: 실제 전송된 채팅의 볼륨(`message_count`), 밀도(`message_length`)

---

## 5. Firebase Crashlytics 에러 수집 명세

Crashlytics는 치명적 강제종료 뿐 아니라 비정상 상태(Non-fatal Error)를 모니터링하기 위해 선제적으로 콘텍스트를 쌓습니다.

### 5.1 컨텍스트 및 Breadcrumbs (`Attribute` & `Log`)
*   **Attribute 상태 머신**:
    *   `userId`, `userType`, `loginMethod`, `signupDate` 
    *   `currentScreen` (Navigation 변경 시 자동 주입)
    *   `currentFlow` (예: `deep_link`, `booking`, `upload`)
    *   `entityId` (작가ID, 게시글ID 등 현재 작업 중인 스코프)
*   **Custom Log 추적점**:
    *   앱 라이프사이클: `App opened`, `✅ User logged in...`
    *   행동 진입점: `⭐ Review tab clicked...`, `💬 Message sent in room...`
    *   오류 진입점: `🚨 Server Error`, `⚠️ Client Error`, `🔥 React Error`

### 5.2 Non-Fatal 예외(Exception) 전송 (`recordError`)
*   **React Error Boundary 강제 종료 방어**:
    *   컴포넌트 렌더링 에러 발생 시 컴포넌트 스택 전체를 `recordError`로 푸시
*   **공통 Network & API Fetch 에러**:
    *   일반 API Request에서 400~500번대 응답 수신 시 백엔드 Body 함께 전송
    *   순수 Network 예외 (오프라인, 타임아웃 등) 추적
*   **대용량 Multipart 에러**:
    *   사진/ZIP 업로드 실패 시 원인 파악을 위해 `fileCount`, `fileTypes`, `totalPartsCount` 정보를 추가 캡처하여 발송 (스케일링 병목 타겟 분석용)
