from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from pydantic import BaseModel

class Teamming(SQLModel, table=True):
    user_id: str = Field(foreign_key="user.id", primary_key=True)
    team_uuid: Optional[str] = Field(foreign_key="team.uuid", primary_key=True)
    role: str = Field(nullable=False, default="teammate")

    team: Optional["Team"] = Relationship(back_populates="teamming")

class TeammingCreateData(BaseModel):
    user_id: Optional[str] = None
    team_uuid: str
    role: str