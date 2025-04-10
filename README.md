#  NoteCraft – Full-Stack Note Creation Web App

NoteCraft is a modern full-stack web application for managing notes and user data, built with Django, Celery, and Next.js. It enables users to upload academic content (PDFs), generate detailed notes using advanced AI models, and retrieve contextually relevant information using Retrieval-Augmented Generation (RAG). The platform is optimized for long documents and supports asynchronous processing for scalability, and is fully containerized using Docker and Docker Compose.


## 📑 Index

1. [📁 Project Structure](#project-structure)  
2. [🚀 Features](#features)  
3. [🖼️ System Architecture](#system-architecture)  
4. [🧪 Development Tools](#development-tools)  
5. [📂 Academic Namespaces](#academic-namespaces)  
6. [🚀 RAG Pipeline](#rag-pipeline)  
7. [📸 Image Rendering Format](#image-rendering-format)  
8. [🛠 Setup & Installation](#setup--installation)  
9. [⚙️ Environment Variables (.env)](#environment-variables-env)  
10. [📌 Useful Commands](#useful-commands)


## 📁 Project Structure

```bash
.
├── frontend/                      # Next.js Frontend (Client-side)
│   ├── next.config.ts
│   ├── package.json
│   └── src/
│       ├── app/                  # Pages (login, signup, notes, browse_pdfs)
│       ├── components/           # Reusable UI Components
│       └── utils/, contexts/     # Auth context, utility functions

├── NoteCraft_backend/            # Django Backend (Server-side)
│   ├── NoteCraft_backend/        # Django Project Root
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── celery.py             # Celery configuration
│   │   ├── asgi.py / wsgi.py
│   ├── NoteMaker/                # Django App: Notes functionality
│   │   ├── models.py, views.py, tasks.py, myutils.py
│   ├── UserData/                 # Django App: User data and auth
│   │   ├── models.py, views.py, serializer.py
│   ├── db.sqlite3
│   ├── Dockerfile.web            # Backend container
│   ├── Dockerfile.celery         # Celery worker container

├── docker-compose.yaml           # Multi-service orchestration
├── .env                          # Environment variables
```


## 🚀 Features

- 🌐 **Frontend**: Built with **Next.js** and **TypeScript**, featuring:
  - Authentication (login/signup)
  - Browse and upload PDFs
  - View and manage notes

- 🔧 **Backend**: Built with **Django REST Framework**
  - API for note creation and user management
  - Modular architecture via Django apps: `NoteMaker`, `UserData`

- ⚙️ **Asynchronous Task Handling**:
  - Powered by **Celery** and **Redis**
  - Background note generation, PDF processing, etc.

- 📦 **Containerized Deployment**:
  - Dockerized services for frontend, backend, and celery worker
  - `docker-compose` for easy orchestration


- ✍️ AI-generated academic notes using **Qwen/QWQ-32B** via **OpenRouter**.
- 🔍 Semantic search with **Pinecone Vector DB** using **Llama-text-embed-v2**, indexing **6,000 documents** across **18 academic namespaces**.
- 📤 PDF upload and retrieval via **Cloudinary**.
- 🧵 Asynchronous processing with **Celery** and **Redis**.

## 🖼️ System Architecture

```plaintext
          ┌────────────────────┐
          │   User (Browser)   │
          └────────┬───────────┘
                   │
                   ▼
          ┌────────────────────┐
          │   Next.js Frontend │
          └────────┬───────────┘
                   │ API Calls
                   ▼
          ┌────────────────────┐
          │ Django REST API    │◄─────────────┐
          │  (NoteMaker/User)  │              │
          └─────┬──────────────┘              │
                │                             │
                ▼                             │
       ┌────────────────────┐          ┌──────▼────────┐
       │   Celery Worker    │◄─────────┤ Redis Broker  │
       └────────────────────┘          └───────────────┘
                │
                ▼
         ┌─────────────┐
         │  Database   │  (SQLite / Cloud PostgreSQL)
         └─────────────┘
```

## 🧪 Development Tools

| Layer       | Technology                     |
|------------|---------------------------------|
| Frontend   | Next.js, React, TypeScript      |
| Backend    | Django, Django REST Framework   |
| Async Tasks| Celery + Redis                  |
| Vector DB  | Pinecone + Llama-text-embed-v2  |
| Text Gen   | Qwen/QWQ-32B via OpenRouter     |
| Image Gen  | Google Image Search             |
| Storage    | Cloudinary                      |
| DevOps     | Docker, Docker Compose          |

<div style="display: flex; gap: 10px; align-items: center;">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg" height=50px width=50px/>
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-plain.svg"height=50px width=50px />
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/djangorest/djangorest-line.svg" height=50px width=50px/>
 <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg" height=50px width=50px/>
 <img src="https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/openrouter.png" height=50px width=50px />
 <img src="https://www.make.com/_next/image?url=https%3A%2F%2Fimages.ctfassets.net%2Fun655fb9wln6%2FappIcon-pinecone%2Fb8570f90d0eeb98ffb03a35f5bf3782e%2Fpinecone.png&w=3840&q=90" height=50px width=50px />
 <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/redis/redis-original.svg" height=50px width=50px/>
 <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg" height=50px width=50px/>
</div> 
          

## 📂 Academic Namespaces

Includes 18 namespaces for granular search and retrieval:

- `physics`, `chemistry`, `mathematics_applied_math`, `cs_math`, `biology`, `medicine`, `agriculture_food_science`, `earth_sciences`, `psychology_cognitive_science`, `social_sciences`, `arts_humanities`, `engineering`, `technology_innovation`, `energy_sustainability`, `business_management`, `law_policy`, `philosophy_ethics`, `history`

## 🚀 RAG Pipeline

1. User inputs an academic query.
2. Query is embedded using `llama-text-embed-v2`.
3. Pinecone is queried to retrieve relevant context across 18 academic namespaces.
4. Retrieved context + user query is fed into Qwen/QWQ-32B (OpenRouter) for full-length note generation.
5. Notes are parsed for `&&&image:(description)&&&` markers and Google Images API is used to fetch images.

## 📸 Image Rendering Format

Use `&&&image:(description of image)&&&` within note generation prompts. These markers will be replaced with relevant Google Image Search results at runtime.



## 🛠 Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/NoteCraft.git
cd NoteCraft
```

### 2. Configure Environment

Create a `.env` file in the root with your environment variables:

## ⚙️ Environment Variables (.env)

Create a `.env` file with the following:

```env
# OpenRouter API
OPEN_ROUTER_API_KEY=your_openrouter_key

# Pinecone Vector DB
PINECONE_API_KEY=your_pinecone_key
or just use "pcsk_6cJ5U2_EcKRhfYQFY545a69Mm4k149Qmx6Ubiqw7uYdEZur8576AFYXaWRn4nYSscRh928"

# Google Image Search
GOOGLE_API_KEY=your_google_api_key
CX=your_google_custom_search_cx

# Cloudinary
CLOUDINARY_NAME
CLOUDINARY_API
CLOUDINARY_KEY
CLOUDINARY_URL

# Redis Broker URL
REDIS_URL

#Postgress URL
DB_URL
```

### 3. Build and Run with Docker Compose

```bash
docker-compose up --build
```

Visit the app at: [http://localhost:3000](http://localhost:3000)

## 📌 Useful Commands

### Backend

```bash
# Run Django shell
docker exec -it notecraft_backend python manage.py shell

# Apply migrations
docker exec -it notecraft_backend python manage.py migrate

# Create superuser
docker exec -it notecraft_backend python manage.py createsuperuser
```

### Frontend

```bash
# Start dev server (locally)
cd frontend
npm install
npm run dev
```