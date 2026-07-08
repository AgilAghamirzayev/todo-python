from fastapi import FastAPI

from app.api.v1.auth import router as auth_router
from app.api.v1.todos import router as todos_router


app = FastAPI(
    title="Todo App API",
    description="RESTful Todo App backend with FastAPI and PostgreSQL",
    version="1.0.0"
)


@app.get("/")
def root():
    return {"message": "Todo API is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


app.include_router(auth_router, prefix="/api/v1")
app.include_router(todos_router, prefix="/api/v1")