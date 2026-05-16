---
type: draft
status: working
project: 돈 먹는 먼지
challenge: Apps in Toss Vibecoding Challenge
last_updated: 2026-05-16
---

# 돈 먹는 먼지 Toss Submission Draft

승인 전 외부 제출 금지. 이 문서는 Apps in Toss 제출용 문구와 체크리스트 초안이다.

## App Name

돈 먹는 먼지

## One-Line Pitch

매달 빠져나가는 구독료와 고정비를 귀여운 먼지 캐릭터로 바꿔 보여주고, 안 쓰는 지출을 `재우며` 절약 행동을 시작하게 만드는 금융 미니앱.

## Short Description

매달 조용히 빠져나가는 돈은 숫자로 보면 무겁고, 그냥 지나치면 잊히기 쉽다. `돈 먹는 먼지`는 구독료와 고정비를 내 지갑 속 작은 먼지 캐릭터로 보여준다. 사용자는 먼지를 만들고, 이번 달 먼지들이 먹은 돈을 확인하고, 줄이고 싶은 먼지를 재워 예상 절약액을 확인한다.

분석보다 귀여운 행동 유도에 집중한 Toss 스타일 절약 경험이다.

## Core Features

- 고정비 이름과 월 금액을 입력하면 먼지 캐릭터가 생성된다.
- 이번 달 먼지들이 먹은 총액과 하루 단위로 사라지는 돈을 보여준다.
- 금액이 큰 지출일수록 더 존재감 있는 먼지로 표현된다.
- 줄이고 싶은 지출을 선택해 `먼지 재우기` 상태로 바꿀 수 있다.
- 재운 먼지가 이번 달부터 지켜주는 예상 절약액을 보여준다.
- 계좌/카드 연동 없이 수동 입력으로 시작해 개인정보 부담을 낮춘다.

## Judging Points

- 챌린지 주제 `귀여운게 최고야`를 장식이 아니라 핵심 UX로 사용한다.
- 일반 구독 관리 앱처럼 목록을 정리하는 데서 끝나지 않고, 캐릭터를 통해 행동 변화를 유도한다.
- 무거운 지출 분석을 `먼지 찾기 -> 먼지방 보기 -> 먼지 재우기`라는 짧은 루프로 바꾼다.
- 금융 계산은 단순하고 명확하게 유지하면서 감정적 진입장벽을 낮춘다.
- Toss 미니앱에 맞게 작고 빠른 MVP 범위로 설계했다.
- 실제 금융 데이터 연동 없이도 챌린지에서 체험 가능한 완결된 흐름이 있다.

## Screenshot Plan

대표 스크린샷은 `먼지방` 화면으로 한다.

체크할 것:

- 앱 이름 `돈 먹는 먼지`
- 이번 달 총액
- 2~3개의 일반 예시 먼지
- 선택된 먼지 상태
- 모바일 세로 비율

## Demo Data

실명 브랜드 대신 일반 예시를 사용한다.

- 영상 구독
- 통신비
- 커피 멤버십
- 음악 앱
- 쇼핑 멤버십

## Resolved Decisions

- 제출명: `돈 먹는 먼지`
- 데모 데이터: 일반 예시
- 대표 스크린샷: 먼지방
- 프로젝트 위치: [[02_Projects/TOSS/Home|TOSS]]

## Remaining User Decision

- 제출 전에 prototype을 정적 HTML 상태로 낼지, Toss 앱 템플릿 구조로 옮길지

## Current Prototype

- Prototype: `08_Artifacts/Money Eating Dust Prototype/index.html`
- Product spec: [[02_Projects/TOSS/Money Eating Dust|돈 먹는 먼지]]
- Command run: [[01_Command Center/Command Runs/money-dust-20260516-01-build-app|money-dust-20260516-01]]
