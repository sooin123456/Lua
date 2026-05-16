---
type: command-playbook
status: active
last_updated: 2026-05-16
---

# Domain Command Playbook

기획, 마케팅, 디자인, 서비스, 프로젝트 등 주요 업무 영역별 명령 체계다.

## Planning

| Command | Workflow | Output |
|---|---|---|
| `/lua planning prioritize` | clarify -> design -> brief | 우선순위 초안 |
| `/lua planning decide` | clarify -> design -> verify | 결정 초안 |
| `/lua planning validate` | clarify -> research -> plan | 검증 계획 |

## Marketing

| Command | Workflow | Output |
|---|---|---|
| `/lua marketing brief` | clarify -> design -> draft -> verify | 팀/고객 공유 초안 |
| `/lua marketing content` | clarify -> design -> draft | 콘텐츠 초안 |
| `/lua marketing campaign` | clarify -> design -> plan | 캠페인 계획 |

## Design

| Command | Workflow | Output |
|---|---|---|
| `/lua design screen` | clarify -> design -> verify | 화면 설계 |
| `/lua design flow` | clarify -> design -> plan | 사용자 흐름 |
| `/lua design critique` | clarify -> verify -> brief | 디자인 리뷰 |

## Service

| Command | Workflow | Output |
|---|---|---|
| `/lua service flow` | clarify -> design -> plan | 운영 프로세스 |
| `/lua service cs` | clarify -> draft -> verify | CS 응답/정책 |
| `/lua service crm` | clarify -> plan -> brief | 고객 관리 노트 |

## Project

| Command | Workflow | Output |
|---|---|---|
| `/lua project scope` | clarify -> design -> plan | 프로젝트 범위 |
| `/lua project split` | clarify -> plan | Backlog |
| `/lua project status` | verify -> brief | 상태 요약 |

## Research

| Command | Workflow | Output |
|---|---|---|
| `/lua research brief` | clarify -> research -> brief | Research note |
| `/lua research compare` | clarify -> research -> verify | 비교표 |
| `/lua research source` | research -> verify | 출처 평가 |

## Build

| Command | Workflow | Output |
|---|---|---|
| `/lua build app` | clarify -> design -> plan -> execute -> verify | 앱 MVP |
| `/lua build script` | clarify -> plan -> execute -> verify | 자동화 스크립트 |
| `/lua build agent` | clarify -> design -> plan | agent app spec |

## Ops

| Command | Workflow | Output |
|---|---|---|
| `/lua ops inbox` | classify -> execute -> brief | Inbox 분류 |
| `/lua ops cleanup` | verify -> plan -> execute | vault 정리 |
| `/lua ops log` | execute | Work Ledger |

## Navigation

- [[01_Command Center/Obsidian Command Center|Obsidian Command Center]]
- [[09_Automations/Slack Agent App Command System|Slack Agent App Command System]]
- [[07_Lua_System/agents/README|Lua Agents]]
