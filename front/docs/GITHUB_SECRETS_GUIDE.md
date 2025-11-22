# GitHub Secrets 설정 가이드

GitHub Actions에서 안전하게 민감한 정보를 관리하는 방법을 설명합니다.

## 필수 GitHub Secrets 목록

### **Android (5개)**

#### `ANDROID_KEYSTORE_BASE64`
- Release keystore 파일을 base64로 인코딩한 값
- 생성: `cat android/app/release.keystore | base64`

#### `ANDROID_KEYSTORE_PASSWORD`
- Keystore 파일의 비밀번호
- gradle.properties:50 참조 (현재: `teamrevede55@`)

#### `ANDROID_KEY_ALIAS`
- Keystore의 key alias
- gradle.properties:51 참조 (현재: `snaplink_keystore`)

#### `ANDROID_KEY_PASSWORD`
- Key의 비밀번호
- gradle.properties:52 참조 (현재: `teamrevede55@`)

#### `PLAY_STORE_JSON_KEY`
- Google Play Console Service Account JSON 키
- android/fastlane/Appfile:1에서 사용
- Play Console > 설정 > API 액세스에서 다운로드

---

### **iOS (6개)**

#### `CERTIFICATES_P12`
- Apple 코드 사이닝 인증서 (.p12 파일)를 base64로 인코딩한 값
- 생성: `cat certificate.p12 | base64`

#### `CERTIFICATES_P12_PASSWORD`
- P12 인증서 파일의 비밀번호

#### `APPLE_ID`
- Apple Developer 계정 이메일
- ios/fastlane/Appfile:2 참조

#### `FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD`
- Apple ID의 앱별 비밀번호
- appleid.apple.com에서 생성

#### `APP_STORE_CONNECT_TEAM_ID`
- App Store Connect 팀 ID
- ios/fastlane/Appfile:4 참조

#### `DEVELOPER_PORTAL_TEAM_ID`
- Apple Developer Portal 팀 ID
- ios/fastlane/Appfile:5 참조

---

### **선택 사항 (iOS Match 사용 시)**

#### `MATCH_PASSWORD`
- Fastlane Match 사용 시 암호화 비밀번호
- ios-deploy.yml:59에서 사용됨

---

## GitHub Secrets 추가 방법

### 1. Repository로 이동
```
GitHub 저장소 페이지 → Settings → Secrets and variables → Actions
```

---

## Repository Secrets vs Environment Secrets

### **Repository Secrets**
- **범위**: 저장소 전체에서 사용 가능
- **접근**: 모든 워크플로우, 모든 브랜치에서 접근 가능
- **보안 수준**: 기본 보호
- **사용 예시**:
  - API 키
  - 빌드 인증서
  - 서비스 계정 JSON

**장점**:
- 설정이 간단함
- 모든 워크플로우에서 바로 사용 가능

**단점**:
- 브랜치/환경별 제어 불가
- 누구나 워크플로우만 작성하면 접근 가능

---

### **Environment Secrets**
- **범위**: 특정 환경(예: production, staging)에서만 사용
- **접근**: 해당 환경을 사용하는 워크플로우에서만 접근 가능
- **보호 규칙**: 승인자 설정, 대기 시간, 특정 브랜치만 허용 등
- **사용 예시**:
  - Production 배포 키
  - 프로덕션 데이터베이스 비밀번호
  - 실제 스토어 배포 인증서

**장점**:
- **승인 프로세스**: 배포 전 승인자의 승인 필요
- **브랜치 제한**: `main`, `develop` 브랜치만 접근 허용
- **감사 로그**: 누가 언제 사용했는지 추적
- **환경별 분리**: dev/staging/production 환경별로 다른 값 사용

**단점**:
- 초기 설정이 복잡함
- 워크플로우에서 environment 명시 필요

---

## 비교표

| 기능 | Repository Secrets | Environment Secrets |
|------|-------------------|---------------------|
| 설정 난이도 | ⭐ 쉬움 | ⭐⭐⭐ 복잡 |
| 배포 승인 | ❌ 없음 | ✅ 가능 |
| 브랜치 제한 | ❌ 없음 | ✅ 가능 |
| 환경별 분리 | ❌ 불가능 | ✅ 가능 |
| 즉시 사용 | ✅ 가능 | ❌ 워크플로우 수정 필요 |
| 보안 수준 | 🔒 기본 | 🔒🔒🔒 높음 |

---

## 방법 1: Repository Secrets 사용 (빠른 시작)

### 현재 워크플로우 기준으로 바로 사용 가능

#### 단계:
1. `Settings → Secrets and variables → Actions → Repository secrets`
2. `New repository secret` 클릭
3. Name과 Value 입력
4. `Add secret` 클릭

