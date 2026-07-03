from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session, joinedload

from app.api.routes.auth import get_current_user
from app.database import get_db
from app.models.task import Task
from app.models.user import User
from app.schemas.task import (
    GeneratedTaskItem,
    TaskAssigneeListResponse,
    TaskBulkCreateRequest,
    TaskBulkCreateResponse,
    TaskCreateRequest,
    TaskCreateResponse,
    TaskDeleteResponse,
    TaskDetailResponse,
    TaskGenerateRequest,
    TaskGenerateResponse,
    TaskListResponse,
    TaskResponse,
    TaskUpdateRequest,
    TaskUpdateResponse,
    TaskUserResponse,
)
from app.services.ai_service import generate_tasks_from_goal
from app.services.audit_service import log_action
from app.services.notification_service import create_notification

router = APIRouter(prefix="/tasks", tags=["Tasks"])


def _build_task_response(task: Task) -> TaskResponse:
    assignee = None
    if task.assignee is not None:
        assignee = TaskUserResponse.model_validate(task.assignee)

    creator = None
    if task.creator is not None:
        creator = TaskUserResponse.model_validate(task.creator)

    return TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        assignee_id=task.assignee_id,
        created_by=task.created_by,
        due_date=task.due_date,
        ai_generated=task.ai_generated,
        created_at=task.created_at,
        updated_at=task.updated_at,
        assignee=assignee,
        creator=creator,
    )


def _get_accessible_task(task_id: int, current_user: User, db: Session) -> Task:
    task = (
        db.query(Task)
        .options(joinedload(Task.assignee), joinedload(Task.creator))
        .join(User, Task.created_by == User.id)
        .filter(Task.id == task_id, User.company_name == current_user.company_name)
        .first()
    )
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


def _validate_assignee(assignee_id: Optional[int], current_user: User, db: Session) -> None:
    if assignee_id is None:
        return

    assignee = db.query(User).filter(User.id == assignee_id).first()
    if assignee is None or assignee.company_name != current_user.company_name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid assignee")


def _parse_suggested_due_date(value: Optional[str]) -> Optional[date]:
    if not value or not value.strip():
        return None
    try:
        return date.fromisoformat(value.strip()[:10])
    except ValueError:
        return None


def _create_task_from_payload(
    db: Session,
    current_user: User,
    title: str,
    description: str,
    status_value: str,
    priority: str,
    assignee_id: Optional[int],
    due_date: Optional[date],
    ai_generated: bool,
) -> Task:
    _validate_assignee(assignee_id, current_user, db)

    task = Task(
        title=title.strip(),
        description=description.strip(),
        status=status_value,
        priority=priority,
        assignee_id=assignee_id,
        created_by=current_user.id,
        due_date=due_date,
        ai_generated=ai_generated,
    )
    db.add(task)
    db.flush()
    return task


