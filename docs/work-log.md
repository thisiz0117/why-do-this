# 작업 로그

## 2026-10-30 — 태그 기반 배포 세팅 (#8) 및 TBD 전환

### 배경
- 업데이트가 드문 플러그인이라 `v*` 태그 기반 배포로 정했다.
- 1인 개발이라 `develop` 없이 `main` 중심의 TBD(trunk-based development)로 전환했다.
- 스토어 업로드는 자동화하지 않고 직접 한다.

### 한 작업
1. `main`이 아닌 현재 `develop`(PR #7 포함)에서 `feat/8-release-workflow` 브랜치를 땄다.
2. `.github/workflows/release.yml` 추가
   - 트리거: `v*` 태그 푸시
   - 태그와 `public/manifest.json`의 `version`이 다르면 실패
   - `npm ci` → `npm run build` → `dist/`를 `why-do-this-<태그>.zip`으로 압축 → `gh release create`로 Release 생성
3. `CLAUDE.md`를 TBD 기준으로 수정
   - 3번 규칙을 `develop` 기준에서 `main` + `feat/*` 단기 브랜치로 변경
   - 흐름, `Closes #N`, 리베이스 머지·브랜치 삭제, 태그 배포, 직접 스토어 업로드를 Git 섹션에 추가
   - 구조 섹션에 `release.yml`, 이 로그 파일 추가
4. 로컬 검증
   - `release.yml`을 YAML 파서로 읽어 문법 확인
   - 워크플로의 버전 확인 명령과 `dist/` 압축 명령을 로컬에서 같은 방식으로 실행해 확인

5. GitHub 저장소 설정 변경 (앱 내장 브라우저로 `Settings → General → Pull Requests`에서 직접 조작)
   - Claude in Chrome은 연결되지 않아 사용하지 못했고, 앱 내장 브라우저에 로그인된 GitHub 세션을 사용했다.
   - `Allow merge commits` 해제, `Allow squash merging` 해제 → `Allow rebase merging`만 남김
   - `Automatically delete head branches` 켬
   - 체크박스를 클릭할 때 자동 저장되며, 화면 표시와 실제 저장이 어긋날 수 있어 `gh api repos/thisiz0117/why-do-this`로 서버 값을 확인했다.
     (확인 결과: `allow_merge_commit=false`, `allow_squash_merge=false`, `allow_rebase_merge=true`, `delete_branch_on_merge=true`, 기본 브랜치 `main`)
   - 자동 삭제 체크박스는 첫 시도에서 저장되지 않아 새로고침 후 다시 켜서 반영했다.

### 하지 않은 것 (사유)
- `main` 브랜치 보호(직접 푸시 차단 등): 보안 성격의 설정이라 항목을 확정받지 못해 하지 않았다.
- 실제 태그 푸시를 통한 Release 생성 확인: 태그를 푸시하는 행위는 배포이므로 하지 않았다. 워크플로가 `main`에 올라간 뒤 첫 태그에서 확인한다.
- 커밋·푸시·PR: CLAUDE.md의 "최종 허가 후 커밋·PR" 규칙에 따라 허가 전이라 하지 않았다.

### 남은 일
- PR #7(`develop` → `main`)이 먼저 머지돼야 이 브랜치의 PR이 깔끔하다. 이 브랜치가 `develop`에서 갈라져 있어 #7의 커밋 2개를 포함한다.
- 원격 `develop` 브랜치 정리(삭제 여부는 사용자가 결정).

## 팝업을 웹사이트 위 오버레이 패널로 전환 (#10, 브랜치 `feat/10-overlay-panel`)

- 액션 팝업은 별도 창이라 뒤의 웹사이트가 비치지 않아, 패널을 content script로 페이지 위에 직접 그리도록 바꿨다.
- `background.ts`: `chrome.action.onClicked`에서 활성 탭의 content script로 토글 메시지를 보낸다.
- `content.ts`: 메시지를 받으면 Shadow DOM 호스트를 `documentElement`에 붙이거나 떼서 패널을 열고 닫는다. 패널은 `backdrop-filter: url(#glass)`로 뒤의 페이지를 굴절시키고, 광택·그라디언트 테두리·그림자는 CSS로 구현했다. 굴절 맵 생성 코드는 `popup.ts`에서 옮겼다.
- 굴절 맵 반경을 CSS `border-radius`(40px)에 맞췄다. (기존엔 맵 60, 모서리 40으로 어긋나 있었다.)
- `popup.html`, `popup.ts`, `manifest.json`의 `default_popup`, `build.mjs`의 popup 엔트리를 제거했다. 테스트용 배경 장면은 옮기지 않았다.
- 확인: `npm run build` 통과. 줄무늬 배경의 로컬 테스트 페이지에 번들 `content.js`를 로드해 패널 표시와 굴절을 눈으로 확인했다. 실제 확장으로 YouTube/Instagram에 올려 아이콘 클릭 토글하는 것은 확인하지 못했다.
- 커밋·PR은 최종 허가 전이라 하지 않았다.
- 수정: 아이콘 클릭 시 `Could not establish connection. Receiving end does not exist.` 오류가 발생했다. 확장을 설치·새로고침하기 전에 열린 탭에는 content script가 없어 메시지를 받을 곳이 없기 때문이다. `background.ts`에서 전송이 실패하면 `chrome.scripting.executeScript`로 `content.js`를 주입하고 다시 보내며(`scripting` 권한 추가), 대상 사이트가 아닌 탭에서는 오류를 무시한다. PR #11은 이 문제로 닫고 수정 후 다시 올린다.
- 대상 사이트 제한 해제: 추후 설정으로 대상을 고를 수 있게 하려고 `manifest.json`의 `host_permissions`와 content script `matches`를 `<all_urls>`로 바꿨다. CLAUDE.md의 대상 사이트 설명도 맞췄다.
- 글라스 스타일 조정(macOS 리퀴드 글라스 참고): 배경의 흰색 그라디언트를 거의 투명한 `rgba(255,255,255,0.03)`으로 바꾸고 `saturate(1.3)`을 더해 뒤 화면 색이 살아 있게 했다. 테두리는 불투명도를 낮추고(0.9/0.6 → 0.4/0.22), 그림자는 옅게, 위쪽 안쪽 하이라이트 1px을 더했다.
- 작업 중 제거했던 `popup.ts`, `popup.html`이 추적되지 않는 파일로 되살아나 타입체크가 충돌해 다시 삭제했다.
- 블러·다크 톤 조정: `backdrop-filter`에 `blur(10px)`를 굴절 필터 앞에 추가하고, 배경을 어두운 반투명(`rgba(16,18,28,0.5)`)으로 바꿨다.
- 색 중간값 조정: 배경이 너무 어둡고 테두리가 너무 밝아, 배경을 `rgba(28,31,44,0.3)`으로 밝히고 테두리 불투명도를 0.24/0.02/0.13, 위쪽 하이라이트를 0.08로 낮췄다.
- 블러 강도를 사용자가 `blur(20px)`로 직접 조정했다.
