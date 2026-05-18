from sqlalchemy.orm import Session

from app.models.document import Document, DocumentStatus
from app.models.document_chunk import DocumentChunk
from app.services.chunking_service import create_chunks_from_sections
from app.services.parser_service import parse_document
from app.services.embedding_service import create_embeddings

def process_document(
    db: Session,
    document_id: int,
) -> Document:
    document = (
        db.query(Document)
        .filter(Document.id == document_id)
        .first()
    )

    if not document:
        raise ValueError("Document not found.")

    try:
        document.status = DocumentStatus.PROCESSING.value
        db.commit()
        db.refresh(document)

        sections = parse_document(
            file_path=document.file_path,
        )

        chunks = create_chunks_from_sections(
            sections=sections,
        )
        if not chunks:
            raise ValueError("No text content could be extracted from the document.")

        chunk_texts = [
            chunk["content"]
            for chunk in chunks
        ]

        embeddings = create_embeddings(
            chunk_texts,
        )
        existing_chunks = (
            db.query(DocumentChunk)
            .filter(DocumentChunk.document_id == document.id)
            .all()
        )

        for chunk in existing_chunks:
            db.delete(chunk)

        db.flush()

        for index, chunk in enumerate(chunks):
            document_chunk = DocumentChunk(
                document_id=document.id,
                organization_id=document.organization_id,
                chunk_index=chunk["chunk_index"],
                content=chunk["content"],
                embedding=embeddings[index],
                page_number=chunk["page_number"],
                sheet_name=chunk["sheet_name"],
                source_type=chunk["source_type"],
            )

            db.add(document_chunk)
            
        document.status = DocumentStatus.COMPLETED.value
        db.commit()
        db.refresh(document)

        return document
    
    except Exception:
        db.rollback()

        document = (
            db.query(Document)
            .filter(Document.id == document_id)
            .first()
        )

        if document:
            document.status = DocumentStatus.FAILED.value
            db.commit()
            db.refresh(document)

        raise