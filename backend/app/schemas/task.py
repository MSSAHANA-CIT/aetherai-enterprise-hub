from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field

TaskStatus = Literal["todo", "in_progress", "review", "done"]
TaskPriority = Literal["low", "medium", "high", "urgent"]


class TaskUserResponse(BaseModel):
    id: int
    full_name: str
    email: str

    model_config = {"from_attributes": True}


class TaskResponse(BaseModel):
    id: int
    title: str
    description: str
    status: TaskStatus
    priority: TaskPriority
    assignee_id: Optional[int] = None
    created_by: int
    due_date: Optional[date] = None
    ai_generated: bool
    created_at: datetime
    updated_at: datetime
    assignee: Optional[TaskUserResponse] = None
    creator: Optional[TaskUserResponse] = None

    model_config = {"from_attributes": True}


class TaskCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(default="", max_length=5000)
    status: TaskStatus = "todo"
    priority: TaskPriority = "medium"
    assignee_id: Optional[int] = None
    due_date: Optional[date] = None
    ai_generated: bool = False


class TaskUpdateRequest(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=5000)
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    assignee_id: Optional[int] = None
    due_date: Optional[date] = None


class TaskListResponse(BaseModel):
    status: str = "success"
    message: str = "Tasks retrieved"
    data: list[TaskResponse]


class TaskDetailResponse(BaseModel):
    status: str = "success"
    message: str = "Task retrieved"
    data: TaskResponse


class TaskCreateResponse(BaseModel):
    status: str = "success"
    message: str = "Task created"
    data: TaskResponse


class TaskUpdateResponse(BaseModel):
    status: str = "success"
    message: str = "Task updated"
    data: TaskResponse


class TaskDeleteResponse(BaseModel):
    status: str = "success"
    message: str = "Task deleted"


class GeneratedTaskItem(BaseModel):
    title: str
    description: str
    priority: TaskPriority
    status: TaskStatus = "todo"
    suggested_due_date: Optional[str] = None


class TaskGenerateRequest(BaseModel):
    goal: str = Field(..., min_length=3, max_length=2000)
    deadline: Optional[date] = None
    team_context: Optional[str] = Field(default=None, max_length=1000)
    save: bool = False


class TaskGenerateResponse(BaseModel):
    status: str = "success"
    message: str = "Tasks generated"
    data: list[GeneratedTaskItem]
    saved_tasks: Optional[list[TaskResponse]] = None


class TaskBulkItem(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(default="", max_length=5000)
    priority: TaskPriority = "medium"
    status: TaskStatus = "todo"
    assignee_id: Optional[int] = None
    due_date: Optional[date] = None


class TaskBulkCreateRequest(BaseModel):
    tasks: list[TaskBulkItem] = Field(..., min_length=1, max_length=50)


class TaskBulkCreateResponse(BaseModel):
    status: str = "success"
    message: str = "Tasks created"
    data: list[TaskResponse]


class TaskAssigneeListResponse(BaseModel):
    status: str = "success"
    message: str = "Assignees retrieved"
    data: list[TaskUserResponse]
