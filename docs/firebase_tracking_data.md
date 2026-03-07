# Firebase Analytics 및 Crashlytics 데이터 수집 명세서

현재 프로젝트 (Snaplink Client) 코드베이스 내에서 Firebase Analytics (`analytics()`) 및 Crashlytics (`crashlytics()`)를 통해 수집하고 있는 모든 데이터 및 이벤트 로깅 내역을 상세하게 정리한 문서입니다. 각 이벤트에서 수집되는 파라미터가 어떤 목적(분석/추적)으로 사용되는지 함께 기술했습니다.

> **관련 문서**: [KPI 대시보드 설계](./ANALYTICS_ANALYSIS.md) · [서버 필요 TODO](./firebase_tracking_todo.md)

---

## 1. Firebase Analytics 수집 데이터

### 1.1 공통 / 앱 라이프사이클 (Navigation / Auth)
*   **session_start**: 앱 세션 시작 (Navigation Provider에서 추적)
    *   *목적:* 유저의 1회 앱 사용(세션) 시작 타점을 잡아 일간/월간 활성 세션 수를 측정
*   **session_end**: 앱 백그라운드 전환 등 세션 종료
    *   *파라미터:*
        *   `duration_seconds` (세션 유지 시간): 유저가 한 세션 동안 앱을 얼마나 길게 사용하고 이탈했는지 체류 시간을 분석하기 위함
*   **app_open**: 앱 실행
    *   *파라미터:*
        *   `user_id`: 누가 앱을 켰는지 추적 (로그인된 경우)
        *   `user_type` ('user' | 'photographer'): 고객과 작가 중 어느 유형의 유저가 앱을 더 자주 실행하는지 비교 분석
        *   `platform` (OS): iOS / Android 플랫폼별 앱 실행 빈도 비교
*   **screen_view**: 개별 화면 진입 이벤트
    *   *파라미터:*
        *   `screen_name` (경로명): 유저가 어느 화면(페이지)을 가장 많이 보는지 트래픽 분석
        *   `platform`: 기기 플랫폼별 화면 전환 차이 확인
        *   `user_id`, `user_type`: 특정 유저/유저군(고객/작가)이 주로 소비하는 화면 파악
        *   `session_start_timestamp`: 해당 화면 뷰가 어느 세션 주기 안에서 발생했는지 묶어서 흐름을 분석하기 위함
*   **login**: 로그인 완료
    *   *파라미터:*
        *   `method` ('naver', 'apple', 'test_account' 등): 어떤 소셜 로그인 방식을 가장 많이 사용하는지, 인증 수단별 선호도를 파악하여 추후 UI/UX 개선 레이아웃에 반영 (예: 가장 가입률 높은 버튼 상단 배치 등)
*   **sign_up**: 회원가입 완료
    *   *파라미터:*
        *   `user_id`, `user_type`, `signup_date`: 유저 식별 및 가입 코호트(Cohort) 분석을 위한 기본 메타 트래킹 정보
        *   `method` ('test_account' 등): 가입 수단별 가입 전환율 추적

### 1.2 사용자 식별 및 속성 (User Properties)
*   **setUserId**: 로그인 및 회원가입 진행 후 Analytics에 전역적으로 `userId` 할당
    *   *목적:* 이후 발생하는 모든 이벤트에 이 회원의 ID를 자동으로 매핑시켜 특정 유저의 행동 여정을 퍼널 스텝별로 묶어(User Journey) 추적하기 위함
*   **setUserProperties**:
    *   `user_type` ('user' | 'photographer'), `signup_date` 기록
    *   *목적:* 분석 대시보드에서 '작가 그룹'과 '고객 그룹'을 나누어 필터링하거나, 특정 월에 가입한 유저들의 리텐션을 분석하기 위한 전역 속성(Global User Property) 설정

---

### 1.3 유저 (Customer) 행동 이벤트 정의

#### [홈 및 탐색 / 검색]
*   **ai_recommendation_start**: AI 추천 기능 시작
    *   *파라미터:*
        *   `user_id`, `user_type`: AI 기능을 주로 사용하는 타겟층 파악
        *   `source`, `screen`: 어느 화면/버튼을 통해 AI 추천 기능에 진입했는지 유입 경로(Entry Point) 성과 분석
*   **ai_recommendation_result_view**: AI 추천 결과 화면 조회
    *   *파라미터:*
        *   `user_id`, `user_type`, `screen`: 결과 열람 주체 및 화면 확인
        *   `prompt`: 유저가 어떤 스타일/목적의 스냅을 원했는지 검색 프롬프트를 수집하여 트렌드 파악
        *   `result_count`: AI 추천이 매칭해 준 작가 수가 적절한지, 결과가 없을 때의 이탈률을 분석하기 위해 결과물 개수 수집
