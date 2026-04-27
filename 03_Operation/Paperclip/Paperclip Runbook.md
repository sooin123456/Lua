---
ai-index: true
type: runbook
area: Operation
project: Paperclip
status: active
---

# 🛠️ Paperclip Runbook (Vault 맞춤)

## 1) 최초 1회

```bash
npx paperclipai onboard --yes
```

기본 설정 위치:
- `~/.paperclip/instances/default/config.json`
- `~/.paperclip/instances/default/.env`

## 2) 서버 실행

```bash
npx paperclipai run
```

접속:
- UI: `http://127.0.0.1:3100`
- API health: `http://127.0.0.1:3100/api/health`

## 3) 현재 발생 이슈 (해결 필요)

- 증상: `Command not found in PATH: "claude"`
- 의미: Paperclip 기본 로컬 Claude adapter가 시스템 PATH에서 `claude` CLI를 찾지 못함.

### 즉시 우회

- Paperclip UI에서 현재 agent adapter를 사용 가능한 것으로 변경
- 또는 `claude` CLI가 설치된 쉘 환경에서만 Paperclip 실행

## 4) Vault 구조 연결 원칙

- Command Center: `[[01_Command Center/Master Dashboard|Master Dashboard]]`, `[[01_Command Center/Agent Dashboard|Agent Dashboard]]`
- Projects: `[[02_Projects/Projects Hub|Projects Hub]]`
- Operation: `[[03_Operation/Operation Hub|Operation Hub]]`
- Review: `[[01_Command Center/Weekly Review|Weekly Review]]`

## 5) 최소 운영 루틴 (권장)

1. Telegram 메시지 수집 (`00_Inbox`)
2. Paperclip routine으로 Inbox triage issue 생성
3. 처리 결과를 `Master Dashboard`와 `Weekly Review`에 반영

## 6) 로컬 OFF 운영 (Cloud 모드)

PC가 꺼져 있어도 Telegram 수집이 되도록 GitHub Actions 폴링을 사용한다.

- 워크플로우: `/.github/workflows/telegram-cloud-capture.yml`
- 실행 방식: 5분 주기 `getUpdates` 폴링
- 필요 secret: `TELEGRAM_BOT_TOKEN`
- 오프셋 저장: `03_Operation/Paperclip/telegram_offset.txt`

설정 순서:

1. GitHub Repo -> Settings -> Secrets and variables -> Actions
2. `TELEGRAM_BOT_TOKEN` 추가
3. Actions 탭에서 `Telegram Cloud Capture` 수동 1회 실행
4. 이후 스케줄 실행 확인
