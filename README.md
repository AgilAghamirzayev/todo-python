# Todo App

A full-stack todo app with a **FastAPI** backend and a modern **React + shadcn/ui-style** frontend. Users can register, log in, and manage their own todos with JWT authentication.

## Features

- Register and log in users
- Issue JWT access tokens
- Create, list, update, complete, and delete todos
- Keep todos scoped to the authenticated user
- Filter todos by completion status
- PostgreSQL setup through Docker Compose
- Clean React frontend with reusable UI components

## Project Structure

```text
app/
  api/              FastAPI routes and dependencies
  core/             App config and security helpers
  db/               Database engine/session setup
  models/           SQLAlchemy models
  repositories/     Database query helpers
  schemas/          Pydantic request/response models
  services/         Business logic
alembic/            Database migration files
frontend/           Vite React frontend
docker-compose.yml  Local PostgreSQL service
```

## Requirements

- Python 3.9+
- Node.js 20+
- Docker and Docker Compose
- PostgreSQL client support through `psycopg2-binary`

## Backend Setup

Create a virtual environment and install dependencies:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql+psycopg://todo_user:todo_password@localhost:5432/todo_db
SECRET_KEY=change-this-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Start PostgreSQL:

```bash
docker compose up -d
```

Run migrations:

```bash
alembic upgrade head
```

Start the API:

```bash
uvicorn app.main:app --reload
```

The backend will be available at:

- `http://127.0.0.1:8000`
- Swagger docs: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

## Frontend Setup

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at `http://127.0.0.1:5173`.

If your backend runs somewhere else, create `frontend/.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## Main Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | API status message |
| `GET` | `/health` | Health check |
| `POST` | `/api/v1/auth/register` | Create a user |
| `POST` | `/api/v1/auth/login` | Log in and receive a bearer token |
| `POST` | `/api/v1/todos` | Create a todo |
| `GET` | `/api/v1/todos` | List current user's todos |
| `GET` | `/api/v1/todos/{todo_id}` | Get one todo |
| `PUT` | `/api/v1/todos/{todo_id}` | Update a todo |
| `PATCH` | `/api/v1/todos/{todo_id}/complete` | Mark a todo as complete |
| `DELETE` | `/api/v1/todos/{todo_id}` | Delete a todo |

Todo endpoints require an `Authorization: Bearer <token>` header.

## Example Flow

Register a user:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test User","email":"test@example.com","password":"password123"}'
```

Log in:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=password123"
```

Create a todo with the returned access token:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/todos \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn FastAPI","description":"Build a todo API"}'
```

## Notes

- `docker-compose.yml` starts only PostgreSQL; the FastAPI app runs locally with `uvicorn`.
- Auth login uses FastAPI's OAuth2 password form, so send `username` and `password` as form fields.
- Keep `SECRET_KEY` private and use a stronger value outside local development.
- If PostgreSQL reports `relation "users" does not exist`, run `alembic upgrade head`.