*   **search_photographer**: 작가명(키워드) 및 옵션 검색
    *   *파라미터:*
        *   `user_id`, `user_type`: 검색 주체 확인
        *   `search_key`: 유저가 앱 내에서 가장 많이 찾는 작가명, 지역, 키워드 트렌드 파악 및 인기 검색어 도출
        *   `source`: 통합 검색창인지 카테고리 태그인지 등 검색 액션이 발생한 진입점 분석
*   **photographer_profile_view**: 검색, 홈피드, 또는 추천 등에서 작가 프로필 상세로 진입
    *   *파라미터:*
        *   `user_id`, `user_type`: 프로필 열람 주체 확인
        *   `photographer_id`: 어떤 작가의 프로필이 가장 조회수(인기)가 높은지 측정
        *   `source` (ex: 'home_feed_latest', 'ai_recommendation', 'search'): 어떤 알고리즘/화면을 거쳐 프로필로 넘어왔는지 유입 효율성 측정 (예: AI 추천을 통한 유입이 많은지 직접 검색이 많은지)

#### [작가 프로필 내 상호작용 및 예약 인텐트]
*   **chat_initiated**: 작가 프로필 내 상담(채팅) 시작, 채팅방 생성 후 진입 시
    *   *파라미터:*
        *   `user_id`, `user_type`, `photographer_id`: 상담을 요청한 고객과 대상 작가 식별
        *   `room_id`: 채팅방 고유 ID를 통한 추후 대화 이벤트와의 연결성 확보
        *   `source`, `entry_source`: 고객이 예약하기 전에 프로필에 들어올 때 어떻게 들어왔고, 채팅 버튼을 언제 눌렀는지 '탐색 -> 상담' 퍼널 전환율 분석
*   **booking_intent**: 작가 프로필에서 예약 진행(버튼 클릭) 등 예약 의도 발생 시
    *   *파라미터:*
        *   `user_id`, `user_type`, `photographer_id`: 예약 인텐트를 발생시킨 주체와 대상 작가 식별
        *   `screen`, `source`, `entry_source`: 예약을 결심한 유저가 애초에 이 작가 프로필을 어떻게 발견하고 들어왔는지 역추적하여 가장 구매 전환율이 높은 유입 채널(예: 인기피드 vs AI검색) 판별
*   **profile_review_tab_clicked**: 작가 프로필 내 탭 중 '리뷰' 탭 클릭
    *   *파라미터:*
        *   `photographer_id`, `user_id`, `user_type`: 유저가 프로필 열람 후 '리뷰'를 확인하는 행위의 빈도 측정. (리뷰 탭을 본 유저가 예약 전환율이 더 높은지 상관관계 분석)
*   **profile_portfolio_clicked**: 작가 프로필 내 '포트폴리오' 개별 사진 게시글 클릭
    *   *파라미터:*
        *   `photographer_id`, `portfolio_id`: 어떤 작가의 어떤 사진 콘텐츠가 클릭을 유도하는지 파악
        *   `user_id`, `user_type`, `source`: 포트폴리오 썸네일 클릭 빈도를 통한 시각적 콘텐츠의 유저 인게이지먼트 측정
*   **profile_scroll_depth**: 작가 프로필 화면의 스크롤 깊이(도달률) 기록
    *   *파라미터:*
        *   `photographer_id`, `user_id`, `user_type`: 프로필 진입 후 유저 반응
        *   `depth_percentage` (도달 수치): 프로필의 상세 정보, 포트폴리오 등을 유저가 끝까지 스크롤해서 보는지, 상단만 보고 이탈하는지(Bounce) 인터랙션 퀄리티 측정
*   **portfolio_post_view**: 포트폴리오 게시글 상세 (PostDetail) 진입
    *   *파라미터:*
        *   `screen_name`, `user_id`, `user_type`, `post_id`, `photographer_id`, `source`: 특정 사진이 팝업(상세)으로 얼마나 잘 소비되는지 개별 콘텐츠 인기도 측정

