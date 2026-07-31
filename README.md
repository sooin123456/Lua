# Lua Main

Telegram을 24시간 명령 입구로 사용하고, 로컬 Runner가 명령을 복호화해
Obsidian Vault에 저장하는 개인 비서 기반입니다.

## 현재 범위

```text
Telegram → Cloud Gateway → 암호화된 작업 대기열
                           → Local Runner → Obsidian Markdown
```

아직 Agent 실행과 모델 라우팅은 포함하지 않습니다. 먼저 명령이 유실되지
않고 로컬 Vault까지 도착하는 흐름을 검증합니다.

## 요구 사항

- Node.js 24 이상
- Telegram Bot token
- 외부에서 접근 가능한 Gateway HTTPS 주소

## 1. Runner 키 생성

```bash
npm run keys
```

출력되는 `RUNNER_PUBLIC_KEY_B64`는 Gateway 환경변수에 넣습니다. 비밀키는
`local-data/keys/runner-private.pem`에 생성되며 Git에 포함되지 않습니다.

## 2. Gateway 실행

`.env.example`의 Cloud Gateway 값을 배포 환경에 설정한 뒤 실행합니다.

```bash
npm run gateway
```

Telegram webhook 주소는 다음과 같습니다.

```text
https://YOUR_GATEWAY/telegram/webhook
```

Webhook을 등록할 때 `TELEGRAM_WEBHOOK_SECRET`과 같은 값을
`secret_token`으로 지정해야 합니다.

### Railway 배포

GitHub 저장소를 Railway 서비스에 연결하면 `main` 브랜치에 push할 때마다
배포됩니다. 서비스에 Volume을 `/app/data`로 연결하고 다음 Variables를 넣습니다.

```text
GATEWAY_DB_PATH=/app/data/gateway.sqlite
TELEGRAM_BOT_TOKEN=...
TELEGRAM_WEBHOOK_SECRET=...
TELEGRAM_USER_ID=...
RUNNER_TOKEN=...
RUNNER_PUBLIC_KEY_B64=...
```

Railway가 만든 Public Domain의 `/health`가 `{"ok":true}`를 반환하면,
그 도메인의 `/telegram/webhook`을 Telegram webhook 주소로 등록합니다.

## 3. Local Runner 실행

로컬 환경에 다음 값을 설정합니다.

```text
GATEWAY_URL=https://YOUR_GATEWAY
RUNNER_TOKEN=...
RUNNER_PRIVATE_KEY_PATH=./local-data/keys/runner-private.pem
VAULT_PATH=/absolute/path/to/Obsidian/Vault
```

그다음 실행합니다.

```bash
npm run runner
```

Telegram에서 보낸 텍스트는 Vault의 `01_Inbox/Commands/`에 Markdown으로
저장됩니다.

## 검증

```bash
npm test
```

테스트는 암호화 변조 거부와 Telegram webhook부터 임시 Vault까지의 전체
흐름을 확인합니다.

## 다음 단계

이 흐름을 실제 Telegram에서 검증한 뒤, Local Runner에 작업 계획과
Agent·모델 라우팅을 추가합니다.
