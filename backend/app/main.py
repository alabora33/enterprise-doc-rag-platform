from fastapi import FastAPI

app = FastAPI(
    title="Enterprise Document RAG Platform",
    description="A multi-tenant AI-powered document question-answering platform with source-grounded responses.",
    version="0.1.0",
)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "Enterprise Document RAG Platform",
        "version": "0.1.0"
    }