#### [예약 진행 퍼널(Funnel) 및 완료]
*   **booking_form_abandoned**: 예약 폼 진행 중 이탈(뒤로가기, 앱종료 등)
    *   *파라미터:*
        *   `user_id`, `user_type`, `photographer_id`: 이탈한 유저와 대상 작가 파악
        *   `step` ('product_selection', 'request_details' 등): 예약 폼의 어느 단계에서 유저가 가장 많이 포기하고 나가는지 병목(Drop-off) 구간 파악 (예: 날짜 선택에서 막히는지, 요구사항 작성에서 막히는지)
        *   `time_spent_seconds`: 유저가 해당 폼에서 얼마나 고민/체류하다가 나갔는지 시간 측정
        *   `had_date`, `had_time`, `had_product`, `had_region`, `product_id`, `shooting_date`: 유저가 어디까지 입력해 두고 나갔는지 상태값 보존. (상품은 다 골랐는데 시간이 안 맞아서 나간 건지 등 이탈 사유 유추용)
*   **booking_request_submitted**: 예약 요청지 작성 후 최종 제출
    *   *파라미터:*
        *   `user_id`, `user_type`, `photographer_id`: 예약 제출자 및 수신 작가
        *   `product_id`, `shooting_date`, `start_time`, `region`, `options`: 어떤 상품/날짜/선택옵션(원본추가 등)이 가장 잘 팔리는지 커머스 판매 실적 분석용 데이터
        *   `request_details_length`: 고객이 요구사항을 얼마나 길고 꼼꼼하게 적는지 텍스트 길이를 측정하여 폼 UX 개선에 활용
*   **booking_confirmed**: 예약 제출 접수 확정 (실제론 요청이 성공적으로 서버에 넘어간 상태)
    *   *파라미터:*
        *   `user_id`, `user_type`, `photographer_id`, `product_id`, `shooting_date`, `start_time`, `options`, `region`: `booking_request_submitted`와 동일한 판매 데이터 기록. 네트워크나 시스템 에러 없이 최종적으로 접수가 완료된 건만 추출하기 위한 전환 퍼널(Conversion Funnel)의 최종 종착지 로깅.

#### [예약 내역 조회 및 결과물(사진) 다운로드]
*   **booking_detail_view**: 예약 상세 화면 진입
    *   *파라미터:*
        *   `booking_id`, `user_id`: 유저가 완료된 예약을 얼마나 자주 열람하는지, 사후 관리(After-care) 화면 사용 빈도 측정
*   **photo_zip_download_as_is**: 결과물 원본 또는 보정본.zip 파일을 디바이스에 통째로 다운로드
*   **photo_zip_download_extracted**: 결과물 압축파일을 앱 내에서 다운 후 내부에서 풀기
*   **photo_download_as_zip**: 여러 장의 사진을 선택(Select) 후 직접 ZIP 파일로 묶어서 다운로드
*   **photo_download_individual**: 개별 사진 여러 장을 각각 기기에 다운로드
    *   *위 4가지 이벤트들의 공통 파라미터 목적:*
        *   `booking_id`, `user_id`, `count` (선택된 장수): 고객이 사진을 수령할 때 어떤 방식을 가장 선호하는지 분석. 모바일 네이티브 환경에서 압축파일 통째 다운로드 비율과 한장 한장 선택 저장 비율을 비교하여, 향후 앨범(결과물) 제공 UX/UI를 개편하기 위한 지표로 활용.

#### [리뷰 시스템]
*   **review_start**: 리뷰 작성 화면 진입
    *   *파라미터:* 
        *   `booking_id`, `user_id`: 사진을 수령한 뒤 유저가 리뷰 작성 화면까지 진입하는 클릭 전환율(CTR) 측정
*   **review_create_complete**: 새 리뷰 작성 완료/등록
    *   *파라미터:* 
        *   `booking_id`, `user_id`: 화면 진입 후 실제로 리뷰 작성을 포기하지 않고 완료한 최종 작성 전환율 확인
*   **review_view**: 내가 작성한 리뷰 상세 보기 화면 진입
    *   *파라미터:* 
        *   `review_id`, `user_id`: 본인 작성 리뷰 회귀 조회 빈도 측정
*   **review_edit_start** / **review_edit_complete**: 내 리뷰 수정 진입 및 완료
    *   *파라미터:* 
        *   `review_id`, `user_id`: 등록된 리뷰를 다시 수정하려는 인텐트 및 수정 완료 비율 (별점 변경 등 이슈 파악)

#### [북마크 / 찜 모아보기]
*   **photographer_view**: 북마크 탭 내부에서 특정 작가 클릭 시
    *   *파라미터:* 
        *   `photographer_id`, `user_id`: 찜해둔 작가 풀(Pool)에서 다시 프로필을 열람하는 행동 빈도 파악 (관심 고도화)
*   **bookmark_toggle**: 작가 찜 버튼(하트) 토글 (추가/해제)
    *   *파라미터:* 
        *   `photographer_id`, `user_id`: 특정 작가에 대한 '관심/저장' 지표 트래킹. 예약 전 단계의 잠재 구매 인텐트로 취급하여, 어떤 작가가 찜을 많이 받는지 랭킹 지표로도 활용 가능.

