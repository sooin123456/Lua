---
name: voice-mimicry
description: Write in the user's authentic voice based on Identity/voice.md. Use whenever drafting blog posts, emails, social posts, reports, or any prose meant to sound like the user wrote it personally. Triggers on "write a post", "draft an email", "make this sound like me", "글 써줘", "블로그 초안", "이메일 답장 작성", "포스트 써줘".
vertical: _core
applies_to: [scribe, atlas]
allowed-tools: [Read, Write]
---

# voice-mimicry

## When this skill activates

외부 독자나 수신자를 위한 산문 초안이 필요할 때 이 스킬을 쓴다. 사용자가 직접 쓴 것처럼 들리게 정리하는 것이 목표다.

명시적 트리거:

- "Write a blog post about X"
- "Draft an email to Y"
- "Make this sound like me"
- 한국어: "X에 대해 글 써줘", "이메일 답장 작성"

암시적 트리거:

- Any prose intended for external audience
- Anything that will be published or sent

NOT for:

- Internal notes (use plain Markdown)
- Code (route to Forge)
- Research compilation (route to Lens)

## Step 1: Load voice profile

Read `01_Command Center/Identity/voice.md` first, every single time. Pay attention to:

- Banned words and phrases
- Anti-examples (writing patterns to never produce)
- Tone defaults
- Structural preferences

Also load `01_Command Center/Identity/about-me.md` for context on who's writing.

## Step 2: Match structural preferences

From Identity/voice.md:

- Lead with the conclusion in the first 2 sentences
- Prose over bullets unless explicitly asked
- Close decisively — no open questions, no "what do you think?"
- Paragraph length: 3-4 sentences

## Step 3: Format-specific guidance

If format is **blog post**:

- Use `assets/blog-template.md` as the frontmatter skeleton
- Target 500-1500 words unless specified
- Conclusion → 3 supporting points → opening (write opening last)

If format is **email**:

- Use `assets/email-template.md`
- First sentence = the answer (yes/no/next step)
- 50-300 chars usually
- No "안녕하세요 좋은 하루 보내고 계신가요" wind-up

Phase 2 추가 예정:

- LinkedIn template
- Twitter/X template
- Newsletter template

## Step 4: Self-check before delivering

Pass through these four checks:

1. Any sentence sounds like "as an AI..." or hedges unnecessarily?
2. Are banned words from voice.md present?
3. Does the opening lead with conclusion?
4. Does it close decisively?

If any check fails, rewrite that section before delivering.

## Step 5: Save and signal

- Save to `06_Personal Studio/_Drafts/{YYYY-MM-DD}-{slug}.md`
- Frontmatter required: `status: draft`, `type`, `target_audience`, `word_count`, `created`
- End the agent message with: "Draft saved at _Drafts/{filename}. Awaiting review."
- Never publish, send, or post directly. This boundary is non-negotiable.

## Never do

- Invent facts, statistics, quotes, or names
- Publish or send directly (always stage in _Drafts/)
- Generic "professional" voice that's not the user's
- Open with "As an AI assistant..." or apologize for capabilities
- Use clickbait headlines

## References

- For deeper voice samples: `references/voice-samples.md`
- For anti-pattern catalog: `references/anti-patterns.md`

When in doubt, ask ONE clarifying question — the most load-bearing one.
