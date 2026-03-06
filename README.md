# 🏦 통장 쪼개기 시뮬레이터 (Bank Account Simulator)

돈의 흐름을 시각화하고 효율적인 자산 관리를 도와주는 통장 쪼개기 시뮬레이터입니다. 복잡한 자동이체와 자금 흐름을 드래그 앤 드롭 방식으로 쉽게 설계하고 시뮬레이션할 수 있습니다.

## ✨ 주요 기능

- **시각적 계좌 관리**: 드래그 앤 드롭 인터페이스를 통해 계좌를 생성하고 연결할 수 있습니다.
- **자동이체 시뮬레이션**: 계좌 간의 자동이체 설정을 시각적으로 확인하고 실행 결과를 예측합니다.
- **데이터 관리**: 데이터 백업 및 복구 기능을 통해 작업 내용을 안전하게 보관할 수 있습니다.
- **다양한 UI 요소**: 실시간 잔액 변동 애니메이션과 직관적인 툴팁을 제공합니다.
- **반응형 디자인**: 데스크탑과 모바일 환경 모두에서 쾌적하게 사용할 수 있습니다.

## 🚀 시작하기

### 로컬 환경에서 실행

1. **의존성 설치**
   ```bash
   npm install
   ```

2. **개발 서버 실행**
   ```bash
   npm run dev
   ```
   브라우저에서 `http://localhost:8083` 접속

### Docker로 실행 (추천)

플랫폼(Mac/Windows)에 상관없이 동일한 환경에서 실행할 수 있습니다.

```bash
# 이미지 빌드 및 컨테이너 실행
docker-compose up -d --build
```
브라우저에서 `http://localhost:8083` 접속

## 🛠 기술 스택

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Diagram Engine**: React Flow (@xyflow/react)
- **Deployment**: Docker, Vercel

## 📁 프로젝트 구조

- `src/components`: UI 컴포넌트 및 노드/엣지 정의
- `src/engine`: 시뮬레이션 로직 엔진
- `src/store`: 전역 상태 관리 (Zustand)
- `src/utils`: 데이터 내보내기/가져오기 등 유틸리티

---
제작: [jkk9494](https://github.com/jkk9494)