#### 모든 Secrets 추가:

**Android:**
- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`
- `PLAY_STORE_JSON_KEY`

**iOS:**
- `CERTIFICATES_P12`
- `CERTIFICATES_P12_PASSWORD`
- `APPLE_ID`
- `FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD`
- `APP_STORE_CONNECT_TEAM_ID`
- `DEVELOPER_PORTAL_TEAM_ID`
- `MATCH_PASSWORD` (선택 사항)

---

## 방법 2: Environment Secrets 사용 (보안 강화)

### 1. Environment 생성

#### Production 환경:
```
Settings → Environments → New environment
```

- Name: `production`
- Protection rules:
  - ✅ Required reviewers: 팀 리더 지정
  - ✅ Deployment branches: `main` 브랜치만 허용

#### Staging 환경:
- Name: `staging`
- Protection rules:
  - ✅ Deployment branches: `develop` 브랜치만 허용

### 2. Environment Secrets 추가
```
Settings → Environments → production → Add secret
```

위의 모든 secrets를 각 환경에 추가

### 3. 워크플로우 수정

**`.github/workflows/android-deploy.yml` 수정**:
```yaml
jobs:
  deploy_android:
    name: Deploy Android to Play Store
    runs-on: ubuntu-latest
    environment: production  # 이 줄 추가

    steps:
      # ... 나머지 동일
```

**`.github/workflows/ios-deploy.yml` 수정**:
```yaml
jobs:
  deploy_ios:
    name: Deploy iOS to TestFlight
    runs-on: macos-latest
    environment: production  # 이 줄 추가

    steps:
      # ... 나머지 동일
```

---

## Base64 인코딩 명령어

### macOS/Linux

```bash
# Android Keystore
cat android/app/release.keystore | base64 | pbcopy  # 클립보드에 자동 복사

# 또는 파일로 저장
cat android/app/release.keystore | base64 > keystore.base64.txt

# iOS P12 인증서
cat certificate.p12 | base64 | pbcopy

# Google Play JSON 키
cat play-store-credentials.json | base64 | pbcopy
```

### Windows (Git Bash)

```bash
# Android Keystore
cat android/app/release.keystore | base64

# iOS P12 인증서
cat certificate.p12 | base64

# Google Play JSON 키
cat play-store-credentials.json | base64
```

---

## 실용적 추천 전략

### **단계 1: 빠른 시작 (Repository Secrets)**
- CI/CD 파이프라인 빠르게 구축
- 설정 시간: 5-10분
- 워크플로우 수정 불필요
- 테스트 및 검증

### **단계 2: 보안 강화 (Environment Secrets)**
- Production 배포 시 승인 프로세스 추가
- 실수로 잘못된 브랜치에서 배포 방지
- 감사 추적 강화
- 팀 규모가 커질 때 필수

---

## 보안 주의사항

### ⚠️ 즉시 수정 필요

**`android/gradle.properties` 파일**:
- 현재 평문 비밀번호가 하드코딩되어 있음 (49-52줄)
- 해결 방법:

#### 옵션 1: .gitignore 추가
```bash
echo "android/gradle.properties" >> .gitignore
git rm --cached android/gradle.properties
```

#### 옵션 2: gradle.properties 정리
비밀번호 관련 줄 제거:
```properties
# 이 줄들을 삭제하거나 주석 처리
# SNAPLINK_RELEASE_STORE_FILE=snaplink_keystore.keystore
# SNAPLINK_RELEASE_STORE_PASSWORD=teamrevede55@
# SNAPLINK_RELEASE_KEY_ALIAS=snaplink_keystore
# SNAPLINK_RELEASE_KEY_PASSWORD=teamrevede55@
```

GitHub Actions에서 자동으로 주입되므로 로컬 파일에 저장 불필요

---

## 문제 해결

### "Secret이 인식되지 않아요"
- Secret 이름의 오타 확인
- 워크플로우 파일에서 `${{ secrets.SECRET_NAME }}` 정확히 사용
- Secret 값에 공백이나 줄바꿈이 없는지 확인

### "Base64 디코딩 실패"
```bash
# base64 인코딩 시 줄바꿈 제거
cat file | base64 | tr -d '\n'
```

### "Provisioning Profile을 찾을 수 없음"
- Xcode에서 "Automatically manage signing" 비활성화
- Manual로 Provisioning Profile 선택
- Profile이 만료되지 않았는지 확인

---

## 참고 자료

- [GitHub Actions Secrets 공식 문서](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Fastlane 공식 문서](https://docs.fastlane.tools)
- [CD 빠른 시작 가이드](./CD_QUICK_START.md)
