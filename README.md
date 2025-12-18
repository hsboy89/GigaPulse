# Giga-Pulse: 테슬라 주주 전용 인텔리전스 대시보드

테슬라 주가에 영향을 미치는 다각도의 정보를 실시간으로 통합하여 투자 판단을 돕는 All-in-One 대시보드입니다.

## 주요 기능

### 1. Tesla Vision: Portfolio Impact Simulator
- 개인별 평단가 기반 실시간 평가 (P&L)
- 세금 계산기 (미주식 양도소득세 22%, 250만원 공제)
- 시나리오 기반 시뮬레이션 (머스크 리스크, 트럼프 정책, 로보택시 밸류에이션)
- 목표 도달 알림

### 2. Giga-Pulse 대시보드
- **Elon Musk 실시간 피드**: X(구 트위터) 포스트 및 AI 요약
- **정책 & 정치 분석**: 트럼프 정책 추적, 연준 발표사항
- **테슬라 전용 증시 지표**: 실시간 주가, Fear & Greed 지수
- **AI 인사이트 매칭**: 뉴스-주가 상관관계 분석

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 기술 스택

- **React 18** + **TypeScript**
- **Vite** (빌드 도구)
- **Tailwind CSS** (스타일링)
- **Recharts** (차트 라이브러리)

## 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── Dashboard.tsx
│   ├── Header.tsx
│   ├── MuskFeed.tsx
│   ├── PolicyMonitor.tsx
│   ├── PortfolioSimulator.tsx
│   └── ScenarioSlider.tsx
├── data/               # 초기 데이터
├── types/              # TypeScript 타입 정의
├── utils/              # 유틸리티 함수 (세금 계산, 시뮬레이션 등)
├── App.tsx
└── main.tsx
```

## 문서

자세한 요구사항과 구현 내용은 `docs/` 폴더를 참고하세요.

- `docs/requirements.md`: 상세 요구사항 문서
- `docs/implementation-summary.md`: 구현 요약 문서

## 라이선스

MIT

