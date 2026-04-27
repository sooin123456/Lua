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
