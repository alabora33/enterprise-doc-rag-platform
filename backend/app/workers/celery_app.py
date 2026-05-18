from celery import Celery

from app.core.config import settings


celery_app = Celery(
    "enterprise_doc_rag_worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="Europe/Istanbul",
    enable_utc=True,
)

celery_app.autodiscover_tasks(
    [
        "app.workers.tasks",
    ]
)