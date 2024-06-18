from sqlmodel import SQLModel, Field
import uuid
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class GroupEvent(SQLModel, table=True):
    event_id: Optional[str] = Field(default_factory=uuid.uuid4, primary_key=True)
    group_uuid: Optional[str] = Field(foreign_key="group.uuid")
    team_uuid: Optional[str] = Field(foreign_key="team.uuid")
    starts_at: datetime = Field(nullable=False)
    ends_at: datetime = Field(nullable=False)
    name: str = Field(nullable=False)

    def __init__(self, **data):
        if 'starts_at' in data and isinstance(data['starts_at'], str):
            data['starts_at'] = datetime.fromisoformat(data['starts_at'].replace("Z", "+00:00")).replace(tzinfo=None)
        if 'ends_at' in data and isinstance(data['ends_at'], str):
            data['ends_at'] = datetime.fromisoformat(data['ends_at'].replace("Z", "+00:00")).replace(tzinfo=None)
        super().__init__(**data)

class GroupEventCreateData(BaseModel):
    group_uuid: str
    starts_at: datetime
    ends_at: datetime
    name: str