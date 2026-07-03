from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class RecentActivityItem(BaseModel):
    id: str
    type: Literal["message", "task", "document", "summary", "security"]
    title: str
    description: str
    created_at: datetime


class AnalyticsOverviewData(BaseModel):
    total_users: int = 0
    total_channels: int = 0
    total_messages: int = 0
    total_tasks: int = 0
    completed_tasks: int = 0
    open_tasks: int = 0
    total_documents: int = 0
    total_summaries: int = 0
    ai_generated_tasks: int = 0
    recent_activity: list[RecentActivityItem] = Field(default_factory=list)


class AnalyticsOverviewResponse(BaseModel):
    status: str = "success"
    message: str = "Analytics overview retrieved"
    data: AnalyticsOverviewData


class ProductivityAnalyticsData(BaseModel):
    task_completion_rate: float = 0.0
    tasks_by_status: dict[str, int] = Field(default_factory=dict)
    tasks_by_priority: dict[str, int] = Field(default_factory=dict)
    ai_automation_score: float = 0.0
    productivity_score: float = 0.0


class ProductivityAnalyticsResponse(BaseModel):
    status: str = "success"
    message: str = "Productivity analytics retrieved"
    data: ProductivityAnalyticsData


class AIModeUsage(BaseModel):
    mode: str
    count: int
    label: str


class AIUsageAnalyticsData(BaseModel):
    ai_queries_today: int = 0
    ai_modes_used: list[AIModeUsage] = Field(default_factory=list)
    documents_summarized: int = 0
    summaries_generated: int = 0
    ai_tasks_generated: int = 0


class AIUsageAnalyticsResponse(BaseModel):
    status: str = "success"
    message: str = "AI usage analytics retrieved"
    data: AIUsageAnalyticsData


class SecurityAnalyticsData(BaseModel):
    otp_logins_enabled: bool = True
    password_reset_flow_enabled: bool = True
    protected_routes_count: int = 0
    gmail_api_configured: bool = False
    openai_configured: bool = False


class SecurityAnalyticsResponse(BaseModel):
    status: str = "success"
    message: str = "Security analytics retrieved"
    data: SecurityAnalyticsData
