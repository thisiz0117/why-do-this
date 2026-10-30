# Why Do This

PC Chrome에서 YouTube/Instagram에 의미 없이 접속해 시간을 낭비하는 습관을 막기 위한 Chrome 확장 프로그램.
(스마트폰은 이미 시간 제한을 걸어 둠. 구체적인 기능은 이슈를 통해 확정한다.)

## 개발 지침 (필수)

1. **최소 코드**: 지시 사항에 부합하는 최소한의 코드만 작성한다.
2. **확장성 금지**: 대비할 필요 없는 확장성은 고려하지 않는다. 추상화·옵션·설정은 지금 필요할 때만 추가한다.
3. **git flow**: 배포 파일이 아닌 이상 모든 작업은 `develop`에서 한다. `main`은 배포용이다.
4. **이슈 우선**: 모든 작업 전에 이슈부터 작성한다. 사용자가 이슈를 검토하고 통과시켜야 개발을 시작한다.
5. **최종 허가 후 커밋·PR**: 개발이 끝나면 먼저 결과를 보고하고 사용자의 최종 허가를 받는다. 허가 없이 커밋하거나 PR을 올리지 않는다.
6. **디자인**: Apple 리퀴드 글라스 스타일을 모방한다 (반투명 유리 질감, 배경 블러, 얇은 하이라이트 테두리, 둥근 모서리, 부드러운 그림자).

## 기술 스택

- TypeScript (strict) + Chrome Extension Manifest V3
- esbuild 번들, `tsc --noEmit` 타입체크
- 대상 사이트: `*.youtube.com`, `*.instagram.com`
- 빌드 결과물(`dist/`)만 Chrome에 올린다.

## 구조

- `src/background.ts` — service worker
- `src/content.ts` — 대상 사이트에 주입되는 content script
- `src/popup.ts` — 액션 팝업
- `public/` — `manifest.json`, `popup.html` 등 정적 파일 (빌드 시 `dist/`로 복사)
- `build.mjs` — esbuild 빌드 스크립트

## 명령어

- `npm run build` — 타입체크 후 `dist/` 생성
- `npm run watch` — 변경 감시 빌드 (`public/`은 시작 시 한 번만 복사)
- `npm run typecheck` — 타입체크만
- `npm run clean` — `dist/` 삭제

## 로컬 로드

`chrome://extensions` → 개발자 모드 → "압축해제된 확장 프로그램을 로드합니다" → `dist/` 선택

## Git / 이슈 / PR

- 원격: `origin` = `https://github.com/thisiz0117/why-do-this.git`
- 흐름: 이슈 작성 → 사용자 통과 → `develop`에서 개발 → 커밋 → PR
- 커밋 메시지·PR 설명은 한국어로, 변경 내용을 간결하게 쓴다.
- 커밋 메시지와 PR 설명에 `Co-Authored-By`, `Generated with Claude Code` 같은 Claude 서명 문구를 넣지 않는다. (기본 attribution 설정보다 우선한다.)
- `dist/`, `node_modules`는 커밋하지 않는다.
