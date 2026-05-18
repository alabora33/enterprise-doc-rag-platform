# Enterprise Document RAG Platform

> 🇬🇧 [English](#english) | 🇹🇷 [Türkçe](#türkçe)

---

<a name="english"></a>
# 🇬🇧 English

A full-stack, multi-tenant AI-powered document intelligence platform. Upload internal corporate documents, ask source-grounded questions, and get answers backed by real document chunks — with full chat history, organization isolation, and admin monitoring.

---

## Features

### Authentication & Multi-Tenancy
- User registration and JWT-based login
- Organization/company structure with role separation (owner, member)
- Organization-scoped document access and retrieval

### Document Management
- Upload PDF, DOCX, XLSX, and TXT files
- Background processing via Celery workers
- Track processing status (uploaded → processing → completed / failed)
- Retry failed documents, delete documents
- View extracted text chunks per document

### AI / RAG Pipeline
- Text extraction from PDF, DOCX, XLSX, TXT
- Chunking with overlap for context preservation
- Gemini Embeddings (`gemini-embedding-001`, 1536 dimensions)
- pgVector semantic search scoped to the user's organization
- Source-grounded answer generation with Gemini (`gemini-2.0-flash`)
- Source metadata (file name, chunk index, page, similarity score) returned per answer

### Chat System
- Persistent chat sessions with full message history
- Session list with titles
- RAG-based answers with configurable Top-K retrieval

### Admin & Usage Tracking
- Usage logs for every action (upload, search, RAG chat, retry, etc.)
- Admin summary metrics: total documents, chunks, sessions, messages, searches
- Recent usage log table with action labels, user, organization, resource, and timestamp

### Internationalization
- Full Turkish / English UI toggle
- Language preference persisted in localStorage
- All pages fully translated (Login, Register, Dashboard, Documents, Chat, Admin)

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Backend** | FastAPI, SQLAlchemy, Alembic, Pydantic, Python-Jose (JWT), Passlib |
| **Database** | PostgreSQL 16 + pgVector |
| **Queue** | Redis + Celery |
| **AI** | Google Gemini (embeddings + chat), pgVector similarity search |
| **Document parsing** | pypdf, python-docx, openpyxl, pandas |
| **Frontend** | React 19, Vite, TailwindCSS, Axios, React Router, i18next |
| **Infrastructure** | Docker, Docker Compose |

---

## Architecture

```
Browser (React + Vite :5173)
        │
        │ HTTP / JSON
        ▼
FastAPI Backend (:8000)
        │
        ├──► PostgreSQL + pgVector  (metadata, embeddings, chat history)
        │
        ├──► Redis                  (Celery task queue)
        │
        └──► Celery Worker          (document parsing, chunking, embedding)
                    │
                    └──► Gemini API (embeddings + chat completions)
```

---

## Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- [Node.js](https://nodejs.org/) 18+ (for local frontend development)
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

---

## Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd enterprise-doc-rag-platform
```

### 2. Create the backend `.env` file

Create `backend/.env` with the following variables:

```env
# Database
DATABASE_URL=postgresql://rag_user:rag_password@postgres:5432/rag_db

# Redis
REDIS_URL=redis://redis:6379/0

# JWT
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Gemini
GEMINI_API_KEY=your-gemini-api-key-here
EMBEDDING_PROVIDER=gemini
EMBEDDING_MODEL=gemini-embedding-001
EMBEDDING_DIMENSION=1536
CHAT_MODEL=gemini-2.0-flash

# Storage
UPLOAD_DIR=uploads
```

### 3. Start the backend services

```bash
docker compose up --build
```

This starts:
- `enterprise_rag_backend` — FastAPI API on port **8000**
- `enterprise_rag_celery_worker` — Background document processor
- `enterprise_rag_postgres` — PostgreSQL 16 + pgVector on port **5432**
- `enterprise_rag_redis` — Redis 7 on port **6379**

### 4. Run database migrations

```bash
docker compose exec backend alembic upgrade head
```

### 5. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

---

## Usage

1. Open **http://localhost:5173** in your browser
2. Register a new account (this also creates your organization)
3. Log in and navigate to **Documents** to upload files
4. Wait for processing status to become **Completed**
5. Go to **Chat** and ask questions about your documents
6. Answers include source references (file name, page, similarity score)

---

## API

Interactive API docs are available at **http://localhost:8000/docs** (Swagger UI).

| Endpoint | Description |
|---|---|
| `POST /api/v1/auth/register` | Register a new user + organization |
| `POST /api/v1/auth/login` | Login, receive JWT token |
| `GET /api/v1/users/me` | Current user info |
| `GET/POST /api/v1/documents` | List and upload documents |
| `POST /api/v1/documents/{id}/retry` | Retry failed document |
| `GET /api/v1/documents/{id}/chunks` | View extracted chunks |
| `POST /api/v1/chat` | Send a RAG chat message |
| `GET /api/v1/chat/sessions` | List chat sessions |
| `GET /api/v1/chat/sessions/{id}` | Get session with messages |
| `GET /api/v1/admin/usage/summary` | Admin usage metrics |
| `GET /api/v1/admin/usage/logs` | Admin usage log table |

---

## Project Structure

```
enterprise-doc-rag-platform/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic/               # Database migrations
│   └── app/
│       ├── main.py
│       ├── api/v1/            # API route handlers
│       ├── core/              # Config, security (JWT)
│       ├── db/                # SQLAlchemy session & base
│       ├── models/            # ORM models
│       ├── schemas/           # Pydantic schemas
│       ├── services/          # Business logic
│       └── workers/           # Celery tasks
└── frontend/
    └── src/
        ├── api/               # Axios client
        ├── components/        # Shared UI components
        ├── i18n/locales/      # en.json, tr.json translations
        ├── layouts/           # DashboardLayout
        └── pages/             # LoginPage, RegisterPage, Dashboard,
                               # DocumentsPage, ChatPage, AdminUsagePage
```

---

## Health Check

```bash
curl http://localhost:8000/health
```

```json
{ "status": "ok", "service": "Enterprise Document RAG Platform", "version": "0.1.0" }
```

---

<a name="türkçe"></a>
# 🇹🇷 Türkçe

Kurumsal şirket içi dokümanları yükleyip, bu dokümanlara kaynak göstererek soru sormanızı sağlayan tam yığın, çok kiracılı (multi-tenant), yapay zeka destekli bir doküman zekâ platformu. Tam sohbet geçmişi, organizasyon bazlı veri izolasyonu ve admin izleme özellikleriyle birlikte gelir.

---

## Özellikler

### Kimlik Doğrulama & Çok Kiracılı Yapı
- Kullanıcı kaydı ve JWT tabanlı giriş
- Rol ayrımı olan organizasyon/şirket yapısı (owner, member)
- Organizasyon kapsamlı doküman erişimi ve sorgu izolasyonu

### Doküman Yönetimi
- PDF, DOCX, XLSX ve TXT dosyası yükleme
- Celery worker ile arka planda işleme
- İşlem durumu takibi (yüklendi → işleniyor → tamamlandı / başarısız)
- Başarısız dokümanları yeniden işleme, doküman silme
- Doküman başına çıkarılan metin parçalarını görüntüleme

### Yapay Zeka / RAG Pipeline'ı
- PDF, DOCX, XLSX, TXT'den metin çıkarma
- Bağlam korumalı örtüşmeli (overlap) parçalama
- Gemini Embeddings (`gemini-embedding-001`, 1536 boyut)
- Kullanıcının organizasyonuna kapsamlı pgVector semantik arama
- Gemini (`gemini-2.0-flash`) ile kaynak göstererek cevap üretme
- Her cevapla birlikte kaynak metadata (dosya adı, parça no, sayfa, benzerlik skoru)

### Sohbet Sistemi
- Tam mesaj geçmişiyle kalıcı sohbet oturumları
- Başlıklı oturum listesi
- Yapılandırılabilir Top-K sayısıyla RAG tabanlı cevaplar

### Admin & Kullanım Takibi
- Her aksiyon için kullanım kaydı (yükleme, arama, RAG sohbet, yeniden deneme vb.)
- Admin özet metrikleri: toplam doküman, parça, oturum, mesaj, arama sayıları
- Aksiyon etiketi, kullanıcı, organizasyon, kaynak ve zaman damgasıyla son kullanım kaydı tablosu

### Çoklu Dil Desteği
- Tam Türkçe / İngilizce UI geçişi
- Dil tercihi localStorage'da saklanır
- Tüm sayfalar tamamen çevrilmiştir (Giriş, Kayıt, Dashboard, Dokümanlar, Sohbet, Admin)

---

## Teknoloji Yığını

| Katman | Teknolojiler |
|---|---|
| **Backend** | FastAPI, SQLAlchemy, Alembic, Pydantic, Python-Jose (JWT), Passlib |
| **Veritabanı** | PostgreSQL 16 + pgVector |
| **Kuyruk** | Redis + Celery |
| **Yapay Zeka** | Google Gemini (embedding + sohbet), pgVector benzerlik araması |
| **Doküman ayrıştırma** | pypdf, python-docx, openpyxl, pandas |
| **Frontend** | React 19, Vite, TailwindCSS, Axios, React Router, i18next |
| **Altyapı** | Docker, Docker Compose |

---

## Mimari

```
Tarayıcı (React + Vite :5173)
        │
        │ HTTP / JSON
        ▼
FastAPI Backend (:8000)
        │
        ├──► PostgreSQL + pgVector  (metadata, embedding'ler, sohbet geçmişi)
        │
        ├──► Redis                  (Celery iş kuyruğu)
        │
        └──► Celery Worker          (doküman ayrıştırma, parçalama, embedding)
                    │
                    └──► Gemini API (embedding + sohbet tamamlama)
```

---

## Gereksinimler

- [Docker](https://www.docker.com/) ve Docker Compose
- [Node.js](https://nodejs.org/) 18+ (yerel frontend geliştirme için)
- [Google Gemini API anahtarı](https://aistudio.google.com/app/apikey)

---

## Kurulum

### 1. Depoyu klonlayın

```bash
git clone <repo-url>
cd enterprise-doc-rag-platform
```

### 2. Backend `.env` dosyasını oluşturun

`backend/.env` dosyasını aşağıdaki değişkenlerle oluşturun:

```env
# Veritabanı
DATABASE_URL=postgresql://rag_user:rag_password@postgres:5432/rag_db

# Redis
REDIS_URL=redis://redis:6379/0

# JWT
JWT_SECRET_KEY=gizli-anahtariniz
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Gemini
GEMINI_API_KEY=gemini-api-anahtariniz
EMBEDDING_PROVIDER=gemini
EMBEDDING_MODEL=gemini-embedding-001
EMBEDDING_DIMENSION=1536
CHAT_MODEL=gemini-2.0-flash

# Dosya Depolama
UPLOAD_DIR=uploads
```

### 3. Backend servislerini başlatın

```bash
docker compose up --build
```

Şu servisler başlar:
- `enterprise_rag_backend` — FastAPI API, port **8000**
- `enterprise_rag_celery_worker` — Arka plan doküman işleyici
- `enterprise_rag_postgres` — PostgreSQL 16 + pgVector, port **5432**
- `enterprise_rag_redis` — Redis 7, port **6379**

### 4. Veritabanı migration'larını çalıştırın

```bash
docker compose exec backend alembic upgrade head
```

### 5. Frontend'i başlatın

```bash
cd frontend
npm install
npm run dev
```

Frontend **http://localhost:5173** adresinde çalışır.

---

## Kullanım

1. Tarayıcıda **http://localhost:5173** adresini açın
2. Yeni hesap oluşturun (organizasyonunuz da otomatik oluşturulur)
3. Giriş yapıp **Dokümanlar** sayfasına gidin ve dosya yükleyin
4. İşlem durumunun **Tamamlandı** olmasını bekleyin
5. **Sohbet** sayfasına geçip dokümanlarınıza soru sorun
6. Her cevap kaynak referanslarıyla birlikte gelir (dosya adı, sayfa, benzerlik skoru)

---

## API

İnteraktif API dokümantasyonu **http://localhost:8000/docs** adresinde mevcuttur (Swagger UI).

| Endpoint | Açıklama |
|---|---|
| `POST /api/v1/auth/register` | Yeni kullanıcı + organizasyon kaydı |
| `POST /api/v1/auth/login` | Giriş yap, JWT token al |
| `GET /api/v1/users/me` | Mevcut kullanıcı bilgisi |
| `GET/POST /api/v1/documents` | Doküman listele ve yükle |
| `POST /api/v1/documents/{id}/retry` | Başarısız dokümanı yeniden işle |
| `GET /api/v1/documents/{id}/chunks` | Metin parçalarını görüntüle |
| `POST /api/v1/chat` | RAG sohbet mesajı gönder |
| `GET /api/v1/chat/sessions` | Sohbet oturumlarını listele |
| `GET /api/v1/chat/sessions/{id}` | Oturumu mesajlarıyla getir |
| `GET /api/v1/admin/usage/summary` | Admin kullanım metrikleri |
| `GET /api/v1/admin/usage/logs` | Admin kullanım kaydı tablosu |

---

## Proje Yapısı

```
enterprise-doc-rag-platform/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic/               # Veritabanı migration'ları
│   └── app/
│       ├── main.py
│       ├── api/v1/            # API route handler'ları
│       ├── core/              # Yapılandırma, güvenlik (JWT)
│       ├── db/                # SQLAlchemy session & base
│       ├── models/            # ORM modelleri
│       ├── schemas/           # Pydantic şemaları
│       ├── services/          # İş mantığı
│       └── workers/           # Celery görevleri
└── frontend/
    └── src/
        ├── api/               # Axios istemcisi
        ├── components/        # Paylaşılan UI bileşenleri
        ├── i18n/locales/      # en.json, tr.json çevirileri
        ├── layouts/           # DashboardLayout
        └── pages/             # Giriş, Kayıt, Dashboard,
                               # Dokümanlar, Sohbet, Admin sayfaları
```

---

## Sağlık Kontrolü

```bash
curl http://localhost:8000/health
```

```json
{ "status": "ok", "service": "Enterprise Document RAG Platform", "version": "0.1.0" }
```


---

## Features

### Authentication & Multi-Tenancy
- User registration and JWT-based login
- Organization/company structure with role separation (owner, member)
- Organization-scoped document access and retrieval

### Document Management
- Upload PDF, DOCX, XLSX, and TXT files
- Background processing via Celery workers
- Track processing status (uploaded → processing → completed / failed)
- Retry failed documents, delete documents
- View extracted text chunks per document

### AI / RAG Pipeline
- Text extraction from PDF, DOCX, XLSX, TXT
- Chunking with overlap for context preservation
- Gemini Embeddings (`gemini-embedding-001`, 1536 dimensions)
- pgVector semantic search scoped to the user's organization
- Source-grounded answer generation with Gemini (`gemini-2.0-flash`)
- Source metadata (file name, chunk index, page, similarity score) returned per answer

### Chat System
- Persistent chat sessions with full message history
- Session list with titles
- RAG-based answers with configurable Top-K retrieval

### Admin & Usage Tracking
- Usage logs for every action (upload, search, RAG chat, retry, etc.)
- Admin summary metrics: total documents, chunks, sessions, messages, searches
- Recent usage log table with action labels, user, organization, resource, and timestamp

### Internationalization
- Full Turkish / English UI toggle
- Language preference persisted in localStorage
- All pages fully translated (Login, Register, Dashboard, Documents, Chat, Admin)

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Backend** | FastAPI, SQLAlchemy, Alembic, Pydantic, Python-Jose (JWT), Passlib |
| **Database** | PostgreSQL 16 + pgVector |
| **Queue** | Redis + Celery |
| **AI** | Google Gemini (embeddings + chat), pgVector similarity search |
| **Document parsing** | pypdf, python-docx, openpyxl, pandas |
| **Frontend** | React 19, Vite, TailwindCSS, Axios, React Router, i18next |
| **Infrastructure** | Docker, Docker Compose |

---

## Architecture

```
Browser (React + Vite :5173)
        │
        │ HTTP / JSON
        ▼
FastAPI Backend (:8000)
        │
        ├──► PostgreSQL + pgVector  (metadata, embeddings, chat history)
        │
        ├──► Redis                  (Celery task queue)
        │
        └──► Celery Worker          (document parsing, chunking, embedding)
                    │
                    └──► Gemini API (embeddings + chat completions)
```

---

## Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- [Node.js](https://nodejs.org/) 18+ (for local frontend development)
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

---

## Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd enterprise-doc-rag-platform
```

### 2. Create the backend `.env` file

Create `backend/.env` with the following variables:

```env
# Database
DATABASE_URL=postgresql://rag_user:rag_password@postgres:5432/rag_db

# Redis
REDIS_URL=redis://redis:6379/0

# JWT
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Gemini
GEMINI_API_KEY=your-gemini-api-key-here
EMBEDDING_PROVIDER=gemini
EMBEDDING_MODEL=gemini-embedding-001
EMBEDDING_DIMENSION=1536
CHAT_MODEL=gemini-2.0-flash

# Storage
UPLOAD_DIR=uploads
```

### 3. Start the backend services

```bash
docker compose up --build
```

This starts:
- `enterprise_rag_backend` — FastAPI API on port **8000**
- `enterprise_rag_celery_worker` — Background document processor
- `enterprise_rag_postgres` — PostgreSQL 16 + pgVector on port **5432**
- `enterprise_rag_redis` — Redis 7 on port **6379**

### 4. Run database migrations

```bash
docker compose exec backend alembic upgrade head
```

### 5. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

---

## Usage

1. Open **http://localhost:5173** in your browser
2. Register a new account (this also creates your organization)
3. Log in and navigate to **Documents** to upload files
4. Wait for processing status to become **Completed**
5. Go to **Chat** and ask questions about your documents
6. Answers include source references (file name, page, similarity score)

---

## API

Interactive API docs are available at **http://localhost:8000/docs** (Swagger UI).

Key endpoint groups:

| Prefix | Description |
|---|---|
| `POST /api/v1/auth/register` | Register a new user + organization |
| `POST /api/v1/auth/login` | Login, receive JWT token |
| `GET /api/v1/users/me` | Current user info |
| `GET/POST /api/v1/documents` | List and upload documents |
| `POST /api/v1/documents/{id}/retry` | Retry failed document |
| `GET /api/v1/documents/{id}/chunks` | View extracted chunks |
| `POST /api/v1/chat` | Send a RAG chat message |
| `GET /api/v1/chat/sessions` | List chat sessions |
| `GET /api/v1/chat/sessions/{id}` | Get session with messages |
| `GET /api/v1/admin/usage/summary` | Admin usage metrics |
| `GET /api/v1/admin/usage/logs` | Admin usage log table |

---

## Project Structure

```
enterprise-doc-rag-platform/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic/               # Database migrations
│   └── app/
│       ├── main.py
│       ├── api/v1/            # API route handlers
│       ├── core/              # Config, security (JWT)
│       ├── db/                # SQLAlchemy session & base
│       ├── models/            # ORM models
│       ├── schemas/           # Pydantic schemas
│       ├── services/          # Business logic
│       └── workers/           # Celery tasks
└── frontend/
    └── src/
        ├── api/               # Axios client
        ├── components/        # Shared UI components
        ├── i18n/locales/      # en.json, tr.json translations
        ├── layouts/           # DashboardLayout
        └── pages/             # LoginPage, RegisterPage, Dashboard,
                               # DocumentsPage, ChatPage, AdminUsagePage
```

---

## Health Check

```bash
curl http://localhost:8000/health
```

```json
{ "status": "ok", "service": "Enterprise Document RAG Platform", "version": "0.1.0" }
```
