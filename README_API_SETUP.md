# API 설정 가이드

## Finnhub API 설정 (주가 + 뉴스)

Finnhub는 무료 플랜에서 실시간 주가(L1 데이터)와 최근 1년간의 뉴스를 제공합니다.

### 1. API 키 발급

1. https://finnhub.io/ 에서 무료 계정 생성
2. 무료 티어: 1분당 60 요청 (충분함)
3. 대시보드에서 API 키 복사

### 2. 로컬 개발 환경 설정 (중요!)

프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
VITE_FINNHUB_API_KEY=your_api_key_here
```

**예시:**


### 3. 동작 방식

#### 주가 데이터
- `useNewsUpdate` 훅에서 **1분마다** 자동으로 API 호출
- API 엔드포인트: `https://finnhub.io/api/v1/quote?symbol=TSLA&token={API_KEY}`
- 가져온 `c` (Current Price) 값을 상태에 저장하고 화면에 표시
- 마켓 상태 자동 감지 (Premarket/Daymarket/Aftermarket/Closed)

#### 뉴스 데이터
- 주가 업데이트와 **동기화**되어 1분마다 자동으로 API 호출
- API 엔드포인트: `https://finnhub.io/api/v1/company-news?symbol=TSLA&from={YYYY-MM-DD}&to={YYYY-MM-DD}&token={API_KEY}`
- 최근 **7일간**의 테슬라 관련 뉴스를 가져옴
- 자동 분류: Musk, Policy, Macro, Tesla
- 자동 감정 분석: Positive, Negative, Neutral
- 영향도 계산: -20 ~ +20
- Tesla News Monitor에 표시 (ID가 `finnhub-`로 시작하는 뉴스만)

### 4. API 키가 없을 경우

- **주가**: 실시간 주가 조회 불가 (null 반환), 콘솔에 경고 메시지 출력
- **뉴스**: 뉴스 가져오기 실패 (빈 배열 반환), 콘솔에 경고 메시지 출력
- 초기 데이터(시뮬레이션)만 표시됨

### 5. 주의사항

- `.env` 파일은 `.gitignore`에 포함되어 Git에 커밋되지 않습니다
- API 키는 코드에 하드코딩하지 마세요
- 각 개발자는 자신의 `.env` 파일을 로컬에 생성해야 합니다
- 서버 재시작 시 환경 변수가 로드되므로, `.env` 파일 수정 후 서버를 재시작하세요

---

## X (Twitter) Embed Widget 설정

Elon Musk의 X 피드를 실시간으로 표시하기 위해 X Embed Widget을 사용합니다.

### 1. 자동 설정

- `index.html`에 X Widgets JS 스크립트가 자동으로 포함되어 있습니다
- 별도의 API 키나 설정이 필요 없습니다

### 2. 동작 방식

- **위젯 로드**: 컴포넌트 마운트 시 자동으로 로드
- **자동 새로고침**: **30초마다** 위젯을 완전히 새로고침하여 최신 트윗 표시
- **에러 처리**: Rate limit (429) 에러 시 안내 메시지 및 직접 링크 제공

### 3. 위젯 설정

```typescript
{
  sourceType: 'profile',
  screenName: 'elonmusk',
  height: 600,
  width: '100%',
  theme: 'dark',
  tweetLimit: 20,
  chrome: 'noheader nofooter' // 헤더/푸터 제거로 더 많은 트윗 표시
}
```

---

## 백업 뉴스 소스 (Fallback)

Finnhub News API가 실패할 경우를 대비한 백업 뉴스 소스입니다.

### NewsAPI.org / GNews.io (백업)

1. **API 키 발급**
   - NewsAPI.org: https://newsapi.org/register
   - GNews.io: https://gnews.io/
   - 무료 티어: 1일 100 요청

2. **환경 변수 설정** (선택사항)
   ```env
   VITE_NEWS_API_KEY=your_newsapi_key_here
   VITE_GNEWS_API_KEY=your_gnews_api_key_here
   ```

3. **동작 방식**
   - Finnhub News API 실패 시 자동으로 시도
   - NewsAPI/GNews.io도 실패하면 Google News RSS 시도
   - 모든 API 실패 시 시뮬레이션 데이터 사용

---

## 전체 설정 예시 (.env 파일)

```env
# Finnhub API 키 (주가 + 뉴스) - 필수
VITE_FINNHUB_API_KEY=your_finnhub_api_key_here

# 백업 뉴스 API 키 (선택사항)
VITE_NEWS_API_KEY=your_newsapi_key_here
VITE_GNEWS_API_KEY=your_gnews_api_key_here
```

---

## 업데이트 주기 요약

| 데이터 | 업데이트 주기 | API |
|--------|--------------|-----|
| 주가 | 1분마다 | Finnhub Quote API |
| 뉴스 | 1분마다 (주가와 동기화) | Finnhub News API |
| X 피드 | 30초마다 | X Embed Widget |

---

## 문제 해결

### API 키가 로드되지 않음
1. `.env` 파일이 프로젝트 루트에 있는지 확인
2. `VITE_FINNHUB_API_KEY=your_key` 형식이 맞는지 확인 (공백 없음)
3. 개발 서버 재시작 (`npm run dev`)

### 뉴스가 표시되지 않음
1. 브라우저 콘솔에서 "✅ Finnhub에서 X개의 테슬라 뉴스를 가져왔습니다." 메시지 확인
2. API 키가 올바르게 설정되었는지 확인
3. 네트워크 탭에서 API 호출 상태 확인

### X 위젯이 표시되지 않음
1. 브라우저 콘솔에서 에러 메시지 확인
2. 429 (Too Many Requests) 에러인 경우 잠시 후 자동 재시도
3. 직접 링크 버튼을 클릭하여 X 프로필 확인

---

## 참고사항

### Finnhub API 제한사항
- 무료 티어: 1분당 60 요청
- 주가 업데이트: 1분마다 (충분한 여유)
- 뉴스 업데이트: 1분마다 (주가와 동기화)
- **총 요청 수**: 분당 2회 (주가 1회 + 뉴스 1회) - 무료 티어로 충분

### X Embed Widget 제한사항
- Rate limit: X 플랫폼 정책에 따라 제한될 수 있음
- 429 에러 발생 시 30초 후 자동 재시도
- 위젯은 X 플랫폼의 캐시 정책에 따라 최신 트윗이 약간 지연될 수 있음

---

**최종 업데이트**: 2025년 1월  
**주요 변경사항**: Finnhub News API 통합, X Embed Widget 통합
