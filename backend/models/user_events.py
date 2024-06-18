from sqlmodel import SQLModel, Field, Relationship, DateTime, Column
import uuid
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

from models.users import User

class UserEvent(SQLModel, table=True):
    event_id: Optional[str] = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: Optional[str] = Field(foreign_key="user.id")
    starts_at: datetime = Field(nullable=False)
    ends_at: datetime = Field(nullable=False)
    name: str = Field(nullable=False)

    user: Optional[User] = Relationship(back_populates="event")

    def __init__(self, **data):
        if 'starts_at' in data and isinstance(data['starts_at'], str):
            data['starts_at'] = datetime.fromisoformat(data['starts_at'].replace("Z", "+00:00")).replace(tzinfo=None)
        if 'ends_at' in data and isinstance(data['ends_at'], str):
            data['ends_at'] = datetime.fromisoformat(data['ends_at'].replace("Z", "+00:00")).replace(tzinfo=None)
        super().__init__(**data)


class UserEventCreateData(BaseModel):
    user_id: Optional[str] = None
    starts_at: datetime
    ends_at: datetime
    name: str

    def __init__(self, **data):
        if 'starts_at' in data and isinstance(data['starts_at'], str):
            data['starts_at'] = datetime.fromisoformat(data['starts_at'].replace("Z", "+00:00")).replace(tzinfo=None)
        if 'ends_at' in data and isinstance(data['ends_at'], str):
            data['ends_at'] = datetime.fromisoformat(data['ends_at'].replace("Z", "+00:00")).replace(tzinfo=None)
        super().__init__(**data)