#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { findFiles, relativePosix } = require('./lib/files');

const ROOT = path.resolve(__dirname, '..');
const TODAY = '2026-05-15';

function writeIfEmpty(rel, content) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) return false;
  if (fs.statSync(full).size !== 0) return false;
  fs.writeFileSync(full, `${content.trimStart()}\n`, 'utf8');
  return true;
}

function projectMeta(rel) {
  const parts = rel.split('/');
  return {
    domain: parts[1] || '',
    project: parts[2] || '',
    file: path.basename(rel, '.md'),
  };
}

function projectHome({ domain, project }) {
  return `---
type: project-home
domain: ${domain}
project: ${project}
status: draft
owner: sooin
last_updated: ${TODAY}
---

# ${project}

## Purpose

이 프로젝트가 해결하려는 문제를 한 문장으로 정리한다.

## Current Status

- Status: draft
- Owner: sooin
- Next action: \`/office-hours ${project}\`
- Blocker: not defined

## Seven-day Proof

- [ ] 사용자와 문제 정의
- [ ] 첫 번째 산출물 정의
- [ ] 성공 기준 정의

## Links

- [[Backlog]]
- [[DevLog]]
- [[Metrics]]
- [[Research]]

## Notes

아직 초기 scaffold다. 첫 작업은 \`/office-hours\`로 범위를 줄이는 것이다.
`;
}

function backlog({ domain, project }) {
  return `---
type: project-backlog
domain: ${domain}
project: ${project}
status: draft
last_updated: ${TODAY}
---

# ${project} Backlog

## Now

- [ ] \`/office-hours ${project}\`로 7일 proof 정의

## Next

- [ ] 첫 번째 구현 또는 문서 산출물 정하기
- [ ] 필요한 데이터/권한 확인

## Later

- [ ] Notion mirror 필요 여부 결정
- [ ] Slack brief 필요 여부 결정
`;
}

function devlog({ domain, project }) {
  return `---
type: project-devlog
domain: ${domain}
project: ${project}
last_updated: ${TODAY}
---

# ${project} DevLog

## ${TODAY}

- Host: \`windows-codex\`
- Change: scaffold initialized
- Verification: pending first project sprint
- Next: run \`/office-hours\`
`;
}

function metrics({ domain, project }) {
  return `---
type: project-metrics
domain: ${domain}
project: ${project}
last_updated: ${TODAY}
---

# ${project} Metrics

## Success Metrics

| Metric | Target | Current | Notes |
|---|---:|---:|---|
| Seven-day proof defined | 1 | 0 | |
| First useful artifact | 1 | 0 | |
| Decision logged | 1 | 0 | |

## Review

Update after each \`/project-sprint\`.
`;
}

function research({ domain, project }) {
  return `---
type: project-research
domain: ${domain}
project: ${project}
last_updated: ${TODAY}
---

# ${project} Research

## Questions

- 어떤 사용자/고객 문제가 핵심인가?
- 기존 대안은 무엇인가?
- 7일 안에 확인할 증거는 무엇인가?

## Sources

| Date | Source | Takeaway | Link |
|---|---|---|---|

## Notes

Lens 또는 수동 리서치 결과를 여기에 정리한다.
`;
}

function operationNote(rel) {
  const title = path.basename(rel, '.md');
  return `---
type: operation-note
status: draft
last_updated: ${TODAY}
---

# ${title}

## Purpose

이 운영 노트가 관리하는 대상과 책임을 정리한다.

## Current State

- Owner: sooin
- Status: draft
- Next action: define process

## Log

| Date | Change | Host |
|---|---|---|
| ${TODAY} | scaffold initialized | windows-codex |
`;
}

function resourceNote(rel) {
  const title = path.basename(rel, '.md');
  return `---
type: resource-note
status: draft
last_updated: ${TODAY}
---

# ${title}

## Summary

핵심 내용을 짧게 정리한다.

## Current Stack

| Item | Status | Notes |
|---|---|---|

## Links

관련 도구, 문서, repo를 연결한다.
`;
}

