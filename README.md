# Task Collaboration System

A production-ready, scalable, and secure **Full-Stack Task Collaboration System** built using Node.js, Express, TypeScript, PostgreSQL, Prisma ORM, React, Redux Toolkit, and Docker.

---

## 1. Overview

The Task Collaboration System enables organization members to collaborate on projects and manage tasks under strict Role-Based Access Control (RBAC). It features:
- Stateless dual-token JWT authentication (Short-lived Access Tokens + Persistent Refresh Tokens).
- Granular Role-Based Access Control (`ADMIN`, `MANAGER`, `USER`).
- Complete Project & Task CRUD workflows with server-side pagination, search, filtering, and whitelisted sorting.
- Contextual resource ownership & membership guards.
- Centralized error handling, Zod validation, and structured HTTP logging.
- Responsive dark-mode React UI with Redux Toolkit state management and Axios interceptors.
- Production containerization via Docker & Docker Compose.

---

## 2. Technology Stack

### Backend
- **Runtime & Framework**: Node.js, Express, TypeScript (Strict Mode)
- **Database & ORM**: PostgreSQL, Prisma ORM (v5.10)
- **Validation & Auth**: Zod, JSON Web Tokens (`jsonwebtoken`), `bcryptjs`
- **Security & Logging**: Helmet, CORS, `express-rate-limit`, `cookie-parser`, Custom Structured Logger

### Frontend
- **Framework & Build**: React 18, TypeScript, Vite
- **State Management**: Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Routing & HTTP**: React Router v6, Axios (Centralized Client + Interceptors)
- **Styling**: Tailwind CSS v3, Lucide Icons

### Infrastructure & DevOps
- Docker, Docker Compose, Multi-stage Dockerfiles, Nginx Alpine

---

## 3. High-Level Architecture (Modular Monolith)

```
                       ┌──────────────────────────────────────────────┐
                       │          React SPA Frontend (Vite)           │
                       │   React Router v6 + Redux Toolkit + Axios    │
                       └──────────────────────┬───────────────────────┘
                                              │ HTTP / JSON
                                              ▼
                       ┌──────────────────────────────────────────────┐
                       │          Express Backend API (TS)            │
                       │  Routes -> Middlewares -> Controllers ->     │
                       │         Services -> Repositories             │
                       └──────────────────────┬───────────────────────┘
                                              │ Prisma ORM
                                              ▼
                       ┌──────────────────────────────────────────────┐
                       │         PostgreSQL Database (Docker)         │
                       └──────────────────────────────────────────────┘
```

> **Why a Modular Monolith?**
> A modular monolith provides clean domain boundary separation (**Routes -> Controllers -> Services -> Repositories**) without the network overhead, deployment complexity, or distributed tracing requirements of microservices. It is the optimal architecture for rapid development while keeping operational maintenance low.

---

## 4. Folder Structure

```
task-collaboration-system/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   └── src/
│       ├── config/          # env.ts validation, database.ts Prisma singleton
│       ├── controllers/     # auth, project, and task HTTP handlers
│       ├── services/        # business logic orchestration
│       ├── repositories/    # database Prisma query abstractions
│       ├── routes/          # Express route definitions
│       ├── middleware/      # auth, role, resource, validation, error handlers
│       ├── schemas/         # Zod schemas (auth, project, task)
│       ├── utils/           # jwt, password, logger, app-error, async-handler
│       ├── types/           # express.d.ts type extensions
│       ├── app.ts           # Express application setup
│       └── server.ts        # HTTP listener entrypoint
│
└── frontend/
    ├── Dockerfile
    ├── .dockerignore
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── nginx.conf
    └── src/
        ├── api/             # client.ts (Axios + interceptors)
        ├── components/      # UI component primitives
        ├── layouts/         # MainLayout, AuthLayout
        ├── pages/           # Login, Register, Dashboard, Projects, Tasks
        ├── routes/          # ProtectedRoute & PublicRoute
        ├── store/           # Redux Toolkit store & feature slices
        ├── types/           # Shared TypeScript interfaces
        ├── App.tsx          # Router hierarchy
        └── main.tsx         # Root mounting point
```

---

## 5. Database Schema & ER Design