@router.get("/assignees", response_model=TaskAssigneeListResponse)
def list_assignees(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TaskAssigneeListResponse:
    users = (
        db.query(User)
        .filter(User.company_name == current_user.company_name, User.is_active.is_(True))
        .order_by(User.full_name.asc())
        .all()
    )
    return TaskAssigneeListResponse(data=[TaskUserResponse.model_validate(user) for user in users])


@router.get("", response_model=TaskListResponse)
def list_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TaskListResponse:
    tasks = (
        db.query(Task)
        .join(User, Task.created_by == User.id)
        .options(joinedload(Task.assignee), joinedload(Task.creator))
        .filter(User.company_name == current_user.company_name)
        .order_by(Task.updated_at.desc())
        .all()
    )
    return TaskListResponse(data=[_build_task_response(task) for task in tasks])


@router.post("", response_model=TaskCreateResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    payload: TaskCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TaskCreateResponse:
    task = _create_task_from_payload(
        db=db,
        current_user=current_user,
        title=payload.title,
        description=payload.description,
        status_value=payload.status,
        priority=payload.priority,
        assignee_id=payload.assignee_id,
        due_date=payload.due_date,
        ai_generated=payload.ai_generated,
    )

    log_action(
        db,
        actor_id=current_user.id,
        action="task_created",
        entity_type="task",
        entity_id=task.id,
        metadata={"title": task.title, "ai_generated": task.ai_generated},
    )
    create_notification(
        db,
        user_id=current_user.id,
        title="Task created",
        message=f'"{task.title}" was added to your workspace.',
        notification_type="task",
    )
    db.commit()
    db.refresh(task)

    task = (
        db.query(Task)
        .options(joinedload(Task.assignee), joinedload(Task.creator))
        .filter(Task.id == task.id)
        .first()
    )
    return TaskCreateResponse(data=_build_task_response(task))


@router.post("/bulk", response_model=TaskBulkCreateResponse, status_code=status.HTTP_201_CREATED)
def bulk_create_tasks(
    payload: TaskBulkCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TaskBulkCreateResponse:
    created_tasks: list[Task] = []

    for item in payload.tasks:
        task = _create_task_from_payload(
            db=db,
            current_user=current_user,
            title=item.title,
            description=item.description,
            status_value=item.status,
            priority=item.priority,
            assignee_id=item.assignee_id,
            due_date=item.due_date,
            ai_generated=True,
        )
        created_tasks.append(task)

    db.commit()

    task_ids = [task.id for task in created_tasks]
    tasks = (
        db.query(Task)
        .options(joinedload(Task.assignee), joinedload(Task.creator))
        .filter(Task.id.in_(task_ids))
        .all()
    )
    tasks_by_id = {task.id: task for task in tasks}
    ordered = [tasks_by_id[task_id] for task_id in task_ids if task_id in tasks_by_id]

    return TaskBulkCreateResponse(data=[_build_task_response(task) for task in ordered])


@router.post("/generate", response_model=TaskGenerateResponse)
def generate_tasks(
    payload: TaskGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TaskGenerateResponse:
    generated = generate_tasks_from_goal(
        goal=payload.goal,
        deadline=payload.deadline,
        team_context=payload.team_context,
    )

    data = [GeneratedTaskItem.model_validate(item) for item in generated]
    saved_tasks: Optional[list[TaskResponse]] = None

    if payload.save:
        created: list[Task] = []
        for item in data:
            task = _create_task_from_payload(
                db=db,
                current_user=current_user,
                title=item.title,
                description=item.description,
                status_value=item.status,
                priority=item.priority,
                assignee_id=None,
                due_date=_parse_suggested_due_date(item.suggested_due_date),
                ai_generated=True,
            )
            created.append(task)

        db.commit()
        task_ids = [task.id for task in created]
        tasks = (
            db.query(Task)
            .options(joinedload(Task.assignee), joinedload(Task.creator))
            .filter(Task.id.in_(task_ids))
            .all()
        )
        tasks_by_id = {task.id: task for task in tasks}
        ordered = [tasks_by_id[task_id] for task_id in task_ids if task_id in tasks_by_id]
        saved_tasks = [_build_task_response(task) for task in ordered]

    return TaskGenerateResponse(data=data, saved_tasks=saved_tasks)


@router.get("/{task_id}", response_model=TaskDetailResponse)
def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TaskDetailResponse:
    task = _get_accessible_task(task_id, current_user, db)
    return TaskDetailResponse(data=_build_task_response(task))


@router.put("/{task_id}", response_model=TaskUpdateResponse)
def update_task(
    task_id: int,
    payload: TaskUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TaskUpdateResponse:
    task = _get_accessible_task(task_id, current_user, db)
    update_data = payload.model_dump(exclude_unset=True)

    if "assignee_id" in update_data:
        _validate_assignee(update_data["assignee_id"], current_user, db)

    for field, value in update_data.items():
        if field == "title" and value is not None:
            task.title = value.strip()
        elif field == "description" and value is not None:
            task.description = value.strip()
        else:
            setattr(task, field, value)

    db.commit()
    db.refresh(task)

    task = (
        db.query(Task)
        .options(joinedload(Task.assignee), joinedload(Task.creator))
        .filter(Task.id == task.id)
        .first()
    )
    return TaskUpdateResponse(data=_build_task_response(task))


@router.delete("/{task_id}", response_model=TaskDeleteResponse)
def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TaskDeleteResponse:
    task = _get_accessible_task(task_id, current_user, db)
    db.delete(task)
    db.commit()
    return TaskDeleteResponse()
