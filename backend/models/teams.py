from sqlmodel import SQLModel, Field, Relationship
from uuid import uuid4
from typing import Optional
from pydantic import BaseModel

from models.teammings import Teamming

class Team(SQLModel, table=True):
    uuid: Optional[str] = Field(default_factory=uuid4, primary_key=True)
    group_uuid: str = Field(foreign_key="group.uuid")
    name: str = Field(nullable=False)

    teamming: Optional[Teamming] = Relationship(back_populates="team")

class TeamCreateData(BaseModel):
    group_uuid: str
    name: str