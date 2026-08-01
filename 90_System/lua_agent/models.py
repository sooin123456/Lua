from __future__ import annotations

from datetime import datetime, timezone
from enum import StrEnum

from pydantic import BaseModel, Field, field_validator


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class TaskStatus(StrEnum):
    INBOX = "inbox"
    PLANNED = "planned"
    RUNNING = "running"
    BLOCKED = "blocked"
    REVIEW = "review"
    DONE = "done"
    FAILED = "failed"


class Project(BaseModel):
    id: str
    name: str
    goal: str
    description: str = ""
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)


class Task(BaseModel):
    id: str
    project_id: str
    title: str
    goal: str
    status: TaskStatus = TaskStatus.INBOX
    owner_agent: str = "lua_Project_Agent"
    next_action: str
    priority: int = 3
    approval_required: bool = False
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)

    @field_validator("next_action")
    @classmethod
    def next_action_must_not_be_empty(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("next_action must not be empty")
        return value


class Checkpoint(BaseModel):
    id: str
    task_id: str
    summary: str
    done: str
    next_action: str
    blocked_reason: str = ""
    created_at: datetime = Field(default_factory=utc_now)


class Agent(BaseModel):
    id: str
    name: str
    role: str
    capabilities: list[str] = Field(default_factory=list)
    tools: list[str] = Field(default_factory=list)
    risk_level: str = "low"


class ToolInstruction(BaseModel):
    id: str
    task_id: str
    tool: str
    title: str
    body: str
    created_at: datetime = Field(default_factory=utc_now)
