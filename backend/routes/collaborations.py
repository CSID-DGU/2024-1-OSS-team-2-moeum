from fastapi import APIRouter, Depends, Body, HTTPException, status
from sqlmodel import select, or_
from sqlalchemy.orm import aliased
from typing import List

from models.collaborations import Collaboration, CollaborationAcceptRequest
from auth.authenticate import authenticate
from database.connection import get_session
from models.teammings import Teamming
from models.teams import Team
from models.groups import Group

collaboration_router = APIRouter(prefix="/collaboration", tags=["Collaboration"])


@collaboration_router.get("")
async def retrieve_available_collaboration(
    session=Depends(get_session), user_id: str = None
):

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="user_id가 없습니다."
        )

    Team1 = aliased(Team)
    Team2 = aliased(Team)

    statement = (
        select(Collaboration, Team1.group_uuid, Team2.group_uuid)
        .join(Team1, Collaboration.request_team_uuid == Team1.uuid)
        .join(Team2, Collaboration.response_team_uuid == Team2.uuid)
        .join(Teamming, Teamming.team_uuid == Team2.uuid)
        .where(Teamming.user_id == user_id)
    )

    available_collaborations = session.exec(statement).all()

    new_tuple = [
        {**c.model_dump(), "group_uuid_1": u1, "group_uuid_2": u2}
        for (c, u1, u2) in available_collaborations
    ]

    return new_tuple


@collaboration_router.post("", response_model=Collaboration)
async def insert_new_collaboration(
    session=Depends(get_session), collaboration: Collaboration = Body(...)
) -> Collaboration:

    statement = (
        select(Collaboration)
        .where(Collaboration.request_team_uuid == collaboration.request_team_uuid)
        .where(Collaboration.response_team_uuid == collaboration.response_team_uuid)
    )
    existing_collab = session.exec(statement).all()

    if existing_collab:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="이미 협업 요청되었습니다."
        )

    session.add(collaboration)
    session.commit()
    session.refresh(collaboration)

    return collaboration


@collaboration_router.post("/accept")
async def accept_collaboration(
    session=Depends(get_session),
    collaboration_request: CollaborationAcceptRequest = Body(...),
):
    statement = select(Collaboration).where(
        Collaboration.request_team_uuid == collaboration_request.request_team_uuid,
        Collaboration.response_team_uuid == collaboration_request.response_team_uuid,
    )

    collaboration = session.exec(statement).first()
    collaboration.accepted = collaboration_request.accepted

    session.commit()
    session.refresh(collaboration)

    return collaboration
