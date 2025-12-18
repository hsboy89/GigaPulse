# API 연동 계획 (향후 구현)

## 일론 머스크 트윗 실시간 가져오기

### 현재 상태
- 시뮬레이션 데이터 사용 (muskPostPool)
- 1분마다 랜덤 트윗 추가 (60% 확률)
- 최대 10개 트윗 표시

### 실제 구현 시 필요한 사항

#### 1. X (Twitter) API v2
```typescript
// 실제 API 연동 예시
async function fetchMuskTweets() {
  const response = await fetch(
    'https://api.twitter.com/2/tweets/search/recent?query=from:elonmusk',
    {
      headers: {
        'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
      },
    }
  );
  const data = await response.json();
  return data.data;
}
```

#### 2. 필요한 API 키
- Twitter Bearer Token (Twitter Developer Portal에서 발급)
- 환경 변수로 관리 (`.env`)

#### 3. Rate Limit 고려
- Twitter API v2: 300 requests / 15분 (per user)
- 1분마다 체크 시 충분한 여유

#### 4. AI 요약 기능
- OpenAI API 또는 다른 AI 서비스 연동
- 트윗 내용을 한국어로 요약

#### 5. 구현 시 주의사항
- API 키 보안 관리
- Rate limit 모니터링
- 에러 핸들링
- 캐싱 전략

### 대안: RSS 또는 공개 데이터 소스
- 일론 머스크 공식 트위터 RSS (제한적)
- 서드파티 트위터 봇 (API 없이 크롤링)

