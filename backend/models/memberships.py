from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
import datetime
from pydantic import BaseModel

from models.users import User


class Membership(SQLModel, table=True):
    created_time: Optional[datetime.datetime] = Field(
        default_factory=datetime.datetime.now
    )
    permission: str = Field(nullable=False, max_length=20)

    user_id: str = Field(default=None, foreign_key="user.id", primary_key=True)
    group_uuid: str = Field(default=None, foreign_key="group.uuid", primary_key=True)

    user: Optional[User] = Relationship(
        sa_relationship_kwargs={
            "cascade": "delete",
        },
    )
    # group: Optional[Group] = Relationship(back_populates="group_membership")

    class Config:
        json_schema_extra = {
            # 예시 없음
        }

class MemberShipCreateData(BaseModel):
    permission: str
    user_id: Optional[str] = None
    group_uuid: str
