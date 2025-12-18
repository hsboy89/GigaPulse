# API 설정 가이드

## 뉴스 API 설정

현재 뉴스 데이터는 Google News RSS를 사용하고 있으며, CORS 프록시 문제로 인해 NewsAPI나 GNews.io 같은 전용 API를 사용하는 것을 권장합니다.

### 방법 1: NewsAPI.org 사용 (추천)

1. **API 키 발급**
   - https://newsapi.org/register 에서 무료 계정 생성
   - 무료 티어: 개발/테스트 환경에서만 사용 가능 (1일 100 요청)

2. **환경 변수 설정**
   - 프로젝트 루트에 `.env` 파일 생성
   - 다음 내용 추가:
     ```
     VITE_NEWS_API_KEY=your_newsapi_key_here
     ```

3. **또는 코드에 직접 설정** (개발용)
   - `src/utils/newsApi.ts` 파일에서 `NEWS_API_KEY` 상수 수정

### 방법 2: GNews.io 사용

1. **API 키 발급**
   - https://gnews.io/ 에서 무료 계정 생성
   - 무료 티어: 1일 100 요청

2. **환경 변수 설정**
   - `.env` 파일에 추가:
     ```
     VITE_GNEWS_API_KEY=your_gnews_api_key_here
     ```

### 현재 동작 방식

- API 키가 설정되어 있으면: NewsAPI/GNews.io에서 뉴스 가져오기
- API 키가 없으면: Google News RSS 시도 (프록시 필요)
- RSS도 실패하면: 시뮬레이션 데이터 사용

## Twitter/X 피드

Twitter 위젯 대신 Elon Musk의 X 프로필로 연결되는 버튼을 사용합니다. 
클릭 시 새 창에서 https://x.com/elonmusk 가 열립니다.

## 참고사항

- NewsAPI.org 무료 티어는 프로덕션 환경에서 사용 불가 (개발/테스트만 가능)
- 프로덕션 환경에서는 유료 플랜 또는 백엔드 서버를 통한 API 호출 권장

