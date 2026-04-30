# JobTrack

취업 지원 현황을 한눈에 관리하는 앱. 지원 추적, 일정 관리, AI 피드백 기능을 제공합니다.

## 기술 스택

- **프레임워크**: Next.js 16 (App Router)
- **인증 / DB**: Supabase
- **스타일링**: Tailwind CSS v4
- **AI**: Anthropic Claude API
- **언어**: TypeScript

## 로컬 실행 가이드

### 1. 저장소 클론 & 패키지 설치

```bash
git clone <repository-url>
cd jobtrack
npm install
```

### 2. 환경 변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local`을 열고 값을 채워넣으세요:

| 변수 | 설명 | 발급처 |
|------|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | Supabase 대시보드 → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Supabase 대시보드 → Settings → API |
| `ANTHROPIC_API_KEY` | Claude API 키 | [console.anthropic.com](https://console.anthropic.com/settings/keys) |

### 3. Supabase 프로젝트 설정

1. [supabase.com](https://supabase.com)에서 새 프로젝트 생성
2. **Authentication → Providers**에서 Email 로그인 활성화
3. **SQL Editor**에서 `db/schema.sql` 전체 내용을 실행

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 열기.
처음 접속하면 로그인 페이지로 이동합니다.

## 프로젝트 구조

```
app/
  layout.tsx              # 루트 레이아웃 (사이드바 포함)
  page.tsx                # 대시보드 (/)
  login/page.tsx          # 로그인 (/login)
  calendar/page.tsx       # 캘린더 (/calendar)
  applications/page.tsx   # 지원현황 (/applications)
  documents/page.tsx      # 문서함 (/documents)
  ai/page.tsx             # AI 피드백 (/ai)
  admin/
    layout.tsx            # 관리자 전용 레이아웃 (사이드바 없음)
    page.tsx              # 관리자 패널 (/admin)
  actions/auth.ts         # 로그인/로그아웃 Server Actions

components/
  layout-wrapper.tsx      # 경로별 사이드바 조건 렌더링
  sidebar.tsx             # 사이드바 네비게이션

lib/
  supabase.ts             # 브라우저 Supabase 클라이언트
  supabase-server.ts      # 서버 Supabase 클라이언트

types/
  database.ts             # Supabase DB 타입 정의

db/
  schema.sql              # 데이터베이스 스키마

middleware.ts             # 인증 미들웨어 (비로그인 시 /login 리다이렉트)
```

## 주요 기능

- **대시보드**: 지원 현황 요약 (총 지원 / 서류 통과 / 면접 / 합격)
- **캘린더**: 면접 일정·마감일 시각화
- **지원현황**: 회사별 지원 상태 트래킹 (위시리스트 → 서류 → 면접 → 합격/불합격)
- **문서함**: 이력서·자기소개서 저장 및 버전 관리
- **AI 피드백**: Claude를 이용한 이력서·자소서 첨삭
- **관리자 패널**: 사용자 및 시스템 관리

## 스크립트

```bash
npm run dev    # 개발 서버 (http://localhost:3000)
npm run build  # 프로덕션 빌드
npm run start  # 프로덕션 서버
npm run lint   # ESLint 검사
```