### Core Entities
1. **User**: `id`, `name`, `email` (unique, indexed), `passwordHash`, `role` (`ADMIN` | `MANAGER` | `USER`), `createdAt`, `updatedAt`.
2. **RefreshToken**: `id`, `token` (unique), `userId` (FK -> User), `expiresAt`, `createdAt`.
3. **Project**: `id`, `name`, `description`, `createdById` (FK -> User), `createdAt`, `updatedAt`.
4. **ProjectMember**: `id`, `projectId` (FK -> Project), `userId` (FK -> User), `createdAt` (Unique constraint on `[projectId, userId]`).
5. **Task**: `id`, `title`, `description`, `status` (`TODO` | `IN_PROGRESS` | `DONE`), `priority` (`LOW` | `MEDIUM` | `HIGH`), `dueDate`, `projectId` (FK -> Project), `assignedToId` (FK -> User), `createdById` (FK -> User), `createdAt`, `updatedAt`.

### Database Indexing Strategy
- `User.email`: Fast credential verification.
- `Project.createdById`: Quick creator project listings.
- `ProjectMember(projectId, userId)`: Fast membership checks.
- `Task(projectId, assignedToId, createdById)`: Scoped task queries.
- `Task(status, priority, createdAt, dueDate)`: Paginated and filtered task lookups.

---

## 6. RBAC Permission Matrix

| Operation / Feature | ADMIN | MANAGER | USER |
| :--- | :---: | :---: | :---: |
| **System Overview & Dashboard** | All | Scoped to membership | Scoped to membership |
| **Create Project** | ✅ | ✅ | ❌ |
| **Update Project** | ✅ All | ✅ Managed / Created | ❌ |
| **Delete Project** | ✅ All | ✅ Created | ❌ |
| **Manage Members** | ✅ All | ✅ Managed Projects | ❌ |
| **Create Task** | ✅ All | ✅ Managed Projects | ✅ Member Projects |
| **Update Task (All fields)** | ✅ All | ✅ Managed Projects | ✅ Tasks Created by them |
| **Update Task (Status only)** | ✅ All | ✅ Managed Projects | ✅ Tasks Assigned to them |
| **Delete Task** | ✅ All | ✅ Managed Projects | ✅ Tasks Created by them |

---

## 7. REST API Endpoints Reference

### Auth (`/api/v1/auth`)
- `POST /register` - Body: `{ name, email, password }` -> Returns Access Token + HttpOnly Cookie.
- `POST /login` - Body: `{ email, password }` -> Returns Access Token + HttpOnly Cookie.
- `POST /refresh` - Body/Cookie: `{ refreshToken }` -> Returns new Access Token.
- `POST /logout` - Header: `Bearer <token>` -> Invalidate refresh token in DB.
- `GET /me` - Header: `Bearer <token>` -> Current user context.

### Projects (`/api/v1/projects`)
- `GET /` - Query: `?page=1&limit=10&search=keyword&sortBy=createdAt&sortOrder=desc` -> Paginated projects.
- `POST /` - Body: `{ name, description }` -> Create project (`ADMIN`, `MANAGER`).
- `GET /:id` -> Project details & members count.
- `PATCH /:id` - Body: `{ name, description }` -> Update project details.
- `DELETE /:id` -> Delete project.
- `GET /:id/members` -> List project members.
- `POST /:id/members` - Body: `{ userId }` -> Add team member.
- `DELETE /:id/members/:userId` -> Remove team member.

### Tasks (`/api/v1/tasks`)
- `GET /` - Query: `?page=1&limit=10&status=IN_PROGRESS&priority=HIGH&projectId=uuid&search=term&sortBy=dueDate&sortOrder=asc` -> Paginated tasks.
- `POST /` - Body: `{ title, description, status, priority, projectId, assignedToId, dueDate }` -> Create task.
- `GET /:id` -> Get task details.
- `PATCH /:id` - Body: `{ status, priority, title, description, assignedToId, dueDate }` -> Update task.
- `DELETE /:id` -> Delete task.

---

### Quick Start (Start All Systems Together)
```bash
# From root folder:
npm run dev
```
- Backend will run at `http://localhost:5000`
- Frontend will run at `http://localhost:5173`

### 1. Setup Backend
```bash
cd backend

# Install dependencies
npm install

# Generate Prisma Client & Run Seed
npx prisma generate
npx prisma db push
npm run prisma:seed

# Start backend dev server (Port 5000)
npm run dev
```