---

### 1.4 작가 (Photographer) 행동 이벤트 정의

#### [예약 관리 및 스케줄링]
*   **photographer_booking_detail_view**: 작가측 예약 상세화면 확인
    *   *파라미터:* 
        *   `user_id`, `user_type`('photographer'), `bookingId`: 작가가 일정 관리 시 예약을 얼마나 자주 확인하는지 관리자 UX 사용성 평가
*   **photographer_booking_photos_view**: 작가측 촬영사진 내역 화면 진입
    *   *파라미터:* 
        *   `user_id`, `user_type`, `bookingId`: 작업물 관리 화면 도달
*   **photographer_booking_approved**: 유저의 예약을 작가가 수락
    *   *파라미터:* 
        *   `user_id`, `user_type`, `bookingId`: 작가의 요청 [수락] 전환 지표. 문의 대비 성사율을 측정하기 위한 필수 이벤트.
*   **photographer_booking_rejected**: 유저의 예약을 작가가 거절 프로세스 진입
    *   *파라미터:* 
        *   `user_id`, `user_type`, `bookingId`: 작가의 요청 [거절] 지표. (향후 거절 사유 파라미터 추가 시 매칭 실패 원인 분석 가능)
*   **photographer_booking_completed**: 촬영 완료 처리 (사진 결과물 업로드 전 단계)
    *   *파라미터:* 
        *   `user_id`, `user_type`, `bookingId`: 실제 현장 촬영이 무사히 이행되었음을 알리는 운영 현황 파악 목적.
*   **personal_schedule_created** / **updated** / **deleted**: 개인 스케줄 및 휴무일 관리
    *   *파라미터:* 
        *   `user_id`, `user_type`, `start_date`, `end_date`, `title`, `schedule_id`: 작가가 앱 내에 내장된 스케줄 캘린더 기능을 얼마나 활발히 사용하는지 리텐션 지표 (이 기능의 사용 활성도가 높을수록 플랫폼 이탈 방지 효과(Lock-in) 추정)
*   **holiday_deleted**: 설정한 휴무일 삭제
    *   *파라미터:* 
        *   `user_id`, `user_type`: 일정 관리 액션빈도 측정

#### [촬영 서비스 패키지 상품 관리]
*   **shooting_service_action**: 촬영 상품 생성/수정/삭제/스케줄 편집 등 액션 통합 관리
    *   *파라미터:* 
        *   `user_id`, `user_type`, `action_type`, `product_id`: 'create'(신속한 상품 등록), 'edit'(단가 변동 등) 어떤 액션이 잦은지 파악. 상품 업데이트 주기를 분석하여 작가 운영 패턴을 이해.

#### [포트폴리오 프로필 포스트 관리]
*   **portfolio_post_created**: 포트폴리오 생성 완료
    *   *파라미터:* 
        *   `user_id`, `photo_count`, `is_linked`: 작가가 평균 몇 장의 사진을 묶어서 한 포스트로 올리는지 파악. 새 콘텐츠 수급량 측정.
*   **portfolio_post_updated** / **deleted**: 포트폴리오 수정/삭제 완료
    *   *파라미터:* 
        *   `user_id`, `post_id`, `deleted_count`, `new_count`: 기존 포트폴리오의 최신화(업데이트) 빈도를 측정하여 프로필 신선도(Freshness) 점검.

#### [고객용 사진/결과물 업로드 관리 (ViewPhotos)]
*   **photographer_original_zip_uploaded**: 사용자가 올린 원본.zip 등 단일 압축 파일 통째 업로드
*   **photographer_original_zip_created**: 다중 사진들을 앱단에서 zip으로 말아서 서버에 업로드
*   **photographer_photos_added_zip**: 결과물 탭에 사진 추가 (zip 방식 사용)
*   **photographer_booking_photos_added** / **deleted**: 예약 내역에 다수 이미지 개별 추가 및 삭제
    *   *위 5가지 이벤트들의 파라미터 목적:* 
        *   `user_type`, `bookingId`, `file_name`, `count`: 작가들이 결과물을 납품할 때 'PC에서 zip으로 묶어 모바일로 올리는지' vs '모바일 갤러리에서 여러 장 선택해 올리는지' 등 업로드 패턴과 편의성을 분석. 업로드 실패율을 개선하기 위한 기술적 로깅 포함.

---

