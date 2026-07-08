from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.todo import TodoCreate, TodoUpdate
from app.repositories.todo_repository import (
    create_todo,
    get_user_todos,
    get_todo_by_id,
    update_todo,
    delete_todo
)


def create_user_todo(db: Session, todo_data: TodoCreate, user_id: int):
    return create_todo(db, todo_data, user_id)


def list_user_todos(db: Session, user_id: int, completed: Optional[bool] = None):
    return get_user_todos(db, user_id, completed)


def get_user_todo(db: Session, todo_id: int, user_id: int):
    todo = get_todo_by_id(db, todo_id, user_id)

    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )

    return todo


def update_user_todo(db: Session, todo_id: int, user_id: int, todo_data: TodoUpdate):
    todo = get_user_todo(db, todo_id, user_id)
    return update_todo(db, todo, todo_data)


def complete_user_todo(db: Session, todo_id: int, user_id: int):
    todo = get_user_todo(db, todo_id, user_id)
    todo.completed = True

    db.commit()
    db.refresh(todo)

    return todo


def delete_user_todo(db: Session, todo_id: int, user_id: int):
    todo = get_user_todo(db, todo_id, user_id)
    delete_todo(db, todo)
