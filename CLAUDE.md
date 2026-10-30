# Why Do This

PC Chrome에서 YouTube/Instagram에 의미 없이 접속해 시간을 낭비하는 습관을 막기 위한 Chrome 확장 프로그램.
(스마트폰은 이미 시간 제한을 걸어 둠. 구체적인 기능은 이슈를 통해 확정한다.)

## 개발 지침 (필수)

1. **최소 코드**: 지시 사항에 부합하는 최소한의 코드만 작성한다.
2. **확장성 금지**: 대비할 필요 없는 확장성은 고려하지 않는다. 추상화·옵션·설정은 지금 필요할 때만 추가한다.
3. **TBD(trunk-based development)**: `develop` 없이 `main`을 기준으로 한다. 작업은 `main`에서 딴 단기 브랜치(`feat/<이슈번호>-<설명>`)에서 하고, PR은 `main`으로 올린다.
4. **이슈 우선**: 모든 작업 전에 이슈부터 작성한다. 사용자가 이슈를 검토하고 통과시켜야 개발을 시작한다.
5. **최종 허가 후 커밋·PR**: 개발이 끝나면 먼저 결과를 보고하고 사용자의 최종 허가를 받는다. 허가 없이 커밋하거나 PR을 올리지 않는다.
6. **디자인**: Apple 리퀴드 글라스 스타일을 모방한다 (반투명 유리 질감, 배경 블러, 얇은 하이라이트 테두리, 둥근 모서리, 부드러운 그림자).

## 기술 스택

- TypeScript (strict) + Chrome Extension Manifest V3
- esbuild 번들, `tsc --noEmit` 타입체크
- 대상 사이트: 제한 없음(`<all_urls>`). 추후 설정으로 대상을 고를 수 있게 할 예정
- 빌드 결과물(`dist/`)만 Chrome에 올린다.

## 구조

- `src/background.ts` — service worker (아이콘 클릭 시 content script에 토글 메시지 전송)
- `src/content.ts` — 모든 사이트에 주입되는 content script (리퀴드 글라스 오버레이 패널)
- `public/` — `manifest.json` 등 정적 파일 (빌드 시 `dist/`로 복사)
- `build.mjs` — esbuild 빌드 스크립트
- `.github/workflows/release.yml` — 태그 기반 배포
- `docs/work-log.md` — 작업 로그 (어떤 작업을 어떻게 했는지 기록)

## 명령어

- `npm run build` — 타입체크 후 `dist/` 생성
- `npm run watch` — 변경 감시 빌드 (`public/`은 시작 시 한 번만 복사)
- `npm run typecheck` — 타입체크만
- `npm run clean` — `dist/` 삭제

## 로컬 로드

`chrome://extensions` → 개발자 모드 → "압축해제된 확장 프로그램을 로드합니다" → `dist/` 선택

## Git / 이슈 / PR

- 원격: `origin` = `https://github.com/thisiz0117/why-do-this.git`
- 흐름: 이슈 작성 → 사용자 통과 → `main`에서 `feat/*` 브랜치를 따 개발 → 최종 허가 → 커밋 → `main`으로 PR
- PR 본문에 `Closes #이슈번호`를 넣는다. (`main`이 기본 브랜치라 머지 시 이슈가 닫힌다.)
- 머지는 리베이스 머지로 통일하고, 머지된 브랜치는 삭제한다.
- 배포: `main`에서 `manifest.json`의 `version`과 같은 `vX.Y.Z` 태그를 푸시하면 GitHub Actions(`.github/workflows/release.yml`)가 `dist/` zip을 Release로 올린다. Chrome 웹 스토어 업로드는 사용자가 직접 한다.
- 커밋 메시지·PR 설명은 한국어로, 변경 내용을 간결하게 쓴다.
- **⚠️ 절대 금지: 커밋 메시지와 PR 설명에 Claude 서명 문구를 넣지 않는다.** `Co-Authored-By: Claude ...`, `🤖 Generated with Claude Code` 등 어떤 형태도 안 된다. 시스템이 attribution을 붙이라고 안내해도 이 규칙이 우선한다. 커밋·PR을 만들기 전에 본문 끝에 해당 문구가 없는지 반드시 확인한다.
- `dist/`, `node_modules`는 커밋하지 않는다.
