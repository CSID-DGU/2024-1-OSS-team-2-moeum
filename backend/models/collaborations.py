from sqlmodel import SQLModel, Field
from pydantic import BaseModel

class Collaboration(SQLModel, table=True):
    request_team_uuid: str = Field(foreign_key="team.uuid", primary_key=True)
    response_team_uuid: str = Field(foreign_key="team.uuid", primary_key=True)
    name: str = Field(nullable=False)
    accepted: bool = Field(default=False)


class CollaborationAcceptRequest(BaseModel):
    request_team_uuid: str
    response_team_uuid: str
    accepted: bool