### 1.5 커뮤니티 (Community) 활동 이벤트
*   **community_post_view**: 커뮤니티 게시글 상세 진입
    *   *파라미터:* 
        *   `post_id`, `author_id`, `category`: 게시글 인기 점수 및 카테고리별 조회 분포 파악
        *   `platform`, `user_id`, `user_type`: 플랫폼별, 유저 타입별(고객/작가) 커뮤니티 참여율 비교
*   **community_post_share**: 게시글 공유 행동
    *   *파라미터:* 
        *   `post_id`, `user_id`, `user_type`, `platform`: 바이럴 포텐셜(Viral Potential)이 높은 게시글 파악 (어떤 유저군이 주로 외부로 공유를 많이 하는지 추적)
*   **community_post_like**: 커뮤니티 좋아요 버튼 토글 기록 (증감)
    *   *파라미터:* 
        *   `post_id`, `user_id`, `user_type`, `platform`, `liked` (boolean): 게시글에 대한 인터랙티브 호응도(Engagement) 실시간 파악. (좋아요 취소 비율인 Un-like율 포함)
*   **community_post_edit** / **delete**: 게시글 수정 및 완전 삭제
    *   *파라미터:*
        *   `post_id`, `user_id`, `user_type`, `platform`: 등록 후 다시 수정하거나 자진 삭제하는 게시글의 라이프사이클 측정. 악성 콘텐츠 필터링이나 커뮤니티 정화도 판단용 백업 데이터.
*   **community_comment_create**: 게시글에 새 댓글 / 대댓글 달기
    *   *파라미터:* 
        *   `post_id`, `user_id`, `user_type`, `platform`, `comment_id`: 댓글을 통한 사용자 간 소통량 측정.
        *   `is_reply`, `parent_comment_id`: 대댓글(Reply) 기능을 얼마나 활용하여 토론의 깊이(Thread Depth)가 깊어지는지 파악.
*   **community_comment_edit** / **delete**: 등록한 댓글 텍스트 내용 수정/삭제
    *   *파라미터:* 
        *   `post_id`, `user_id`, `user_type`, `platform`, `comment_id`: 댓글 관리 빈도를 통한 앱 내 체류/참여 정도 평가.

---

### 1.6 실시간 채팅 (ChatDetails) 관련 데이터
*   **activation_chat_entered**: 채팅 화면(Room) 내부 최초 혹은 활성화 상태 진입
    *   *파라미터:* 
        *   `room_id`, `platform`, `user_id`, `user_type`: 푸시 알림 등을 통해 실제 유저가 채팅방에 진입하여 메시지를 읽는 수신 열람률 측정.
*   **photographer_response**: 채팅방 내 작가의 텍스트 답장 혹은 응답 액션
    *   *파라미터:* 
        *   `photographer_id`, `room_id`, `is_first_response`, `response_time_seconds`, `user_id`: '작가가 수신한 메시지에 얼마나 성실하게 대응하는가'에 대한 작가 서비스 품질(Quality of Service) 평가.
*   **photographer_first_response_time**: 작가가 특정 고객에게 "첫 응답"을 보낼 때까지 걸린 소요 시간 측정 (고객 응답률/시간 분석용)
    *   *파라미터:* 
        *   `photographer_id`, `response_time_seconds`, `response_time_minutes`: 고객 만족도에 가장 결정적인 영향을 미치는 '첫 문의에 대한 대기 시간'을 핵심 지표(KPI)로 관리하기 위함. 작가별 평균 응답시간(TAT) 도출.
*   **chat_message_sent**: 채팅 메시지 발송 완료
    *   *파라미터:* 
        *   `user_id`, `room_id`, `is_first_message`: 채팅이 단순 1회성 문의로 끝나는지 연속적인 대화로 이어지는지 추적.
        *   `message_length`: 전송된 메시지의 길이를 파악하여 고객이 얼마나 상세한 요구사항을 채팅을 통해 소통하는지 파악.
        *   `message_count`: 한 채팅방 내 누적 메시지 수를 측정하여 상담의 볼륨과 밀도 측정.


---

## 2. Firebase Crashlytics 데이터 수집 명세

Crashlytics는 치명적 크래시(앱 강제종료) 뿐 아니라, 예외 상황에 대한 정보를 로깅(`log`)하고 Non-fatal 예외(`recordError`)를 명시적으로 남기는 방식으로 활용 중입니다.

### 2.1 속성 (Attributes) 및 식별기록 수집 (컨텍스트 구성용)
*   **setUserId**: 로그인한 `userId`
*   **setAttributes**: 추후 크래시 발생 시 식별을 위한 커스텀 데이터(`userType`, `loginMethod`, `signupDate`)
    *   *목적:* 크래시가 발생했을 때 이 사용자가 고객인지 작가인지, 언제 가입한 유저인지, 로그인 방식은 무엇인지 등 환경 변수를 함께 전송 받아 오류 수정의 리드 타임을 단축시키고 특정 집단에만 이그젝트되는 버그 클러스터링을 용이하게 함.

