# Telegram Webhook Bridge

Telegram 메시지를 받아 GitHub `repository_dispatch` (`telegram-message`)로 전달합니다.

## 1) 실행

```bash
export GITHUB_TOKEN="ghp_xxx"
export GITHUB_OWNER="sooin123456"
export GITHUB_REPO="Lua"
export TELEGRAM_WEBHOOK_SECRET="my-telegram-secret"
export PORT=8787

node scripts/telegram_webhook_bridge.js
```

## 2) Telegram Webhook 등록

아래 `<BOT_TOKEN>`은 Telegram BotFather에서 받은 토큰입니다.

```bash
curl -sS "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -d "url=https://<YOUR_PUBLIC_DOMAIN>/telegram" \
  -d "secret_token=my-telegram-secret"
```

## 3) 동작 확인

- 헬스체크: `GET /health`
- 텔레그램에 메시지 전송
- GitHub Actions `Telegram Inbox Capture` 실행 확인
- `00_Inbox/Telegram_Capture_YYYYMMDD_HHMM.md` 생성 확인

## Notes

- `TELEGRAM_WEBHOOK_SECRET`를 설정하면 Telegram 요청 검증을 수행합니다.
- `GITHUB_TOKEN`은 `repo` 권한(최소 `contents:write`)이 필요합니다.
