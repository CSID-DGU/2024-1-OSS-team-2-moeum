from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
import datetime
from pydantic import BaseModel

class User(SQLModel, table=True):
    id: str = Field(default=None, primary_key=True)
    username: Optional[str]
    password: str
    create_time: Optional[datetime.datetime] = Field(default_factory=datetime.datetime.now)

    event: Optional[List["UserEvent"]] = Relationship(back_populates="user")
    
    class Config:
        json_schema_extra = {
            "user1": {
                "id": "kwdahun",
                "username": "Kwon Dahun",
                "password": "password_value",
                "create_time": "UTC datetime value",
            }
        }

class UserSignUpData(BaseModel):
    id: str
    username: Optional[str]
    password: str

class UserDataResponse(BaseModel):
    id: str
    username: str