function agentPrompt(rel) {
  const title = path.basename(rel, '.md');
  const slug = title.toLowerCase().replace(/\s+/g, '-');
  return `---
type: agent-prompt-template
agent: ${slug}
status: draft
last_updated: ${TODAY}
---

# ${title}

## Role

이 에이전트가 맡을 역할을 한 문장으로 정의한다.

## Always Load

- \`CLAUDE.md\`
- \`AGENTS.md\`
- 관련 project Home/Backlog/DevLog

## Responsibilities

- [ ] 주요 책임 1
- [ ] 주요 책임 2
- [ ] 주요 책임 3

## Boundaries

- 외부 전송은 사람 승인 후에만 한다.
- secrets, token, private key를 출력하거나 저장하지 않는다.
- 작업 출처는 \`Work Ledger.md\`에 남긴다.

## Output Format

- Summary
- Changed
- Verification
- Next
`;
}

const explicitTemplates = new Map([
  ['00_Inbox/AI 분류 대기중....md', `---
type: inbox
status: triage
source: manual
last_updated: ${TODAY}
---

# AI 분류 대기중

## Queue

- [ ] 새 캡처가 들어오면 프로젝트, 리소스, 운영, 아카이브 중 하나로 분류한다.

## Command

\`/inbox-triage\`
`],
  ['99_Templates/Project Dashboard Template.md', `---
type: template
name: project-dashboard
last_updated: ${TODAY}
---

# {{project}} Dashboard

## Purpose

{{one_sentence_purpose}}

## Current Status

- Status: {{status}}
- Owner: {{owner}}
- Next action: {{next_action}}
- Deadline: {{deadline}}
- Blocker: {{blocker}}

## Seven-day Proof

- [ ] {{proof_1}}
- [ ] {{proof_2}}
- [ ] {{proof_3}}

## Links

- [[Backlog]]
- [[DevLog]]
- [[Metrics]]
- [[Research]]
`],
  ['99_Templates/Meeting Note Template.md', `---
type: template
name: meeting-note
last_updated: ${TODAY}
---

# {{meeting_title}}

## Meta

- Date: {{date}}
- Attendees:
- Host:

## Decisions

- [ ]

## Action Items

| Owner | Action | Due |
|---|---|---|

## Notes
`],
  ['99_Templates/Weekly Review Template.md', `---
type: template
name: weekly-review
last_updated: ${TODAY}
---

# Weekly Review {{week}}

## Shipped

-

## Stuck

-

## Kill or Pause

-

## Next Seven-day Proof

-

## Work Ledger Check

- [ ] Mac Claude work logged
- [ ] Windows Codex work logged
- [ ] Automation work logged
`],
]);

function scaffoldFor(rel) {
  if (explicitTemplates.has(rel)) return explicitTemplates.get(rel);

  if (rel.startsWith('02_Projects/')) {
    const meta = projectMeta(rel);
    if (meta.file === 'Home') return projectHome(meta);
    if (meta.file === 'Backlog') return backlog(meta);
    if (meta.file === 'DevLog') return devlog(meta);
    if (meta.file === 'Metrics') return metrics(meta);
    if (meta.file === 'Research') return research(meta);
  }

  if (rel.startsWith('03_Operation/')) return operationNote(rel);
  if (rel.startsWith('04_Resources/Tech Stack/')) return resourceNote(rel);

  if (rel === '06_Personal Studio/Daily Notes.md') {
    return `---
type: daily-notes
status: active
last_updated: ${TODAY}
---

# Daily Notes

## Today

-

## Decisions

-

## Links

- [[01_Command Center/Work Ledger]]
`;
  }

  if (rel.startsWith('99_Templates/Agent Prompts/')) return agentPrompt(rel);

  return null;
}

function main() {
  const files = findFiles(ROOT, (fullPath) => fullPath.endsWith('.md'))
    .map((fullPath) => relativePosix(ROOT, fullPath))
    .sort();

  const changed = [];
  for (const rel of files) {
    const full = path.join(ROOT, rel);
    if (fs.statSync(full).size !== 0) continue;
    const scaffold = scaffoldFor(rel);
    if (!scaffold) continue;
    if (writeIfEmpty(rel, scaffold)) changed.push(rel);
  }

  console.log(`Filled ${changed.length} empty scaffold(s).`);
  changed.forEach((rel) => console.log(`  - ${rel}`));
}

main();
