---
type: artifact-readme
status: draft
last_updated: 2026-05-16
---

# Money Eating Dust Prototype

Static Toss-style MVP prototype for [[02_Projects/Lucia/Money Eating Dust Miniapp|돈먹는 먼지 Miniapp]].

## What It Tests

- Create a recurring fixed-cost dust manually.
- Show the monthly total and daily money eaten.
- Turn an active dust into a sleeping dust.
- Keep the UX cute while the money math stays clear.

## Open

Open `index.html` in a browser.

## Verification

```bash
node --test tests/money_dust_prototype.test.js
node scripts/check.js
```

## Next

If this loop feels right, migrate the feature into `Lua_template` under `app/features/money-dust/*`.