### 2.2 디버그 및 진행 현황 로그 (Custom logs via `log`)
세션 도중 남겨지는 크래시 전 흐름 파악용 Custom Log 구문들:
*   *목적:* 갑작스러운 크래시 직전에 사용자가 거쳤던 발자취(Breadcrumbs)를 한눈에 파악하여, 재현 불가능한(Intermittent) 크래시 원인을 분석할 수 있도록 돕는 디버깅 추적 로그.
*   **앱 실행**: `App opened`
*   **로그인/가입**:
    *   `✅ User logged in: ${userId} (${userType})`
    *   `✅ User signed up: ${userId} (${userType})`
*   **사용자 행동 트래킹**:
    *   `⭐ Review tab clicked on profile ${photographerId}`
    *   `🖼️ Portfolio clicked: ${id} on profile ${photographerId}`
    *   `✉️ Photographer responded in room ${roomId} (${responseTime}s)`
    *   `💬 Message sent in room ${roomId} (count: ${messageCount})`
*   **에러 직전 로그**:
    *   `🚨 Server Error: ${status} ${url}`
    *   `⚠️ Client Error: ${status} ${url}`
    *   `🔴 Network Error: ${url}`
    *   `🔥 React Error: ${error.message}` (Error Boundary에서 발생)
    *   `Component Stack: ...` (리액트 컴포넌트 트리)

### 2.3 Non-Fatal 에러 명시적 기록 관리 (`recordError`)
*   **React Error Boundary (컴포넌트 렌더링 에러)**
    *   컴포넌트 렌더링 중 발생하는 예외를 Catch하여 `recordError(error, jsonString)` 로 전송.
    *   *추가정보 JSON:* `{ componentStack, type: 'React Error Boundary' }`
    *   *목적:* 앱이 강제 종료되지 않는 상황에서도 UI 요소 렌더링 실패로 인해 하얀 화면(White Screen of Death)이 뜨는 상황을 디버깅하기 위해 호출 스택(Component Stack) 정보를 함께 전송.
*   **일반 API 응답 에러 (`utils.ts`)**
    *   fetch API 도중 400~500번대 응답이 나왔을 경우, 직접 Error 인스턴스를 만들어 전송.
    *   *오류명칭:* `API Error: ${status} ${url}`
    *   *추가정보 JSON:* 백엔드에서 전달된 원본 에러 데이터 `errorData` 통째로 삽입.
    *   *목적:* 백엔드 서버에서 발생한 내부 서버 에러나 사용자의 잘못된 요청값을 앱 로그 콘솔 없이도 Crashlytics 대시보드에서 통합 모니터링하기 위함.
*   **네트워크 레벨 Exception (`utils.ts`)**
    *   fetch 자체가 실패하여 throw 되는 Network 레벨 문제
    *   *추가정보 JSON:* `{ url, type: 'NetworkError', message }`
    *   *목적:* 사용자의 네트워크 오프라인 상태나 서버 접속 불가 상태로 인해 발생하는 순수 네트워크 오류 빈도 점검용.
*   **Multipart (파일 등) 업로드 에러**
    *   Multipart 폼데이터 전송 실패 및 타임아웃
    *   *추가정보 JSON:* 원본 `errorData`나 `{ url, type: 'Multipart NetworkError', message }`
    *   *목적:* 작가 앱에서 대용량 원본 사진/ZIP 파일 등을 올리다 흔하게 발생하는 멀티파트 파일 업로드 실패 병목과 타임아웃 횟수를 모니터링하여 인프라 개선 스케일링을 도모함.

---

> ☝️ 위 Section 1~2는 기존에 구현된 이벤트 명세입니다. 아래 Section 3~4는 v2 계측 개선(2026-03-08)에서 추가된 항목입니다.

---

## 3. 신규 추가 이벤트 (v2 계측 개선)

