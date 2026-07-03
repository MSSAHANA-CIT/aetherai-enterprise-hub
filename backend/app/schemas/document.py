from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class DocumentUploaderResponse(BaseModel):
    id: int
    full_name: str
    email: str

    model_config = {"from_attributes": True}


class DocumentResponse(BaseModel):
    id: int
    title: str
    description: str
    file_name: str
    file_type: str
    file_size: int
    uploaded_by: int
    extracted_text: str
    ai_summary: Optional[str] = None
    created_at: datetime
    uploader: Optional[DocumentUploaderResponse] = None

    model_config = {"from_attributes": True}


class DocumentListResponse(BaseModel):
    status: str = "success"
    message: str = "Documents retrieved"
    data: list[DocumentResponse]


class DocumentDetailResponse(BaseModel):
    status: str = "success"
    message: str = "Document retrieved"
    data: DocumentResponse


class DocumentUploadResponse(BaseModel):
    status: str = "success"
    message: str = "Document uploaded"
    data: DocumentResponse


class DocumentSummaryResponse(BaseModel):
    status: str = "success"
    message: str = "Document summarized"
    data: DocumentResponse


class DocumentQuestionRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000)


class DocumentAnswerData(BaseModel):
    answer: str
    question: str


class DocumentAnswerResponse(BaseModel):
    status: str = "success"
    message: str = "Answer generated"
    data: DocumentAnswerData


class DocumentDeleteResponse(BaseModel):
    status: str = "success"
    message: str = "Document deleted"
