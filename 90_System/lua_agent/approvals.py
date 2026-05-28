from __future__ import annotations

from enum import StrEnum

from pydantic import BaseModel

from lua_agent.models import Project, Task


class ApprovalLevel(StrEnum):
    AUTO = "auto"
    ASK_FIRST = "ask_first"
    EXPLICIT_APPROVAL = "explicit_approval"


class ApprovalPolicy(BaseModel):
    level: ApprovalLevel
    reason: str
    matched_terms: list[str]


EXPLICIT_TERMS = {
    "Trading": ["live trading", "auto trading", "real exchange", "place real", "order", "orders", "api key"],
    "Secrets": ["secret", "credential", "password", "token", "private key"],
    "Payments": ["payment", "subscribe", "subscription", "billing", "charge card"],
    "Destructive": ["bulk delete", "delete all", "wipe", "remove all"],
    "Account changes": ["account setting", "change account", "permission change"],
    "Public posting": ["public post", "publish publicly", "post to instagram", "post to slack"],
}

ASK_FIRST_TERMS = {
    "External communication": ["send email", "contact vendor", "contact vendors", "message slack", "send telegram"],
    "Deployment": ["deploy", "deployment", "publish", "release"],
    "Git remote": ["git push", "create pr", "pull request", "merge"],
    "Paid API": ["paid api", "paid model", "spend", "cost"],
    "Shared workspace": ["notion shared", "canva share", "share externally"],
}

AUTO_TERMS = ["research", "draft", "compare", "summarize", "plan", "outline", "test", "local"]


def classify_approval(project: Project, task: Task) -> ApprovalPolicy:
    text = _combined_text(project, task)
    explicit = _matches(EXPLICIT_TERMS, text)
    if explicit:
        return ApprovalPolicy(
            level=ApprovalLevel.EXPLICIT_APPROVAL,
            reason=f"{explicit[0]} action requires explicit user approval.",
            matched_terms=explicit,
        )

    ask_first = _matches(ASK_FIRST_TERMS, text)
    if ask_first:
        return ApprovalPolicy(
            level=ApprovalLevel.ASK_FIRST,
            reason=f"{ask_first[0]} action requires asking the user first.",
            matched_terms=ask_first,
        )

    auto_matches = [term for term in AUTO_TERMS if term in text]
    return ApprovalPolicy(
        level=ApprovalLevel.AUTO,
        reason="Research and drafting can proceed automatically within local/private boundaries.",
        matched_terms=auto_matches,
    )


def render_approval_boundary(project: Project, task: Task) -> str:
    policy = classify_approval(project, task)
    return (
        "\nApproval policy:\n"
        f"- Level: {policy.level.value}\n"
        f"- Reason: {policy.reason}\n"
        f"- Matched terms: {', '.join(policy.matched_terms) if policy.matched_terms else 'none'}\n"
    )


def _combined_text(project: Project, task: Task) -> str:
    return " ".join(
        [
            project.name,
            project.goal,
            project.description,
            task.title,
            task.goal,
            task.owner_agent,
            task.next_action,
        ]
    ).lower()


def _matches(term_groups: dict[str, list[str]], text: str) -> list[str]:
    matched = []
    for label, terms in term_groups.items():
        if any(term in text for term in terms):
            matched.append(label)
    return matched
