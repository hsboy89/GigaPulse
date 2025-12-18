# Giga-Pulse: 테슬라 주주 전용 인텔리전스 대시보드

## 📋 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [화면 구성](#화면-구성)
3. [데이터 소스 및 API 통합](#데이터-소스-및-api-통합)
4. [데이터 흐름](#데이터-흐름)
5. [주요 기능](#주요-기능)
6. [기술 스택](#기술-스택)
7. [파일 구조](#파일-구조)
8. [환경 변수 설정](#환경-변수-설정)
9. [업데이트 주기](#업데이트-주기)

---

## 프로젝트 개요

**Giga-Pulse**는 테슬라 주주를 위한 실시간 인텔리전스 대시보드입니다. 주가에 영향을 미치는 다양한 정보를 통합하여 투자 판단을 돕는 All-in-One 솔루션을 제공합니다.

### 핵심 가치
- **실시간 데이터 통합**: Finnhub API를 통한 실시간 주가 및 뉴스 데이터
- **시나리오 기반 포트폴리오 시뮬레이션**: 다양한 시나리오에 따른 수익률 예측
- **다각도 정보 분석**: 정책, 뉴스, 머스크 활동을 한눈에 확인
- **X Embed Widget 통합**: Elon Musk의 최신 트윗 실시간 표시

---

## 화면 구성

### 레이아웃 구조

```
┌─────────────────────────────────────────────────────────────┐
│ Header (Sticky)                                             │
│ - Giga-Pulse 로고                                           │
│ - 실시간 주가: $XXX.XX (변동률, 변동금액)                   │
│ - 마켓 상태: Premarket/Daymarket/Aftermarket/Closed        │
│ - 마지막 업데이트 시간                                      │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────┬──────────────────┐
│                  │                  │                  │
│  Elon's X Feed   │ Tesla News       │ Portfolio        │
│  (X Embed Widget)│ Monitor          │ Simulator        │
│                  │ (Finnhub News)   │                  │
│                  │                  │                  │
│  - X 위젯        │ - 최신 뉴스      │ - 보유 주식 정보  │
│  - 30초마다      │ - 카테고리별     │ - 손익 계산       │
│    새로고침      │   분류           │ - 시나리오 분석   │
│                  │ - 감정 분석      │ - 세금 계산       │
│                  │ - 영향도 표시    │                  │
│                  │                  │                  │
└──────────────────┴──────────────────┴──────────────────┘

┌──────────────────────────┬──────────────────────────┐
│ Macro Indicators         │ Fear & Greed Index       │
│ - GDP, 인플레이션 등     │ - 투자 심리 지수         │
└──────────────────────────┴──────────────────────────┘
```

### 주요 컴포넌트

#### 1. **Header** (`src/components/Header.tsx`)
- **위치**: 상단 고정 (Sticky)
- **표시 내용**:
  - Giga-Pulse 로고 및 부제목
  - 실시간 주가 (USD)
  - 변동률 (%) 및 변동 금액 ($)
  - 마켓 상태 배지 (Premarket/Daymarket/Aftermarket/Closed)
  - 고가/저가 정보
  - 마지막 업데이트 시간 (HH:MM 형식)

#### 2. **Elon's X Feed** (`src/components/MuskFeed.tsx`)
- **위치**: 좌측 패널
- **기능**:
  - X (Twitter) Embed Widget을 통한 Elon Musk 타임라인 표시
  - 30초마다 자동 새로고침 (최신 트윗 표시)
  - 위젯 로드 실패 시 에러 메시지 및 직접 링크 제공
  - 높이: 600px, 내부 스크롤 가능

#### 3. **Tesla News Monitor** (`src/components/PolicyMonitor.tsx`)
- **위치**: 중앙 패널
- **기능**:
  - Finnhub News API에서 가져온 뉴스만 표시 (ID가 `finnhub-`로 시작)
  - 카테고리별 분류 및 아이콘 표시:
    - 🚀 Musk: 일론 머스크 관련
    - 🇺🇸 Policy: 정책 및 정치
    - 📊 Macro: 거시경제
    - 📈 Tesla: 테슬라 일반
  - 감정 분석 (긍정/부정/중립) 및 색상 표시
  - 영향도 점수 (-20 ~ +20)
  - 최신순 정렬, 최대 20개 표시
  - 내부 스크롤 가능

#### 4. **Portfolio Simulator** (`src/components/PortfolioSimulator.tsx`)
- **위치**: 우측 패널
- **기능**:
  - 보유 주식 정보 입력 (주수, 평균 단가, 환율)
  - 실시간 P&L 계산 (USD 및 원화)
  - 세금 계산 (미주식 양도소득세 22%, 250만원 공제)
  - 시나리오 시뮬레이션:
    - 머스크 리스크: -10% ~ 0%
    - 트럼프 정책 영향: -15% ~ +25%
    - 로보택시 밸류에이션: 0% ~ +200%

#### 5. **Macro Indicators** (`src/components/MacroIndicators.tsx`)
- **위치**: 하단 좌측
- **기능**: 거시경제 지표 표시 (GDP, 인플레이션 등)

#### 6. **Fear & Greed Index** (`src/components/FearGreedIndex.tsx`)
- **위치**: 하단 우측
- **기능**: 투자 심리 지수 표시

---

## 데이터 소스 및 API 통합

### 1. 주가 데이터: Finnhub API

#### API 엔드포인트
```
GET https://finnhub.io/api/v1/quote?symbol=TSLA&token={API_KEY}
```

#### 응답 데이터 구조
```json
{
  "c": 467.22,  // Current price
  "h": 470.00,  // High price
  "l": 465.00,  // Low price
  "o": 468.00,  // Open price
  "pc": 467.26, // Previous close
  "t": 1234567890 // Timestamp
}
```

#### 구현 위치
- `src/utils/stockApi.ts`: `fetchTSLAPriceFromFinnhub()`
- `src/hooks/useNewsUpdate.ts`: `fetchRealTimePrice()`

#### 특징
- **업데이트 주기**: 1분마다
- **마켓 상태 자동 감지**: `src/utils/marketStatus.ts`
- **종가 관리**: 전일 종가는 하루 종일 유지, 새 거래일 시작 시 업데이트
- **고가/저가 누적**: 마켓이 열려있는 동안 실시간 누적

---

### 2. 뉴스 데이터: Finnhub News API

#### API 엔드포인트
```
GET https://finnhub.io/api/v1/company-news?symbol=TSLA&from={YYYY-MM-DD}&to={YYYY-MM-DD}&token={API_KEY}
```

#### 응답 데이터 구조
```json
[
  {
    "id": 12345,
    "datetime": 1234567890,
    "headline": "Tesla announces new factory",
    "summary": "Tesla announced plans to build...",
    "source": "Reuters",
    "url": "https://...",
    "image": "https://...",
    "category": "general"
  }
]
```

#### 구현 위치
- `src/utils/stockApi.ts`: `fetchTSLANewsFromFinnhub()`
- `src/hooks/useNewsUpdate.ts`: `fetchNewsFromAPI()`

#### 데이터 변환 로직
1. **카테고리 자동 분류**:
   - 키워드 기반 분류 (musk, policy, macro, tesla)
2. **감정 분석**:
   - 긍정 키워드: surge, gain, rise, increase, growth, success, approval, breakthrough, record
   - 부정 키워드: fall, drop, decline, loss, fine, penalty, lawsuit, concern, risk
3. **영향도 계산**:
   - 긍정: 최대 +20 (키워드 개수 × 3)
   - 부정: 최소 -20 (키워드 개수 × 3)

#### 특징
- **업데이트 주기**: 주가 업데이트와 동기화 (1분마다)
- **기간**: 최근 7일간의 뉴스
- **필터링**: TeslaNewsMonitor에서 `finnhub-`로 시작하는 ID만 표시
- **최대 개수**: 20개

---

### 3. X (Twitter) Embed Widget

#### 구현 방식
- X 공식 Embed Widget 사용
- `index.html`에 `<script async src="https://platform.twitter.com/widgets.js">` 추가
- `window.twttr.widgets.createTimeline()` 사용

#### 구현 위치
- `src/components/MuskFeed.tsx`
- `src/types/twitter.d.ts` (타입 정의)

#### 위젯 설정
```typescript
{
  sourceType: 'profile',
  screenName: 'elonmusk',
  height: 600,
  width: '100%',
  theme: 'dark',
  tweetLimit: 20,
  chrome: 'noheader nofooter' // 헤더/푸터 제거
}
```

#### 특징
- **업데이트 주기**: 30초마다 완전히 새로고침
- **에러 처리**: 429 (Too Many Requests) 에러 시 안내 메시지 및 직접 링크 제공
- **DOM 정리**: 새로고침 시 기존 위젯 완전히 제거 후 재생성

---

## 데이터 흐름

### 전체 데이터 흐름도

```
┌─────────────────────────────────────────────────────────┐
│                    useNewsUpdate Hook                    │
│                  (src/hooks/useNewsUpdate.ts)            │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Finnhub API  │  │ Finnhub News │  │ X Embed Widget│
│ (주가)       │  │ API (뉴스)   │  │ (트윗)       │
└──────────────┘  └──────────────┘  └──────────────┘
        │                 │                 │
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Header       │  │ TeslaNews    │  │ MuskFeed     │
│ Component    │  │ Monitor      │  │ Component    │
└──────────────┘  └──────────────┘  └──────────────┘
```

### 주가 데이터 흐름

```
1. 컴포넌트 마운트
   ↓
2. fetchRealTimePrice() 호출
   ↓
3. fetchTSLAPriceFromFinnhub() 실행
   ├─ 성공 → TeslaPrice 상태 업데이트
   │   ├─ 종가 처리 (초기 로드 또는 새 거래일)
   │   ├─ 마켓 상태 감지
   │   ├─ 고가/저가 누적 (마켓 열림 시)
   │   └─ 변동률 계산 (전일 종가 기준)
   └─ 실패 → 기존 데이터 유지
   ↓
4. Header 컴포넌트에 전달
   ↓
5. 1분마다 반복
```

### 뉴스 데이터 흐름

```
1. 컴포넌트 마운트 또는 주가 업데이트 시점
   ↓
2. fetchNewsFromAPI() 호출
   ↓
3. fetchTSLANewsFromFinnhub() 실행
   ├─ 성공 → NewsItem[] 변환
   │   ├─ 카테고리 자동 분류
   │   ├─ 감정 분석
   │   ├─ 영향도 계산
   │   └─ ID: "finnhub-{id}-{timestamp}"
   └─ 실패 → 기존 뉴스 유지
   ↓
4. newsItems 상태 업데이트 (최신순 정렬, 최대 20개)
   ↓
5. TeslaNewsMonitor에 전달
   ↓
6. finnhubNewsItems 필터링 (ID가 'finnhub-'로 시작)
   ↓
7. 화면에 표시
```

### X 위젯 데이터 흐름

```
1. 컴포넌트 마운트
   ↓
2. window.twttr.widgets 확인
   ├─ 로드됨 → loadTwitterWidget() 즉시 실행
   └─ 미로드 → 100ms마다 체크 (최대 5초)
   ↓
3. createTimeline() 호출
   ├─ 성공 → 위젯 표시
   └─ 실패 (429) → 에러 메시지 및 링크 표시
   ↓
4. 30초마다 새로고침
   ├─ 기존 위젯 완전히 제거
   └─ 새 위젯 생성
```

---

## 주요 기능

### 1. 실시간 주가 모니터링

- **Finnhub API 통합**: 실시간 주가 데이터 (L1 데이터)
- **마켓 상태 자동 감지**:
  - Premarket: 04:00 - 09:30 (KST)
  - Daymarket: 09:30 - 16:00 (KST)
  - Aftermarket: 16:00 - 20:00 (KST)
  - Closed: 그 외 시간
- **종가 관리**:
  - 전일 종가는 하루 종일 유지
  - 새 거래일 시작 시 업데이트
- **고가/저가 누적**: 마켓이 열려있는 동안 실시간 누적

### 2. 테슬라 뉴스 모니터링

- **Finnhub News API 통합**: 최근 7일간의 테슬라 관련 뉴스
- **자동 분류**:
  - 카테고리: Musk, Policy, Macro, Tesla
  - 감정: Positive, Negative, Neutral
  - 영향도: -20 ~ +20
- **필터링**: Finnhub에서 가져온 뉴스만 표시

### 3. Elon Musk X 피드

- **X Embed Widget**: 공식 위젯을 통한 실시간 타임라인
- **자동 새로고침**: 30초마다 최신 트윗 가져오기
- **에러 처리**: Rate limit 에러 시 안내 메시지

### 4. 포트폴리오 시뮬레이터

- **실시간 P&L 계산**: 현재가 기준 손익 계산
- **세금 계산**: 미주식 양도소득세 22%, 250만원 공제
- **시나리오 분석**: 다양한 시나리오에 따른 수익률 예측

---

## 기술 스택

### 프론트엔드
- **React 18.2.0**: UI 라이브러리
- **TypeScript 5.2.2**: 타입 안전성
- **Vite 5.0.8**: 빌드 도구 및 개발 서버

### 스타일링
- **Tailwind CSS 3.3.6**: 유틸리티 기반 CSS
- **PostCSS**: CSS 후처리
- **Autoprefixer**: 브라우저 호환성

### 차트 및 시각화
- **Recharts 2.10.3**: 차트 라이브러리

### 외부 서비스
- **Finnhub API**: 주가 및 뉴스 데이터
- **X Embed Widget**: Elon Musk 트윗 표시

---

## 파일 구조

```
GigaPulse/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx          # 메인 대시보드 레이아웃
│   │   ├── Header.tsx             # 헤더 (실시간 주가 정보)
│   │   ├── MuskFeed.tsx           # Elon Musk X 피드 (X Embed Widget)
│   │   ├── PolicyMonitor.tsx      # Tesla News Monitor (Finnhub News)
│   │   ├── PortfolioSimulator.tsx # 포트폴리오 시뮬레이터
│   │   ├── ScenarioSlider.tsx     # 시나리오 슬라이더
│   │   ├── MacroIndicators.tsx    # 거시경제 지표
│   │   └── FearGreedIndex.tsx     # Fear & Greed Index
│   ├── data/
│   │   └── initialData.ts         # 초기 데이터 (뉴스, 트윗, 주가)
│   ├── hooks/
│   │   └── useNewsUpdate.ts       # 뉴스/주가 업데이트 로직 (핵심)
│   ├── types/
│   │   ├── index.ts               # TypeScript 타입 정의
│   │   └── twitter.d.ts           # X (Twitter) 위젯 타입 정의
│   ├── utils/
│   │   ├── stockApi.ts            # Finnhub API (주가 + 뉴스)
│   │   ├── taxCalculator.ts       # 세금 계산
│   │   ├── marketStatus.ts        # 마켓 상태 감지
│   │   ├── newsApi.ts             # NewsAPI/GNews.io (백업)
│   │   └── googleNewsRss.ts       # Google News RSS (백업)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── docs/
│   └── current-implementation.md  # 현재 구현 상태 (이 문서)
├── README.md
├── README_API_SETUP.md            # API 설정 가이드
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── index.html                     # X Embed Widget 스크립트 포함
```

---

## 환경 변수 설정

### .env 파일 예시

```env
# Finnhub API 키 (주가 + 뉴스)
VITE_FINNHUB_API_KEY=your_finnhub_api_key_here
```

### API 키 발급 방법

1. **Finnhub**: https://finnhub.io/
   - 무료 플랜: 실시간 주가 (L1 데이터), 최근 1년간 뉴스
   - API 키 발급 후 `.env` 파일에 추가

> **참고**: API 키가 없어도 대시보드는 작동하지만, 실시간 데이터는 표시되지 않습니다.

---

## 업데이트 주기

### 주가 데이터
- **주기**: 1분마다
- **API**: Finnhub Quote API
- **함수**: `fetchRealTimePrice()` → `fetchTSLAPriceFromFinnhub()`

### 뉴스 데이터
- **주기**: 주가 업데이트와 동기화 (1분마다)
- **API**: Finnhub News API
- **함수**: `fetchRealTimePrice()` → `fetchNewsFromAPI()` → `fetchTSLANewsFromFinnhub()`

### X 위젯
- **주기**: 30초마다
- **방식**: X Embed Widget 완전히 새로고침
- **함수**: `loadTwitterWidget(true)`

### 시뮬레이션 데이터 (백업)
- **주기**: 1분마다
- **용도**: API 실패 시 백업 데이터
- **함수**: `updateNews()`

---

## 주요 로직 설명

### 1. 종가 관리 로직

```typescript
// 초기 데이터인지 확인
const isInitialData = Math.abs(prev.closePrice - initialPrice.closePrice) < 0.01;

// 새 거래일 시작인지 확인
const isMarketDayChange = prev.marketStatus === 'closed' && marketStatus === 'premarket';

// 종가 업데이트 조건
const newClosePrice = (isInitialData || isMarketDayChange) 
  ? priceData.closePrice  // API에서 받은 종가 사용
  : prev.closePrice;      // 기존 종가 유지
```

### 2. 마켓 세그먼트 종료 가격 저장

```typescript
if (prevMarketStatus !== marketStatus) {
  if (prevMarketStatus === 'premarket' && marketStatus === 'daymarket') {
    newPreviousMarketClose = prev.current; // 프리마켓 종료 가격
  } else if (prevMarketStatus === 'daymarket' && marketStatus === 'aftermarket') {
    newPreviousMarketClose = prev.current; // 데이마켓 종료 가격
  }
  // ...
}
```

### 3. 뉴스 필터링 (TeslaNewsMonitor)

```typescript
// Finnhub에서 가져온 뉴스만 필터링
const finnhubNewsItems = newsItems.filter(item => item.id.startsWith('finnhub-'));
```

### 4. X 위젯 새로고침

```typescript
// 기존 위젯 완전히 제거
while (widgetRef.current.firstChild) {
  widgetRef.current.removeChild(widgetRef.current.firstChild);
}
widgetRef.current.innerHTML = '';

// 약간의 지연 후 새 위젯 생성 (DOM 정리 시간 확보)
setTimeout(() => {
  window.twttr.widgets.createTimeline({...}, widgetRef.current);
}, 150);
```

---

## 문제 해결 가이드

### Finnhub API 키가 로드되지 않음
- **원인**: `.env` 파일이 루트에 없거나 서버가 재시작되지 않음
- **해결**: 
  1. 프로젝트 루트에 `.env` 파일 생성
  2. `VITE_FINNHUB_API_KEY=your_key` 추가
  3. 개발 서버 재시작 (`npm run dev`)

### X 위젯이 표시되지 않음
- **원인**: Rate limit (429 에러) 또는 네트워크 문제
- **해결**: 
  1. 브라우저 콘솔 확인
  2. 429 에러인 경우 잠시 후 자동 재시도
  3. 직접 링크 버튼 클릭하여 X 프로필 확인

### 뉴스가 표시되지 않음
- **원인**: Finnhub News API 호출 실패 또는 필터링 문제
- **해결**: 
  1. 브라우저 콘솔에서 "✅ Finnhub에서 X개의 테슬라 뉴스를 가져왔습니다." 메시지 확인
  2. `TeslaNewsMonitor`에서 `finnhubNewsItems` 필터링 확인

---

## 향후 개선 사항

### 단기 개선
- [ ] 뉴스 카테고리 분류 정확도 향상 (AI 기반)
- [ ] 감정 분석 정확도 향상 (자연어 처리)
- [ ] X 위젯 Rate limit 대응 개선

### 중기 개선
- [ ] 포트폴리오 히스토리 저장 (LocalStorage)
- [ ] 알림 기능 (목표가 도달, 중요 뉴스 등)
- [ ] 차트 추가 (주가 차트, 뉴스 타임라인)

### 장기 개선
- [ ] 백엔드 서버 구축 (CORS 문제 해결)
- [ ] 사용자 인증 및 개인화
- [ ] 모바일 앱 개발

---

**최종 업데이트**: 2025년 1월  
**버전**: 2.0.0  
**주요 변경사항**: Finnhub API 통합, X Embed Widget 통합, Tesla News Monitor 구현
