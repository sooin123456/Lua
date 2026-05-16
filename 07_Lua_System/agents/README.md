---
type: agents-readme
---

# Lua agents

총 6명의 generic agent + Phase 4에서 4명의 workflow agent를 추가한다.

## Generic agents (Phase 3)

| Agent | Brain | 역할 | 시스템 프롬프트 |
|---|---|---|---|
| Atlas | Claude Sonnet 4.6 | 라우터 | `atlas/system-prompt.md` |
| Scribe | Claude Opus 4.7 | 글쓰기 | `scribe/system-prompt.md` |
| Forge | Kimi K2.6 (Cursor) | 코딩 | `forge/system-prompt.md` |
| Lens | Kimi K2.6 Swarm | 리서치 | `lens/system-prompt.md` |
| Vault | Claude Sonnet 4.6 | Obsidian 정리 | `vault/system-prompt.md` |
| Archivist | Notion Custom Agent | Notion 운영 | `archivist/system-prompt.md` |

## Workflow agents (Phase 4 예정)

| Agent | 도메인 | 호출 패턴 |
|---|---|---|
| Proposal Agent | climate-energy | `/proposal-write {grant} {topic}` |
| Patent Agent | climate-energy | `/patent-draft {title}` |
| Industry Intel Agent | climate-energy | cron weekly |
| Validation Agent | personal-venture | `/validate {idea}` |

## Slack Agent Apps

Slack에서 호출하는 agent app 명령 체계는 [[09_Automations/Slack Agent App Command System|Slack Agent App Command System]]을 따른다.

| Slack App | Base Agent | Command |
|---|---|---|
| Lua CEO | Atlas | `/lua ceo` |
| Lua PM | Atlas + Vault | `/lua pm` |
| Lua Research | Lens | `/lua research` |
| Lua Writer | Scribe | `/lua write` |
| Lua Builder | Forge | `/lua build` |
| Lua QA | Vault + Forge | `/lua qa` |
| Lua Release | Archivist + Vault | `/lua release` |
| Lua Ops | Vault | `/lua ops` |

## Skill bundling 패턴

각 agent는 필요한 skill을 `skills/` 아래에 복사해 자기완결 번들을 만든다.

```
07_Lua_System/agents/scribe/
├── system-prompt.md
└── skills/
    └── voice-mimicry/   # node scripts/sync_skills.js
```

동기화: `node scripts/sync_skills.js`  
검증: `node scripts/check.js` (번들 vs vertical drift)
