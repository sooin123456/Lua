---
type: artifact-readme
status: draft
last_updated: 2026-05-16
---

# Money Eating Dust Prototype

Static Toss-style MVP prototype for [[02_Projects/TOSS/Money Eating Dust|돈 먹는 먼지]].

## What It Tests

- Create a recurring fixed-cost dust manually.
- Show the monthly total and daily money eaten.
- Turn an active dust into a sleeping dust.
- Keep the UX cute while the money math stays clear.
- Show selection, sleeping, category, and wallet-room visual states on mobile.

## Open

Open `index.html` in a browser.

## Verification

```bash
node --test tests/money_dust_prototype.test.js
node scripts/check.js
```

Latest visual QA used Chrome headless screenshots at mobile and desktop widths. Generated QA PNGs are temporary and not part of the committed artifact.

## Next

If this loop feels right, migrate the feature into `Lua_template` under `app/features/money-dust/*`.

## Submission Draft

- [[06_Personal Studio/_Drafts/Money Eating Dust Toss Submission Draft|Money Eating Dust Toss Submission Draft]]
