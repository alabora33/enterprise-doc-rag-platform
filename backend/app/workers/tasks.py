from app.db.session import SessionLocal
from app.models.usage import UsageAction
from app.services.document_processing_service import process_document
from app.services.usage_service import create_usage_log
from app.workers.celery_app import celery_app


@celery_app.task(name="process_document_task")
def process_document_task(document_id: int) -> dict:
    db = SessionLocal()

    try:
        document = process_document(
            db=db,
            document_id=document_id,
        )

        create_usage_log(
            db=db,
            action=UsageAction.DOCUMENT_PROCESSING_COMPLETED,
            organization_id=document.organization_id,
            user_id=document.uploaded_by_user_id,
            resource_type="document",
            resource_id=document.id,
            detail=f"Document processing completed: {document.original_file_name}",
        )

        db.commit()

        return {
            "document_id": document.id,
            "status": document.status,
        }

    except Exception as exc:
        create_usage_log(
            db=db,
            action=UsageAction.DOCUMENT_PROCESSING_FAILED,
            organization_id=None,
            user_id=None,
            resource_type="document",
            resource_id=document_id,
            detail=str(exc),
        )

        db.commit()

        raise

    finally:
        db.close()