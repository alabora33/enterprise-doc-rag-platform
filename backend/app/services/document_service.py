import os
import uuid
from pathlib import Path

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.document import Document, DocumentStatus


ALLOWED_EXTENSIONS = {
    ".pdf",
    ".docx",
    ".xlsx",
    ".xls",
    ".txt",
}


def validate_file_extension(
    filename: str,
) -> None:
    extension = Path(filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError(
            "Unsupported file type. Allowed file types: PDF, DOCX, XLSX, XLS, TXT."
        )


def create_upload_directory() -> str:
    upload_dir = settings.UPLOAD_DIR
    os.makedirs(upload_dir, exist_ok=True)

    return upload_dir


def generate_stored_file_name(
    original_file_name: str,
) -> str:
    extension = Path(original_file_name).suffix.lower()
    unique_name = f"{uuid.uuid4()}{extension}"

    return unique_name


def save_upload_file(
    upload_file: UploadFile,
    stored_file_path: str,
) -> int:
    total_size = 0

    with open(stored_file_path, "wb") as buffer:
        while True:
            chunk = upload_file.file.read(1024 * 1024)

            if not chunk:
                break

            total_size += len(chunk)
            buffer.write(chunk)

    return total_size


def create_document_record(
    db: Session,
    organization_id: int,
    uploaded_by_user_id: int,
    upload_file: UploadFile,
) -> Document:
    validate_file_extension(upload_file.filename)

    upload_dir = create_upload_directory()

    stored_file_name = generate_stored_file_name(
        upload_file.filename,
    )

    stored_file_path = os.path.join(
        upload_dir,
        stored_file_name,
    )

    file_size = save_upload_file(
        upload_file=upload_file,
        stored_file_path=stored_file_path,
    )

    document = Document(
        organization_id=organization_id,
        uploaded_by_user_id=uploaded_by_user_id,
        original_file_name=upload_file.filename,
        stored_file_name=stored_file_name,
        file_path=stored_file_path,
        content_type=upload_file.content_type,
        file_size=file_size,
        status=DocumentStatus.UPLOADED.value,
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return document


def get_documents_by_organization(
    db: Session,
    organization_id: int,
) -> list[Document]:
    return (
        db.query(Document)
        .filter(Document.organization_id == organization_id)
        .order_by(Document.created_at.desc())
        .all()
    )


def get_document_by_id_and_organization(
    db: Session,
    document_id: int,
    organization_id: int,
) -> Document | None:
    return (
        db.query(Document)
        .filter(
            Document.id == document_id,
            Document.organization_id == organization_id,
        )
        .first()
    )