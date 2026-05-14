# Enterprise Document RAG Platform

A multi-tenant AI-powered document question-answering platform with source-grounded responses.

## Tech Stack

### Backend
- FastAPI
- PostgreSQL
- SQLAlchemy
- Redis
- Celery
- Docker

### AI / RAG
- OpenAI API
- LangChain
- pgVector
- Embeddings
- Retrieval-Augmented Generation

### Document Processing
- PDF
- DOCX
- Excel

## Current Status

Project structure initialized. Backend, PostgreSQL and Redis services are prepared with Docker Compose.

## Run Locally

```bash
docker compose up --build