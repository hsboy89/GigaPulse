# 현재 구현 상태 및 아키텍처 문서

## 📋 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [구현된 기능](#구현된-기능)
3. [데이터 소스 및 API 통합](#데이터-소스-및-api-통합)
4. [기술 스택](#기술-스택)
5. [주요 변경 사항](#주요-변경-사항)
6. [향후 개선 사항](#향후-개선-사항)

---

## 프로젝트 개요

**Giga-Pulse**는 테슬라 주주를 위한 실시간 인텔리전스 대시보드입니다. 주가에 영향을 미치는 다양한 정보를 통합하여 투자 판단을 돕는 All-in-One 솔루션을 제공합니다.

### 핵심 가치
- 실시간 데이터 통합
- 시나리오 기반 포트폴리오 시뮬레이션
- 다각도 정보 분석 (정책, 뉴스, 머스크 활동)

---

## 구현된 기능

### 1. 💰 Tesla Vision: Portfolio Impact Simulator

#### 포트폴리오 평가
- **실시간 P&L 계산**
  - 보유 주수, 평균 단가, 환율 입력
  - 현재가 기준 실시간 평가액 계산
  - 손익금 (USD 및 원화) 표시

- **세금 계산**
  - 미주식 양도소득세 22% 자동 계산
  - 250만원 공제 자동 적용
  - 실질 수익금 (원화) 표시

#### 시나리오 시뮬레이션
- **머스크 리스크**: -10% ~ 0%
  - X 지분 인수 매도 시나리오
- **트럼프 정책 영향**: -15% ~ +25%
  - 보조금 폐지 (-15%) ~ 규제 완화 (+25%)
- **로보택시 밸류에이션**: 0% ~ +200%
  - $1,000+ 목표가 시나리오

#### 목표가 알림
- 전고점 $490 돌파 시 알림
- 지지선 $450 이탈 시 손절 고려 알림

### 2. 📊 Giga-Pulse 대시보드

#### 🚀 Elon's X Feed
- **X 프로필 링크 버튼**
  - Elon Musk의 X 프로필로 직접 연결
  - 새 창에서 열림
  - 그라데이션 스타일 버튼

- **시뮬레이션 트윗 데이터**
  - 키워드 태그 표시
  - 감정 분석 (긍정/부정/중립)
  - 요약 정보 제공
  - 1분마다 자동 업데이트

#### 🇺🇸 Policy & News Monitor
- **카테고리별 뉴스 분류**
  - Tesla: 테슬라 관련 뉴스
  - Policy: 트럼프 정책 및 정치 뉴스
  - Macro: 거시경제 지표 (연준, 금리 등)
  - Musk: 일론 머스크 관련 뉴스

- **뉴스 정보 표시**
  - 제목, 내용, 발행 시간
  - 감정 분석 (긍정/부정/중립)
  - 영향도 점수 (-100 ~ +100)
  - 최신순 정렬

- **실시간 업데이트**
  - 1분마다 자동 갱신
  - 최대 20개 뉴스 유지

#### 📈 실시간 주가 정보 (Header)
- **주가 표시**
  - 현재가 (USD)
  - 변동률 (%) 및 변동 금액 ($)
  - 고가/저가 표시

- **마켓 상태 자동 감지**
  - 프리마켓 (Premarket)
  - 데이마켓 (Daymarket)
  - 애프터마켓 (Aftermarket)
  - 종가 (Closed)

- **마지막 업데이트 시간**
  - "방금 전 (HH:MM)" 형식

#### 📊 거시경제 지표
- GDP, 인플레이션, 고용 데이터
- Fear & Greed Index

---

## 데이터 소스 및 API 통합

### 뉴스 데이터 소스 (우선순위 순)

#### 1. NewsAPI.org / GNews.io (방법 A - 추천)
- **상태**: 구현 완료, API 키 필요
- **위치**: `src/utils/newsApi.ts`
- **장점**:
  - CORS 걱정 없이 직접 호출 가능
  - JSON 형식으로 깔끔한 데이터
  - 에러 발생률 낮음
- **설정**: 
  - `.env` 파일에 `VITE_NEWS_API_KEY` 또는 `VITE_GNEWS_API_KEY` 설정
  - 또는 `src/utils/newsApi.ts`에서 직접 설정

#### 2. Google News RSS (Fallback)
- **상태**: 구현 완료, CORS 프록시 사용
- **위치**: `src/utils/googleNewsRss.ts`
- **프록시 서비스**:
  - `corsproxy.io`
  - `api.allorigins.win`
  - `api.codetabs.com`
- **문제점**:
  - CORS 정책으로 인해 프록시 필요
  - 프록시 서버 불안정
  - 에러 발생 가능성 높음

#### 3. 시뮬레이션 데이터 (최종 Fallback)
- **상태**: 항상 사용 가능
- **위치**: `src/data/initialData.ts`, `src/hooks/useNewsUpdate.ts`
- **특징**:
  - API 실패 시 자동으로 사용
  - 1분마다 새로운 뉴스/트윗 추가
  - 랜덤 선택으로 다양성 제공

### Elon Musk 트윗 데이터

#### X 프로필 링크 (방법 B - 구현 완료)
- **상태**: 구현 완료
- **위치**: `src/components/MuskFeed.tsx`
- **구현 방식**:
  - Twitter 위젯 제거
  - X 프로필로 연결되는 버튼 제공
  - 시뮬레이션 트윗 데이터 표시

#### 시뮬레이션 트윗 데이터
- **위치**: `src/hooks/useNewsUpdate.ts`의 `muskPostPool`
- **업데이트 주기**: 1분마다 (60% 확률)
- **최대 개수**: 10개

### 주가 데이터

#### 현재 상태
- **CBOE API**: 비활성화 (CORS/프록시 이슈)
- **시뮬레이션 데이터**: 사용 중
- **마켓 상태**: 자동 감지 (`src/utils/marketStatus.ts`)

#### 주가 시뮬레이션 로직
- **위치**: `src/hooks/useNewsUpdate.ts`의 `updateNews` 함수
- **동작 방식**:
  - 전일 종가 기준 ±3% 범위 내에서 미세 변동
  - 마켓 상태에 따라 가격 조정
  - 마켓 세그먼트 변경 시 이전 세그먼트 종료 가격 저장

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

### 개발 도구
- **@vitejs/plugin-react**: React 플러그인
- **@types/react**: React 타입 정의

---

## 주요 변경 사항

### 2025.01.XX - API 통합 개선

#### 방법 A: NewsAPI/GNews.io 통합
- `src/utils/newsApi.ts` 파일 생성
- NewsAPI.org 및 GNews.io 지원
- 환경 변수로 API 키 설정 가능
- API 키가 없으면 RSS로 fallback

#### 방법 B: Twitter 위젯 제거
- Twitter 위젯 제거 (Rate limit 이슈)
- X 프로필 링크 버튼으로 대체
- 시뮬레이션 트윗 데이터 표시 유지

#### CBOE API 비활성화
- CORS/프록시 이슈로 인해 비활성화
- 시뮬레이션 데이터 사용
- 주가 시뮬레이션 로직 개선

### 레이아웃 개선
- 3개 메인 패널 (MuskFeed, PolicyMonitor, PortfolioSimulator) 높이 일치
- 내부 스크롤 가능하도록 개선
- 최신 데이터 순으로 정렬

### 데이터 업데이트 주기
- 뉴스: 1분마다 (NewsAPI/RSS 시도)
- 트윗: 1분마다 (60% 확률로 새 트윗 추가)
- 주가: 시뮬레이션 (마켓 상태에 따라 자동 조정)

---

## 파일 구조

```
GigaPulse/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx          # 메인 대시보드 레이아웃
│   │   ├── Header.tsx             # 헤더 (주가 정보)
│   │   ├── MuskFeed.tsx           # Elon Musk 피드 (X 링크 버튼)
│   │   ├── PolicyMonitor.tsx      # 정책 & 뉴스 모니터
│   │   ├── PortfolioSimulator.tsx # 포트폴리오 시뮬레이터
│   │   ├── ScenarioSlider.tsx     # 시나리오 슬라이더
│   │   ├── MacroIndicators.tsx    # 거시경제 지표
│   │   └── FearGreedIndex.tsx     # Fear & Greed Index
│   ├── data/
│   │   └── initialData.ts         # 초기 데이터 (뉴스, 트윗, 주가)
│   ├── hooks/
│   │   └── useNewsUpdate.ts       # 뉴스/트윗 업데이트 로직
│   ├── types/
│   │   ├── index.ts               # TypeScript 타입 정의
│   │   └── twitter.d.ts           # Twitter 타입 정의
│   ├── utils/
│   │   ├── taxCalculator.ts       # 세금 계산
│   │   ├── marketStatus.ts        # 마켓 상태 감지
│   │   ├── newsApi.ts             # NewsAPI/GNews.io 통합 (방법 A)
│   │   ├── googleNewsRss.ts       # Google News RSS (Fallback)
│   │   ├── cboeApi.ts             # CBOE API (비활성화)
│   │   ├── stockApi.ts            # 주가 API (미사용)
│   │   └── tradingViewApi.ts      # TradingView API (미사용)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── docs/
│   ├── requirements.md            # 상세 요구사항
│   ├── implementation-summary.md  # 구현 요약
│   ├── api-integration-plan.md    # API 통합 계획
│   └── current-implementation.md  # 현재 구현 상태 (이 문서)
├── README.md
├── README_API_SETUP.md            # API 설정 가이드
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 데이터 흐름

### 뉴스 데이터 흐름
```
1. 컴포넌트 마운트
   ↓
2. fetchNewsFromAPI() 호출
   ↓
3. NewsAPI/GNews.io 시도
   ├─ 성공 → 뉴스 표시
   └─ 실패 → Google News RSS 시도
       ├─ 성공 → 뉴스 표시
       └─ 실패 → 시뮬레이션 데이터 사용
   ↓
4. 1분마다 반복
```

### 트윗 데이터 흐름
```
1. 컴포넌트 마운트
   ↓
2. 시뮬레이션 데이터 표시
   ↓
3. 1분마다 updateNews() 호출
   ↓
4. 60% 확률로 새 트윗 추가
```

### 주가 데이터 흐름
```
1. 초기 데이터 로드 (initialData.ts)
   ↓
2. updateNews() 함수에서 주가 시뮬레이션
   ↓
3. 마켓 상태에 따라 가격 조정
   ↓
4. 1분마다 업데이트
```

---

## 환경 변수 설정

### .env 파일 예시
```env
# NewsAPI.org API 키
VITE_NEWS_API_KEY=your_newsapi_key_here

# 또는 GNews.io API 키
VITE_GNEWS_API_KEY=your_gnews_api_key_here
```

### API 키 발급 방법
1. **NewsAPI.org**: https://newsapi.org/register
   - 무료 티어: 개발/테스트 환경만 가능 (1일 100 요청)

2. **GNews.io**: https://gnews.io/
   - 무료 티어: 1일 100 요청

> **참고**: API 키가 없어도 시뮬레이션 데이터로 대시보드가 정상 작동합니다.

---

## 향후 개선 사항

### 방법 C: 서버를 통한 데이터 가져오기
- **Next.js API Route** 또는 **Node.js 서버** 구축
- 서버에서 RSS/API 호출하여 CORS 문제 해결
- 클라이언트는 서버 API만 호출

### 실시간 주가 데이터
- **Alpha Vantage API**: 무료 티어 제공
- **Finnhub API**: 무료 티어 제공
- **서버를 통한 Yahoo Finance API 호출**

### Twitter/X API 통합
- **X API v2** 사용 (유료)
- 또는 **서버를 통한 RSS 피드** 사용

### 성능 최적화
- 데이터 캐싱
- 불필요한 리렌더링 최소화
- 가상 스크롤링 (대량 데이터 처리)

---

## 문제 해결 가이드

### CORS 오류
- **원인**: 브라우저에서 직접 외부 API 호출 시도
- **해결**: NewsAPI/GNews.io 사용 (CORS 지원) 또는 서버를 통한 호출

### Rate Limit 오류
- **원인**: API 호출 횟수 초과
- **해결**: API 키 업그레이드 또는 호출 주기 조정

### 데이터가 표시되지 않음
- **확인 사항**:
  1. API 키가 올바르게 설정되었는지
  2. 네트워크 연결 상태
  3. 브라우저 콘솔 오류 확인
- **기본 동작**: API 실패 시 자동으로 시뮬레이션 데이터 사용

---

## 참고 자료

- [NewsAPI.org 문서](https://newsapi.org/docs)
- [GNews.io 문서](https://gnews.io/docs/v4)
- [Google News RSS](https://news.google.com/rss)
- [X (Twitter) Embed](https://developer.twitter.com/en/docs/twitter-for-websites)

---

**최종 업데이트**: 2025년 1월
**버전**: 1.0.0

