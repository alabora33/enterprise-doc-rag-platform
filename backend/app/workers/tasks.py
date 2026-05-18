from app.db.session import SessionLocal
from app.services.document_processing_service import process_document
from app.workers.celery_app import celery_app


@celery_app.task(name="process_document_task")
def process_document_task(document_id: int) -> dict:
    db = SessionLocal()

    try:
        document = process_document(
            db=db,
            document_id=document_id,
        )

        return {
            "document_id": document.id,
            "status": document.status,
        }

    finally:
        db.close()