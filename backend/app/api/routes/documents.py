from fastapi import APIRouter, Depends, Form, HTTPException, Request, UploadFile, status
from sqlalchemy.orm import Session, joinedload

from app.api.routes.auth import get_current_user
from app.database import get_db
from app.models.document import CompanyDocument
from app.models.user import User
from app.schemas.document import (
    DocumentAnswerResponse,
    DocumentDeleteResponse,
    DocumentDetailResponse,
    DocumentListResponse,
    DocumentQuestionRequest,
    DocumentResponse,
    DocumentSummaryResponse,
    DocumentUploadResponse,
    DocumentUploaderResponse,
)
from app.services.ai_service import answer_document_question, summarize_document_text
from app.services.document_service import (
    _title_from_filename,
    delete_document_file,
    extract_text_from_file,
    save_uploaded_file,
)
from app.services.audit_service import log_action
from app.services.notification_service import create_notification

router = APIRouter(prefix="/documents", tags=["Documents"])


def _build_document_response(document: CompanyDocument) -> DocumentResponse:
    uploader = None
    if document.uploader is not None:
        uploader = DocumentUploaderResponse.model_validate(document.uploader)

    return DocumentResponse(
        id=document.id,
        title=document.title,
        description=document.description,
        file_name=document.file_name,
        file_type=document.file_type,
        file_size=document.file_size,
        uploaded_by=document.uploaded_by,
        extracted_text=document.extracted_text,
        ai_summary=document.ai_summary,
        created_at=document.created_at,
        uploader=uploader,
    )


def _get_accessible_document(document_id: int, current_user: User, db: Session) -> CompanyDocument:
    document = (
        db.query(CompanyDocument)
        .options(joinedload(CompanyDocument.uploader))
        .filter(CompanyDocument.id == document_id)
        .first()
    )
    if document is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    uploader = document.uploader
    if uploader is None or uploader.company_name != current_user.company_name:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return document


@router.post("/upload", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    request: Request,
    file: UploadFile,
    description: str = Form(default=""),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DocumentUploadResponse:
    stored_name, file_path, file_type, file_size = await save_uploaded_file(file)
    extracted_text = extract_text_from_file(file_path, file_type)

    document = CompanyDocument(
        title=_title_from_filename(file.filename or stored_name),
        description=description.strip(),
        file_name=stored_name,
        file_path=file_path,
        file_type=file_type,
        file_size=file_size,
        uploaded_by=current_user.id,
        extracted_text=extracted_text,
    )
    db.add(document)
    db.flush()

    ip_address = None
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        ip_address = forwarded.split(",")[0].strip()
    elif request.client:
        ip_address = request.client.host

    log_action(
        db,
        actor_id=current_user.id,
        action="document_uploaded",
        entity_type="document",
        entity_id=document.id,
        metadata={"title": document.title, "file_name": document.file_name},
        ip_address=ip_address,
    )
    create_notification(
        db,
        user_id=current_user.id,
        title="Document uploaded",
        message=f'"{document.title}" was added to the knowledge base.',
        notification_type="document",
    )
    db.commit()
    db.refresh(document)

    document = (
        db.query(CompanyDocument)
        .options(joinedload(CompanyDocument.uploader))
        .filter(CompanyDocument.id == document.id)
        .first()
    )

    return DocumentUploadResponse(data=_build_document_response(document))


@router.get("", response_model=DocumentListResponse)
def list_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DocumentListResponse:
    documents = (
        db.query(CompanyDocument)
        .join(User, CompanyDocument.uploaded_by == User.id)
        .options(joinedload(CompanyDocument.uploader))
        .filter(User.company_name == current_user.company_name)
        .order_by(CompanyDocument.created_at.desc())
        .all()
    )

    return DocumentListResponse(data=[_build_document_response(document) for document in documents])


@router.get("/{document_id}", response_model=DocumentDetailResponse)
def get_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DocumentDetailResponse:
    document = _get_accessible_document(document_id, current_user, db)
    return DocumentDetailResponse(data=_build_document_response(document))


@router.post("/{document_id}/summarize", response_model=DocumentSummaryResponse)
def summarize_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DocumentSummaryResponse:
    _ = current_user
    document = _get_accessible_document(document_id, current_user, db)
    summary = summarize_document_text(document.extracted_text, document.title)
    document.ai_summary = summary

    log_action(
        db,
        actor_id=current_user.id,
        action="ai_summary_generated",
        entity_type="document",
        entity_id=document.id,
        metadata={"title": document.title, "summary_type": "document"},
    )
    create_notification(
        db,
        user_id=current_user.id,
        title="AI summary ready",
        message=f'An AI summary was generated for "{document.title}".',
        notification_type="ai",
    )
    db.commit()
    db.refresh(document)

    document = (
        db.query(CompanyDocument)
        .options(joinedload(CompanyDocument.uploader))
        .filter(CompanyDocument.id == document.id)
        .first()
    )

    return DocumentSummaryResponse(data=_build_document_response(document))


@router.post("/{document_id}/ask", response_model=DocumentAnswerResponse)
def ask_document_question(
    document_id: int,
    payload: DocumentQuestionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DocumentAnswerResponse:
    _ = current_user
    document = _get_accessible_document(document_id, current_user, db)
    answer = answer_document_question(document.extracted_text, document.title, payload.question)

    return DocumentAnswerResponse(
        data={
            "answer": answer,
            "question": payload.question,
        }
    )


@router.delete("/{document_id}", response_model=DocumentDeleteResponse)
def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DocumentDeleteResponse:
    document = _get_accessible_document(document_id, current_user, db)
    delete_document_file(document.file_path)
    db.delete(document)
    db.commit()
    return DocumentDeleteResponse()
