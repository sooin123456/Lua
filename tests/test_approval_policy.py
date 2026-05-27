from lua_agent.approvals import ApprovalLevel, classify_approval
from lua_agent.models import Project, Task, TaskStatus


def make_task(title: str, goal: str, next_action: str, project_id: str = "PROJ-001") -> Task:
    return Task(
        id="TASK-001",
        project_id=project_id,
        title=title,
        goal=goal,
        status=TaskStatus.PLANNED,
        owner_agent="lua_Project_Agent",
        next_action=next_action,
    )


def test_research_and_drafting_are_auto_allowed():
    project = Project(id="PROJ-003", name="Floating Solar Monitoring System", goal="Research vendors.")
    task = make_task(
        "Research monitoring vendors",
        "Compare vendor websites and capabilities.",
        "Draft a comparison table.",
        project_id="PROJ-003",
    )

    policy = classify_approval(project, task)

    assert policy.level == ApprovalLevel.AUTO
    assert "Research and drafting" in policy.reason


def test_vendor_contact_requires_ask_first():
    project = Project(id="PROJ-003", name="Floating Solar Monitoring System", goal="Research vendors.")
    task = make_task(
        "Contact vendor",
        "Send an email to request pricing.",
        "Contact vendors with questions.",
        project_id="PROJ-003",
    )

    policy = classify_approval(project, task)

    assert policy.level == ApprovalLevel.ASK_FIRST
    assert "external communication" in policy.reason.lower()


def test_trading_actions_require_explicit_approval():
    project = Project(
        id="PROJ-002",
        name="Telegram Trading Bot To App",
        goal="Build a Telegram trading bot with exchange API integration.",
    )
    task = make_task(
        "Enable live trading",
        "Place real exchange orders through an API key.",
        "Turn on auto trading.",
        project_id="PROJ-002",
    )

    policy = classify_approval(project, task)

    assert policy.level == ApprovalLevel.EXPLICIT_APPROVAL
    assert "trading" in policy.reason.lower()


def test_deploy_or_git_push_requires_ask_first():
    project = Project(id="PROJ-001", name="Toss Mini App To App", goal="Build and deploy an app.")
    task = make_task(
        "Deploy MVP",
        "Deploy the Toss mini app and push the branch.",
        "Run deployment and git push.",
    )

    policy = classify_approval(project, task)

    assert policy.level == ApprovalLevel.ASK_FIRST
    assert "deployment" in policy.reason.lower()
