# 푸시 알림 디버깅 가이드

## 현재 상태
- ✅ FCM 토큰 생성 성공
- ✅ APNs 토큰 생성 성공
- ✅ 서버 등록 성공
- ❌ 테스트 푸시 알림이 디바이스에 도달하지 않음

## FCM 토큰
```
cwTK__exIEN-lgg-vjBHn1:APA91bHfKn0OX3ovmb7kQtm8uUp373XK8j8m-dyyHs1yVMjNLNXwKFAB6rkhxue7_4fLWfrQBaHsEWPtbP4ZV3mx8JhMwIv2LwBdpl5OohiJAwaS4__cqFs
```

## APNs 토큰
```
E9C2454E3345028C0D4F...
```

---

## 🔥 체크리스트: Firebase Console APNs 설정

### 1단계: Firebase Console APNs 설정 확인

1. Firebase Console 접속: https://console.firebase.google.com
2. 프로젝트 선택: SNAPLINK
3. 좌측 메뉴에서 **⚙️ 설정 > 프로젝트 설정** 클릭
4. **Cloud Messaging** 탭 선택
5. **Apple 앱 구성** 섹션에서 확인:

   - [ ] **APNs 인증 키**가 업로드되어 있는지 확인
   - [ ] **키 ID**가 올바른지 확인
   - [ ] **팀 ID**가 올바른지 확인

### 2단계: APNs 키 재업로드 (문제 있으면)

만약 APNs 키가 없거나 잘못되었다면:

1. Apple Developer 사이트 접속: https://developer.apple.com
2. **Certificates, Identifiers & Profiles** 이동
3. 좌측 **Keys** 선택
4. **+** 버튼으로 새 키 생성:
   - Key Name: "Firebase Push Key"
   - **Apple Push Notifications service (APNs)** 체크
   - Register 클릭
5. 다운로드한 `.p8` 파일을 Firebase Console에 업로드
6. Key ID와 Team ID를 정확히 입력

---

## 🧪 테스트 방법

### 방법 1: Firebase Console에서 테스트 메시지 보내기

1. Firebase Console → **Messaging** (또는 **Engagement > Messaging**)
2. **"새 캠페인" > "알림"** 클릭
3. 알림 제목/내용 입력:
   ```
   제목: 테스트 알림
   본문: 푸시 알림 테스트입니다
   ```
4. **다음** 클릭
5. **타겟 선택**에서 **"테스트 메시지 보내기"** 클릭
6. **FCM 등록 토큰 추가**에 위 FCM 토큰 붙여넣기:
   ```
   cwTK__exIEN-lgg-vjBHn1:APA91bHfKn0OX3ovmb7kQtm8uUp373XK8j8m-dyyHs1yVMjNLNXwKFAB6rkhxue7_4fLWfrQBaHsEWPtbP4ZV3mx8JhMwIv2LwBdpl5OohiJAwaS4__cqFs
   ```
7. **테스트** 버튼 클릭

**중요**:
- Development 빌드 (`yarn ios`)를 사용 중이면 → **APNs가 Sandbox 환경**을 사용
- Firebase는 자동으로 토큰을 보고 올바른 환경을 선택해야 함

### 방법 2: 서버에서 보내기

서버 개발자에게 다음 FCM 페이로드 형식으로 요청:

```json
{
  "message": {
    "token": "cwTK__exIEN-lgg-vjBHn1:APA91bHfKn0OX3ovmb7kQtm8uUp373XK8j8m-dyyHs1yVMjNLNXwKFAB6rkhxue7_4fLWfrQBaHsEWPtbP4ZV3mx8JhMwIv2LwBdpl5OohiJAwaS4__cqFs",
    "notification": {
      "title": "서버 테스트",
      "body": "서버에서 보낸 알림입니다"
    },
    "apns": {
      "payload": {
        "aps": {
          "alert": {
            "title": "서버 테스트",
            "body": "서버에서 보낸 알림입니다"
          },
          "sound": "default",
          "badge": 1
        }
      }
    },
    "data": {
      "type": "test",
      "timestamp": "2026-01-07T10:00:00Z"
    }
  }
}
```