### 2. Setup Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server (Port 5173)
npm run dev
```

---

## 9. Docker Containerization

To run the complete system with a containerized PostgreSQL database:

```bash
# Build and run containers in background
docker compose up --build -d

# Stop container cluster
docker compose down
```

- **Frontend SPA**: `http://localhost:5173` (Served via Nginx Alpine).
- **Backend API**: `http://localhost:5000/api/v1`.
- **PostgreSQL**: `localhost:5432` (`postgres_data` persistent volume).

---

## 10. Development Seed Credentials

The database seed script initializes 3 default accounts (Password: `Password123!`):

| Role | Email | Password |
| :--- | :--- | :--- |
| **ADMIN** | `admin@example.com` | `Password123!` |
| **MANAGER** | `manager@example.com` | `Password123!` |
| **USER** | `user@example.com` | `Password123!` |

---

## 11. Deployment Strategy & Recommendations

### Recommended Deployment Option (Production MVP)
- **Frontend**: Managed Static Hosting (Vercel / Netlify / Cloudflare Pages) for zero-config global CDN distribution.
- **Backend**: Containerized web service on Railway / Render / Fly.io.
- **Database**: Managed PostgreSQL on Supabase / Neon / AWS RDS.

**Why?**
- Eliminates manual server patching and database backup maintenance.
- Provides automatic TLS/SSL certificate handling out of the box.
- Allows independent scaling of the frontend CDN and backend API containers.

### Alternative Option
- **VPS with Docker Compose**: Single DigitalOcean / AWS EC2 instance running Nginx reverse proxy + Docker Compose cluster. Suitable for low cost and total infrastructure control.

---

## 12. Interview Defense & Technical Q&A

### Architecture & Backend Decisions
1. **Why Express?** Express is lightweight, unopinionated, extremely fast to bootstrap in machine tests, and integrates seamlessly with custom middleware pipelines.
2. **Why PostgreSQL?** PostgreSQL offers ACID compliance, robust foreign key relational integrity, native enum types, and superior indexing capabilities.
3. **Why Prisma ORM?** Auto-generated TypeScript types prevent runtime column mismatch bugs and ensure safe parameterized query construction.
4. **Why 4-Layer Architecture (Routes -> Controller -> Service -> Repository)?**
   - *Routes*: Route mapping and middleware composition.
   - *Controllers*: HTTP request parsing & status code formatting.
   - *Services*: Pure business logic (e.g. checking task permissions).
   - *Repositories*: Database query abstraction.
5. **Why Access + Refresh Tokens?** Short-lived Access Tokens (15 mins) minimize blast radius if compromised. Long-lived Refresh Tokens (7 days) stored in database and HttpOnly cookies allow seamless session renewal without asking the user to re-enter credentials constantly.
6. **Difference between 401 and 403?**
   - `401 Unauthorized`: Missing or invalid authentication token (Identity unknown).
   - `403 Forbidden`: Authenticated identity lacks required role or resource ownership (Identity known, permission denied).
7. **Why Zod?** Zod validates external HTTP inputs at runtime and infers static TypeScript types automatically, eliminating duplicate schema code.
8. **Why Database Indexes?** Indexes convert table scans to B-Tree lookups for frequent filter columns (`status`, `priority`, `createdById`), significantly reducing query latency at the expense of minor write overhead.
9. **How N+1 Queries are Prevented?** Prisma `include` and relation joins fetch nested relations in single SQL queries rather than executing N queries inside loops.
10. **How SQL Injection is Prevented?** Prisma uses parameterized queries natively for all database operations.

### Frontend & DevOps Decisions
11. **Why Redux Toolkit?** Provides predictable global state management for user authentication, current project context, and task filters across components.
12. **How Protected Routes Work?** `ProtectedRoute` wraps protected view components, inspecting `isAuthenticated` from Redux state. Unauthenticated requests are redirected to `/login`.
13. **How Axios Interceptor Handles Expiry?** Response interceptor catches `401` errors and automatically invokes `/auth/refresh` using cookies. If refresh fails, local storage is cleared and user is redirected to `/login`.
14. **Why Docker & Multi-stage Builds?** Multi-stage Dockerfiles produce lightweight production images by stripping build-time tools (like TypeScript compiler and devDependencies) from the final runtime container.
