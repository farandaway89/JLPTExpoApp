# JLPT Expo App

전국 지역을 순회하는 **JLPT 오프라인 행사** 참가자를 위한 단어 학습 웹/모바일 앱입니다.  
행사장 Wi-Fi가 불안정해도 **오프라인**으로 N5~N1 단어를 학습·테스트할 수 있습니다.

## 프로젝트 배경

| 항목 | 내용 |
|------|------|
| 주제 | 지역별 찾아가는 오프라인 행사 — JLPT 설명회·박람회 |
| 목표 | 행사 참가 수험생이 현장에서 즉시 단어 학습 가능한 서비스 제공 |
| 개발 기간 | 10일 (개인 프로젝트) |
| 제출 | [GitHub](https://github.com/farandaway89/JLPTExpoApp) |

## 주요 기능

- **행사 안내** — 서울·부산·대구 등 지역별 JLPT 오프라인 행사 일정
- **플래시카드 학습** — JLPT N5~N1 레벨별 단어 카드
- **단어 테스트** — 레벨별 실력 확인 및 점수 기록
- **학습 통계** — 진도율, 연속 학습일 추적
- **오프라인 지원** — SQLite 로컬 DB, 인터넷 없이 학습 가능
- **음성 지원** — `expo-speech` TTS 발음 재생

## 기술 스택

- **React** (React Native + Expo 54)
- **JavaScript**
- **React Navigation** — 화면 라우팅
- **React Native Paper** — UI 컴포넌트
- **Expo SQLite** — 로컬 데이터베이스
- **Git** — 버전 관리

## 폴더 구조

```
JLPTExpoApp/
├── JLPTExpoApp/          # 메인 앱 (Expo)
│   ├── App.js            # 앱 진입점 · 네비게이션
│   ├── data/
│   │   └── events.js     # 지역별 행사 데이터
│   ├── screens/
│   │   ├── HomeScreen.js
│   │   ├── EventScreen.js    # 행사 안내
│   │   ├── FlashcardScreenFixed.js
│   │   ├── TestScreen.js
│   │   └── ...
│   ├── database/
│   │   └── DatabaseManager.js
│   └── assets/
│       └── jlpt_vocabulary.json
└── README.md
```

## 실행 방법

### 사전 요구사항

- [Node.js](https://nodejs.org/) 20 이상
- npm
- (모바일 테스트) [Expo Go](https://expo.dev/go) 앱

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/farandaway89/JLPTExpoApp.git
cd JLPTExpoApp/JLPTExpoApp

# 의존성 설치
npm install

# 개발 서버 시작
npx expo start
```

실행 후 터미널에서 선택:

| 키 | 동작 |
|----|------|
| `w` | 웹 브라우저에서 실행 |
| `a` | Android 에뮬레이터 |
| QR 코드 | Expo Go 앱으로 실기기 테스트 |

### 웹에서 실행

```bash
npx expo start --web
```

## 화면 구성

1. **홈** — 학습 통계, 다가오는 행사 미리보기, 학습 바로가기
2. **행사 안내** — 지역·일정·장소·추천 레벨, 행사 맞춤 학습 시작
3. **플래시카드** — 레벨별 단어 카드 학습
4. **단어 테스트** — 4지선다 퀴즈
5. **학습 통계** — 진도 및 성취도

## 데이터

- 단어 데이터: `assets/jlpt_vocabulary.json` (2,750+ 단어, N5~N1)
- 행사 데이터: `data/events.js` (지역별 오프라인 행사 일정)

## 제출 문서

- `JLPTExpoApp/JLPT_학습앱_개발계획서.html` — 개발 계획서
- `JLPTExpoApp/JLPT_일본어학습앱_완료보고서.html` — 완료 보고서
- `docs/주제연결_문단.md` — 과제 주제 연결 문단 (계획서·보고서용)

## 라이선스

개인 학습·포트폴리오 프로젝트 (Private)
