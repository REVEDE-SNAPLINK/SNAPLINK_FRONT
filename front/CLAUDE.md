# Snaplink Client App (React Native)

사진작가-고객 매칭 플랫폼의 모바일 앱. iOS + Android 동시 지원.

> 전체 워크스페이스 개요는 `/Users/gunlee/Development/snaplink/CLAUDE.md` 참조.

## 기술 스택
- React Native 0.81.4 / React 19.1.0 / TypeScript
- React Query (서버 상태), Zustand (클라이언트 상태)
- styled-components (스타일링)
- Firebase: Analytics, Crashlytics, Messaging, Remote Config
- react-navigation v7 (네이티브 스택)

## 사용자 유형
- **user** — 사진 촬영을 요청하는 고객
- **photographer** — 촬영 서비스를 제공하는 사진작가

## 디렉토리 구조

```
src/
├── api/            도메인별 API 함수들
│   auth, block, bookings, chat, community, concepts, fcm,
│   linkHub, notices, notifications, photographers, regions,
│   reports, reviews, schedules, shootings, user, utils
├── assets/         이미지, 아이콘, 폰트, 라이선스 JSON
├── auth/           인증 관련 로직
├── components/
│   ├── domain/     비즈니스 도메인 컴포넌트 (booking, community, photographer)
│   ├── feedback/   로딩/에러/빈 상태 UI
│   ├── form/       폼 컴포넌트
│   ├── layout/     레이아웃 컴포넌트
│   ├── media/      이미지/동영상 컴포넌트
│   ├── providers/  Context Provider들
│   ├── theme/      테마 컴포넌트
│   └── ui/         공통 UI 컴포넌트 (버튼, 모달, 입력 등)
├── config/
│   └── api.ts      Firebase Remote Config 기반 URL/키 관리
├── constants/      상수 정의
├── mutations/      React Query mutation hooks (도메인별)
├── navigation/
│   ├── index.tsx         NavigationContainer + 딥링크 처리 + Firebase 분석
│   ├── RootNavigator.tsx 인증 상태별 스택 전환
│   └── stacks/           역할별 네비게이션 스택
├── queries/        React Query query hooks (도메인별)
├── screens/
│   ├── auth/             Login, UserOnboarding
│   ├── common/           Home, Community, CommunityDetails, PhotographerDetails,
│   │                     Chat, ChatDetails, Reviews, SearchPhotographer, ...
│   ├── photographer/     BookingCalendar, BookingManage, EditProfile,
│   │                     PortfolioForm, ShootingManage, ...
│   └── user/             Booking, BookingDetails, BookingHistory,
│                         Bookmarks, MyReviews, WriteReview, ...
├── store/
│   ├── authStore.ts      인증 상태 (status: authed/unauthed/loading)
│   └── modalStore.ts     전역 모달 상태 (커뮤니티, 스케줄, 리포트 등)
├── theme/          디자인 토큰 (색상, 타이포그래피, 간격)
├── types/          공통 TypeScript 타입
├── utils/
│   ├── analytics.ts      Firebase Analytics/Crashlytics 래퍼
│   └── installReferrer.ts Android Install Referrer 처리
└── ws/             WebSocket (STOMP) 클라이언트
```

## 딥링크

### 흐름
1. 외부 링크 클릭 → `go.snaplink.run/{code}` → link-hub가 `snaplink://` 또는 앱 스킴으로 리다이렉트
2. `navigation/index.tsx`의 `navigateByDeepLink()` 처리
3. 미인증 상태 → `pendingDeepLink`에 보관 → 로그인 후 자동 처리

### URL 패턴 (앱 내부)
- `snaplink://tab/home`
- `snaplink://photographer/{id}`
- `snaplink://portfolio/{id}`
- `snaplink://community/{id}`
- `snaplink://booking/{id}`
- `snaplink://chat/{roomId}`

## Firebase Remote Config
`src/config/api.ts`에서 관리. 앱 재배포 없이 변경 가능:
- `API_BASE_URL` (기본: `https://api.snaplink.run`)
- `KAKAO_NATIVE_APP_KEY`
- `CLOUDFRONT_BASE_URL`
- `WEBSITE_URL`, `LINK_HUB_URL`

## 상태 관리 패턴
- **서버 상태:** React Query (`queries/`, `mutations/`) — 캐싱, 무효화
- **전역 UI 상태:** Zustand (`store/`) — 인증, 모달
- **로컬 상태:** React useState/useReducer

## 코드푸시 (OTA 업데이트)
```bash
npm run "codepush ios"      # snaplink-ios 앱에 iOS 번들 배포
npm run "codepush android"  # snaplink-android 앱에 Android 번들 배포
```
네이티브 변경 없는 JS 번들 변경만 OTA 배포 가능.

## 버전 관리
```bash
npm run release:patch   # 1.0.x → 1.0.x+1
npm run release:minor   # 1.x.0 → 1.x+1.0
npm run version         # Android build.gradle + iOS project.pbxproj 동기화
```

## 빌드/실행
```bash
npm run ios      # iOS 시뮬레이터
npm run android  # Android 에뮬레이터
npm run start    # Metro 번들러만 시작
```
