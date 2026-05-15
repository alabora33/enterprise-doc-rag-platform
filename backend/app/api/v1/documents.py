from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.v1.users import get_current_user
from app.db.session import get_db
from app.schemas.document import DocumentRead
from app.services.document_service import (
    create_document_record,
    get_document_by_id_and_organization,
    get_documents_by_organization,
)
from app.services.organization_service import get_user_organizations


router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)


def get_current_user_primary_organization_id(
    db: Session,
    user_id: int,
) -> int:
    user_organizations = get_user_organizations(
        db,
        user_id=user_id,
    )

    if not user_organizations:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User does not belong to any organization.",
        )

    return user_organizations[0].organization_id


@router.post(
    "/upload",
    response_model=DocumentRead,
    status_code=status.HTTP_201_CREATED,
)
def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    organization_id = get_current_user_primary_organization_id(
        db,
        user_id=current_user.id,
    )

    try:
        document = create_document_record(
            db=db,
            organization_id=organization_id,
            uploaded_by_user_id=current_user.id,
            upload_file=file,
        )

        return document

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


@router.get(
    "",
    response_model=list[DocumentRead],
)
def list_documents(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    organization_id = get_current_user_primary_organization_id(
        db,
        user_id=current_user.id,
    )

    return get_documents_by_organization(
        db,
        organization_id=organization_id,
    )


@router.get(
    "/{document_id}",
    response_model=DocumentRead,
)
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    organization_id = get_current_user_primary_organization_id(
        db,
        user_id=current_user.id,
    )

    document = get_document_by_id_and_organization(
        db,
        document_id=document_id,
        organization_id=organization_id,
    )

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    return document