**중요 사항**:
- `apns.payload.aps` 섹션이 **반드시** 있어야 iOS에서 알림이 표시됨
- `sound`와 `badge` 설정도 중요

---

## 📱 앱 상태별 테스트

### 1. Foreground (앱 열려있음)
- 앱을 열어놓고 테스트 알림 발송
- **기대 동작**: notifee로 로컬 알림 표시
- **확인 로그**: `[Foreground] FCM message received`

### 2. Background (앱 백그라운드)
- 홈 버튼 눌러 앱을 백그라운드로 보낸 후 테스트
- **기대 동작**: iOS 시스템 알림 표시
- **확인 로그**: `[Background] FCM message received`

### 3. Killed (앱 완전 종료)
- 앱 스와이프로 완전 종료 후 테스트
- **기대 동작**: iOS 시스템 알림 표시
- 알림 탭 시 앱 실행 및 `[Background Event]` 로그

---

## 🐛 문제 해결

### 문제 1: 여전히 알림이 안 옴

**확인 사항**:
1. iOS 설정 → 알림 → Snaplink → **알림 허용**이 켜져있는지 확인
2. Xcode에서 Device Logs 확인:
   - Xcode → Window → Devices and Simulators
   - 디바이스 선택 → View Device Logs
   - "APNS" 또는 "snaplink" 검색
   - APNs 관련 에러 확인

### 문제 2: "Registration failed" 에러

**해결**: Firebase Console APNs 설정 재확인
- Key ID 정확한지
- Team ID 정확한지
- .p8 파일이 올바른지

### 문제 3: Development 빌드에서는 되는데 TestFlight에서 안 됨

**원인**: APNs 환경 차이
- Development = Sandbox APNs
- TestFlight/Production = Production APNs

**해결**:
- Firebase에서는 하나의 APNs 키로 양쪽 다 지원
- 서버에서 보낼 때 환경을 명시하지 말고 FCM이 자동 감지하도록

---

## 🔍 추가 디버깅

### FCM 토큰 확인
```typescript
// 앱에서 FCM 토큰 출력 (이미 로그에 있음)
messaging().getToken().then(token => {
  console.log('Current FCM Token:', token);
});
```

### APNs 토큰 확인
```typescript
// 앱에서 APNs 토큰 출력 (이미 로그에 있음)
messaging().getAPNSToken().then(token => {
  console.log('Current APNs Token:', token);
});
```

### 권한 상태 확인
```typescript
messaging().hasPermission().then(status => {
  console.log('Permission status:', status);
  // 1 = AUTHORIZED
  // 2 = PROVISIONAL
  // 0 = DENIED
});
```

---

## 📞 서버 팀에게 전달할 정보

1. **FCM 토큰**: `cwTK__exIEN-lgg-vjBHn1:APA91bHfKn0OX3ovmb7kQtm8uUp373XK8j8m-dyyHs1yVMjNLNXwKFAB6rkhxue7_4fLWfrQBaHsEWPtbP4ZV3mx8JhMwIv2LwBdpl5OohiJAwaS4__cqFs`

2. **필수 페이로드 형식**: 위의 JSON 참조

3. **중요**: iOS에서는 `apns.payload.aps` 섹션이 **반드시** 필요합니다

4. **디버깅**: Firebase Console의 "Messaging" → "Reports"에서 전송 성공/실패 확인 가능

---

## ✅ 성공 확인

알림이 제대로 작동하면 다음 로그가 보여야 합니다:

```
[Foreground] FCM message received: {notification: {title: "테스트", body: "..."}}
[Notification] Displayed successfully
```

또는 (백그라운드/종료 상태):
```
[Background] FCM message received: {notification: {...}}
```
