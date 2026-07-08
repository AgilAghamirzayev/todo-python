from typing import Optional

from sqlalchemy.orm import Session

from app.models.todo import Todo
from app.schemas.todo import TodoCreate, TodoUpdate


def create_todo(db: Session, todo_data: TodoCreate, user_id: int):
    todo = Todo(
        title=todo_data.title,
        description=todo_data.description,
        user_id=user_id
    )

    db.add(todo)
    db.commit()
    db.refresh(todo)

    return todo


def get_user_todos(db: Session, user_id: int, completed: Optional[bool] = None):
    query = db.query(Todo).filter(Todo.user_id == user_id)

    if completed is not None:
        query = query.filter(Todo.completed == completed)

    return query.all()


def get_todo_by_id(db: Session, todo_id: int, user_id: int):
    return db.query(Todo).filter(
        Todo.id == todo_id,
        Todo.user_id == user_id
    ).first()


def update_todo(db: Session, todo: Todo, todo_data: TodoUpdate):
    update_data = todo_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(todo, field, value)

    db.commit()
    db.refresh(todo)

    return todo


def delete_todo(db: Session, todo: Todo):
    db.delete(todo)
    db.commit()
