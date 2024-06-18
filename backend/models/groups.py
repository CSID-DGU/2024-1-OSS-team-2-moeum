from sqlmodel import SQLModel, Field
import uuid
from typing import Optional
from pydantic import BaseModel

class Group(SQLModel, table=True):
    uuid: Optional[str] = Field(default_factory=uuid.uuid4, primary_key=True, nullable=False)
    name: str = Field(nullable=False)
    
    class Config:
        json_schema_extra = {
            "group1": {
                "uuid": "uuid 버전 4의 문자열",
                "name": "name",
            }
        }


class GroupData(BaseModel):
    name: str