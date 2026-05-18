from typing import Any


def split_text_into_chunks(
    text: str,
    chunk_size: int = 1200,
    chunk_overlap: int = 200,
) -> list[str]:
    cleaned_text = " ".join(text.split())

    if not cleaned_text:
        return []

    chunks: list[str] = []
    start = 0
    text_length = len(cleaned_text)

    while start < text_length:
        end = start + chunk_size
        chunk = cleaned_text[start:end]

        if chunk.strip():
            chunks.append(chunk.strip())

        if end >= text_length:
            break

        start = end - chunk_overlap

    return chunks


def create_chunks_from_sections(
    sections: list[dict[str, Any]],
    chunk_size: int = 1200,
    chunk_overlap: int = 200,
) -> list[dict[str, Any]]:
    all_chunks: list[dict[str, Any]] = []
    chunk_index = 0

    for section in sections:
        text_chunks = split_text_into_chunks(
            text=section["text"],
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )

        for text_chunk in text_chunks:
            all_chunks.append(
                {
                    "chunk_index": chunk_index,
                    "content": text_chunk,
                    "page_number": section.get("page_number"),
                    "sheet_name": section.get("sheet_name"),
                    "source_type": section.get("source_type"),
                }
            )

            chunk_index += 1

    return all_chunks