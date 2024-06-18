from sqlmodel import SQLModel, Field
from typing import Union
import uuid

class MusicTranscription(SQLModel, table=True):
    uuid: Union[None, str] = Field(default_factory=uuid.uuid4, primary_key=True, nullable=False)
    user_id: str = Field(foreign_key="user.id", nullable=False)
    music_file_path: str = Field(nullable=True)
    sheet_file_path: Union[str, None] = Field(nullable=True)
