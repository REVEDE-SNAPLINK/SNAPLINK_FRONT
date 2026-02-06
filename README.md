# SNAPLINK - 스냅 사진 작가 예약 플랫폼

스냅 사진 작가와 고객을 연결하는 모바일 애플리케이션

## 📱 프로젝트 구조

```
SNAPLINK_FRONT/
├── front/          # React Native 앱
│   ├── src/        # 소스 코드
│   └── docs/       # 개발 문서
└── README.md       # 프로젝트 전체 가이드
```

## 📚 개발 문서

프로젝트의 상세 가이드는 `docs/` 폴더에서 확인할 수 있습니다:

- **[SETUP.md](docs/SETUP.md)** - 개발 환경 설정
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - 프로젝트 구조 및 아키텍처
- **[CONVENTIONS.md](docs/CONVENTIONS.md)** - 코딩 컨벤션
- **[COMPONENTS.md](docs/COMPONENTS.md)** - 컴포넌트 사용 가이드
- **[ANALYTICS_ANALYSIS.md](docs/ANALYTICS_ANALYSIS.md)** - 데이터 분석 및 수집 현황

## 🚀 빠른 시작

```bash
cd front
npm install

# iOS (시뮬레이터)
cd ios && bundle exec pod install && cd ..
npx react-native run-ios

# Android (에뮬레이터)
npx react-native run-android
```

## 🛠 기술 스택

- React Native 0.81.4
- TypeScript
- React Navigation
- styled-components
- Context API (상태 관리)

## 📌 Commit Convention

| Commit Type        | Description                              |
|--------------------|------------------------------------------|
| `feat`             | 새로운 기능 추가                                |
| `fix`              | 버그 수정                                    |
| `docs`             | 문서 수정                                    |
| `style`            | 코드 formatting, 세미콜론 누락, 코드 자체의 변경이 없는 경우 |
| `refactor`         | 코드 리팩토링                                  |
| `test`             | 테스트 코드, 리팩토링 테스트 코드 추가                   |
| `chore`            | 패키지 매니저 수정, 그 외 기타 수정 ex) .gitignore     |
| `design`           | CSS 등 사용자 UI 디자인 변경                      |
| `comment`          | 필요한 주석 추가 및 변경                           |
| `rename`           | 파일 또는 폴더 명을 수정하거나 옮기는 작업만인 경우            |
| `remove`           | 파일을 삭제하는 작업만 수행한 경우                      |
| `!breaking change` | 커다란 API 변경의 경우                           |
| `!hotfix`          | 급하게 치명적인 버그를 고쳐야 하는 경우                   |
