from sqlmodel import SQLModel, Field
from uuid import uuid4
from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class TeamRequest(SQLModel, table=True):
    team_request_uuid: Optional[str] = Field(default_factory=uuid4, primary_key=True, nullable=False)
    requested_user_id: str = Field(nullable=False, foreign_key="user.id")
    team_name: str = Field(nullable=False)
    belonging_group_uuid: str = Field(nullable=False, foreign_key="group.uuid")
    created_at: Optional[datetime] = Field(default_factory=datetime.now)

class TeamRequstForm(BaseModel):
    requested_user_id: Optional[str] = None
    belonging_group_uuid: str
    team_name: str

class TeamRequestProcessForm(BaseModel):
    team_request_uuid: str