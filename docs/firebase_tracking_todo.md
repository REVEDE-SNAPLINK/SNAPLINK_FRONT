# Firebase 계측 — 서버/DB 조인이 필요한 TODO 항목

앱 프론트엔드만으로는 온전히 구현할 수 없어 **서버 측 구현 또는 DB 조인**이 필요한 항목을 정리합니다.

---

## 1. Deferred Deep Linking (`deep_link_recovery_after_install`)
- **현황**: 앱 설치 전 링크 클릭 → 설치 후 원래 목적지로 복귀하는 흐름을 추적 불가
- **필요 사항**: 
  - Vercel 랜딩 페이지에서 클릭 정보(URL, timestamp, fingerprint)를 서버에 저장
  - 앱 최초 실행 시 서버 조회 → 복귀 대상 URL 반환
  - 또는 Branch.io, AppsFlyer 등 Attribution SDK 도입
- **기대 지표**: 설치 전환율(링크 클릭 → 설치 → 앱 오픈 → 원래 콘텐츠 도달)

## 2. 공유 링크 유입 귀속 (`shared_link_visit_attribution`)
- **현황**: 앱에서 UUID 기반 `tracking_code`를 공유 URL에 삽입하고 `share_link_created` 이벤트로 기록 중
- **필요 사항**: 
  - 딥링크 유입 시 URL의 `tc` 파라미터를 파싱하여 `deep_link_open`에 기록 (앱 측 구현 완료)
  - BigQuery에서 `share_link_created.tracking_code` ↔ `deep_link_open.tracking_code` 조인 쿼리 작성
  - 서버 발급 단축 URL + 방문 카운트가 필요하면 서버 API 별도 구현

## 3. 예약 만료 (`booking_expired_no_response`)
- **현황**: 예약 시간이 지나면 서버에서 자동으로 거절 처리됨. 앱에서는 만료 이벤트 발생 시점을 감지 불가
- **필요 사항**: 서버 스케줄러에서 만료 처리 시 BigQuery에 이벤트 삽입 또는 별도 서버 로그 기록
- **기대 지표**: 작가 미응답율, 만료까지 경과 시간

## 4. 예약 상태 통합 이벤트 (`booking_status_changed`)
- **현황**: 앱에서는 개별 상태 변경(approve/reject/cancel/complete)을 각각 로깅 중. 통합 상태 머신 이벤트는 서버 측이 적합
- **필요 사항**: 서버에서 예약 상태 전이(transition) 시마다 BigQuery 이벤트 삽입 (`previous_status`, `new_status`, `actor_type`, `actor_id`)
- **기대 지표**: 전체 예약 상태 흐름 Sankey diagram, 상태별 전환율

## 5. 작가 프로필/상품 상태 스냅샷
- **현황**: 앱에서는 화면 진입 시점에 일부 상태를 기록하지만, "현재 이 작가가 예약 가능한 상태인가?"는 서버 DB 스냅샷이 더 정확
- **필요 사항**:
  - `photographer_profile_status_updated`: 서버에서 프로필 공개/비공개 전환 시 기록
  - `shooting_service_status_updated`: 서버에서 상품 활성/비활성 전환 시 기록
  - `photographer_availability_snapshot_logged`: 일일 배치로 전 작가의 예약 가능 상태 스냅샷 기록
- **기대 지표**: 작가 예약 가능률, 활성 상품 비율, 프로필 완성도

## 6. 공유 채널별 분석 (`share_channel`)
- **현황**: `Share.share()` (시스템 공유 시트)를 사용하여 채널 구분 불가. 현재 `'system_share'`로 통일
- **필요 사항**: 카카오 SDK 직접 공유 버튼 등 채널별 전용 공유 UI 구현 시 채널 구분 가능
- **대안**: `react-native-share` 라이브러리 도입으로 iOS `activityType` 반환 활용 가능 (제한적)

---

> 이 항목들은 서버팀과 협의하여 BigQuery 이벤트 스키마를 맞춘 뒤 순차적으로 구현할 수 있습니다.

---

> **관련 문서**: [이벤트 수집 명세서](./firebase_tracking_data.md) · [KPI 대시보드 설계](./ANALYTICS_ANALYSIS.md)