### 3.1 딥링크 유입 추적
*   **deep_link_open**: 딥링크를 통한 앱 진입 시점 기록
    *   *파라미터:*
        *   `link_url`: 수신된 딥링크 원본 URL (최대 500자)
        *   `link_type` ('photographer_profile' | 'portfolio_post' | 'community_post' | 'booking' | 'unknown'): URL에서 파싱한 콘텐츠 유형
        *   `target_id`: 대상 엔티티 ID (작가ID, 게시글ID 등)
        *   `source_channel` ('share' | 'external' | 'internal' | 'unknown'): 유입 채널 판별 (tracking_code 존재 시 share, https면 external, snaplink://면 internal)
        *   `tracking_code`: 공유 링크에 삽입된 추적 코드 (BigQuery 조인 키)
        *   `is_first_open_after_install`: 앱 최초 설치 후 딥링크를 통한 첫 실행 여부
        *   `user_id`, `user_type`: 사용자 식별
    *   *목적:* 딥링크 유입 경로별 볼륨 분석, 공유 링크 귀속 추적

*   **deep_link_landing_resolved**: 딥링크 라우팅 결과 (성공/실패)
    *   *파라미터:*
        *   `original_link_type`, `original_target_id`: 딥링크에서 파싱한 원래 의도
        *   `resolved_screen`: 실제 네비게이션된 화면명 (성공 시)
        *   `resolved_target_id`: 실제 라우팅된 엔티티 ID
        *   `resolve_success` (boolean): 라우팅 성공 여부
        *   `fail_reason` ('invalid_link' | 'not_found' | ''): 실패 사유
    *   *목적:* 딥링크 파싱/라우팅 성공률 모니터링, 깨진 링크 탐지

*   **first_open**: 앱 최초 설치 후 첫 실행 (딥링크 없이 직접 실행한 경우)
    *   *파라미터:* `user_id`, `user_type`
    *   *목적:* 신규 설치 트래킹, 딥링크 없는 오가닉 설치 분리 측정

### 3.2 공유 링크 생성 추적
*   **share_link_created**: 앱 내에서 콘텐츠를 외부로 공유할 때 발생 (3곳: 작가 프로필, 포트폴리오, 커뮤니티)
    *   *파라미터:*
        *   `link_type` ('photographer_profile' | 'portfolio_post' | 'community_post'): 공유 콘텐츠 유형
        *   `target_id`: 공유 대상 엔티티 ID
        *   `share_channel`: 현재 `'system_share'` (OS 공유 시트 사용)
        *   `creator_user_id`, `creator_user_type`: 공유를 발생시킨 사용자
        *   `tracking_code`: URL에 삽입된 UUID 추적 코드 — `deep_link_open.tracking_code`와 BigQuery 조인하여 공유→유입 귀속 분석 가능
    *   *목적:* 콘텐츠별 바이럴 계수(K-factor), 공유→설치→전환 퍼널 분석

### 3.3 탐색 퍼널 (Impression / Click)
*   **home_feed_view**: 홈 화면 피드 로드 완료 시
    *   *파라미터:* `feed_type`, `user_id`, `user_type`
    *   *목적:* 홈 화면 도달률 측정

*   **creator_card_impression**: 작가 카드가 화면에 노출될 때 (홈 고정 3+3개, 30초 dedupe)
    *   *파라미터:*
        *   `photographer_id`: 노출된 작가
        *   `source` ('home_feed_latest' | 'home_feed_popular'): 피드 영역
        *   `feed_type` ('latest' | 'popular'): 피드 유형
        *   `rank_index`: 리스트 내 순서 (CTR 위치 효과 분석용)
    *   *목적:* 노출 대비 클릭률(CTR) 분석의 분모(노출수) 수집

*   **creator_card_click**: 작가 카드를 클릭하여 프로필로 이동 시
    *   *파라미터:* `photographer_id`, `source`, `feed_type`, `user_id`, `user_type`
    *   *목적:* CTR 분석의 분자(클릭수) 수집. 기존 `photographer_profile_view`와 함께 사용하되, source/feed_type으로 세부 위치별 전환율 비교 가능

*   **search_result_view**: 검색 결과 로드 완료 시
    *   *파라미터:*
        *   `search_key`: 검색어
        *   `result_count`: 결과 건수
        *   `user_id`, `user_type`, `source`
    *   *목적:* 검색 키워드별 결과 건수 분석, 0건 결과 비율(No Result Rate) 모니터링

### 3.4 예약 퍼널 보완
*   **booking_cancelled_by_user**: 고객이 대기 중인 예약을 직접 취소
    *   *파라미터:*
        *   `booking_id`: 취소된 예약 ID
        *   `user_id`, `user_type`: 취소 주체
        *   `cancel_stage` ('requested'): 현재 WAITING_FOR_APPROVAL 상태에서만 취소 가능
    *   *목적:* 고객 자발적 취소율 측정, 작가 응답 대기 중 이탈 분석

*   **booking_cancelled_by_photographer**: 작가가 승인된 예약을 취소
    *   *파라미터:*
        *   `booking_id`, `user_id`, `user_type` ('photographer')
        *   `cancel_stage` ('accepted'): APPROVED 상태(촬영 1시간 전까지)에서만 취소 가능
        *   `reason_length`: 취소 사유 텍스트 길이 (원문은 개인정보 미수집)
    *   *목적:* 작가 측 취소율, 취소 시점 분석 (촬영 임박 취소 비율 등)

*   **booking_rejected_by_photographer**: 작가가 예약 요청을 거절 (거절 사유 입력 완료 후)
    *   *파라미터:*
        *   `booking_id`, `photographer_id`, `user_type` ('photographer')
        *   `reason_length`: 거절 사유 텍스트 길이 (원문은 개인정보 미수집)
    *   *목적:* 거절 사유 패턴 분석 (사유 길이와 거절 빈도 상관 분석), 기존 `photographer_booking_rejected`(진입 시점)와 구분하여 실제 거절 완료만 추적

### 3.5 커뮤니티 게시글 생성 퍼널
*   **community_post_create_start**: 게시글 작성 모달 오픈 시
    *   *파라미터:* `user_id`, `user_type`, `platform`
    *   *목적:* 작성 시도 → 완료 전환율(모달 오픈 대비 실제 등록 비율) 분석

*   **community_post_create**: 게시글 등록 완료 시
    *   *파라미터:*
        *   `post_id`: 생성된 게시글 ID
        *   `author_id`, `user_type`: 작성자 정보
        *   `category`: 게시글 카테고리
        *   `has_image` (boolean), `image_count`: 이미지 첨부 여부 및 개수
        *   `text_length`: 본문 길이
        *   `platform`: OS
    *   *목적:* 카테고리별 게시글 생성량, 이미지 첨부율, 텍스트 밀도 분석

### 3.6 Crashlytics 컨텍스트 강화 (신규)
*   **currentScreen**: 크래시 발생 시점의 현재 화면명 (Attribute)
*   **currentFlow**: 사용자가 수행 중이던 흐름 ('deep_link' | 'booking' | 'chat' | 'upload' | 'community' | 'browse')
*   **entityId / entityType**: 크래시 시점의 관련 엔티티 정보 (작가ID, 게시글ID 등)
*   **Multipart 에러 보강**: `fileCount`, `fileTypes`, `totalPartsCount` 추가 — 파일 업로드 실패 시 원인 분석 용이
*   **딥링크 컨텍스트**: 딥링크 진입 시 `flow: 'deep_link'`, `entityId`, `entityType` 자동 설정 + 로그 메시지 기록

### 3.7 공통 인프라 (utils/analytics.ts)
*   **safeLogEvent**: 모든 analytics 이벤트를 try-catch로 감싸 앱 크래시 방지
*   **safeLogImpression**: impression dedupe (동일 아이템 30초 이내 중복 전송 방지)
*   **resetImpressionCache**: 앱 백그라운드→포그라운드 전환 시 dedupe 캐시 초기화
*   **checkAndMarkFirstInstall**: AsyncStorage 기반 앱 최초 설치 감지 (`@snaplink_first_install` key)
*   **generateTrackingCode**: 공유 링크용 UUID 추적 코드 생성
*   **parseDeepLinkUrl**: 딥링크 URL에서 link_type, target_id, tracking_code, source_channel 파싱
*   **setCrashlyticsContext / safeCrashlyticsLog**: Crashlytics attribute/log 안전 래퍼

---

## 4. 서버/DB 조인이 필요한 항목 (TODO)

아래 항목은 프론트엔드만으로는 구현 불가하며 서버 측 작업이 필요합니다.
상세 내역은 [`firebase_tracking_todo.md`](./firebase_tracking_todo.md) 참조.

| 항목 | 설명 | 필요 사항 |
|------|------|-----------|
| `deep_link_recovery_after_install` | 설치 전 링크 클릭 → 설치 후 복귀 | Attribution SDK 또는 서버 측 클릭 정보 저장 |
| `shared_link_visit_attribution` | 공유 링크 유입 귀속 조인 | BigQuery에서 `share_link_created.tracking_code` ↔ `deep_link_open.tracking_code` 조인 |
| `booking_expired_no_response` | 예약 기한 만료 자동 거절 | 서버 스케줄러에서 BigQuery 이벤트 삽입 |
| `booking_status_changed` | 통합 상태 전이 이벤트 | 서버에서 상태 변경 시 BigQuery 이벤트 기록 |
| 작가 프로필/상품 스냅샷 | 예약 가능 상태, 활성 서비스 수 등 | 서버 배치 또는 상태 변경 시 기록 |
| 공유 채널 구분 | 카카오톡/인스타 등 채널별 분석 | 카카오 SDK 등 전용 공유 UI 구현 |
