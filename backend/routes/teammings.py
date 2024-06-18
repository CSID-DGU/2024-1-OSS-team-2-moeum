from fastapi import APIRouter, Depends, Body, HTTPException, status
from sqlmodel import select

from auth.authenticate import authenticate
from database.connection import get_session
from models.teammings import TeammingCreateData, Teamming
from models.groups import Group
from models.memberships import Membership
from utils.line_calculator import get_union_segments, Line
from models.user_events import UserEvent
from models.group_events import GroupEvent
from models.teams import Team

teamming_router = APIRouter(prefix="/teamming", tags=["Teamming"])


@teamming_router.post("", response_model=TeammingCreateData)
async def establish_teamming(
    user=Depends(authenticate),
    session=Depends(get_session),
    body: TeammingCreateData = Body(...),
) -> TeammingCreateData:
    if not body.user_id:
        body.user_id = user

    statement = (
        select(Teamming)
        .where(Teamming.user_id == body.user_id)
        .where(Teamming.team_uuid == body.team_uuid)
    )
    existing_user = session.exec(statement).all()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="이미 유저가 팀에 속해 있습니다.",
        )
    
    statement = (
        select(Membership.group_uuid)
        .where(Membership.user_id == body.user_id)
    )
    user_group = session.exec(statement).first()

    statement = (
        select(Team.group_uuid)
        .where(Team.uuid == body.team_uuid)
    )
    user_team_group = session.exec(statement).first()

    print(user_group, user_team_group)
    if (user_group != user_team_group):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="유저가 속해 있는 그룹이랑 팀이 속해 있는 그룹이 다릅니다."
        )

    db_tuple = Teamming(**body.model_dump())
    session.add(db_tuple)

    statement = (
        select(Group.uuid, Team.name)
        .join(Team, Group.uuid == Team.group_uuid)
        .where(Team.uuid == db_tuple.team_uuid)
    )
    belonging_group, team_name = session.exec(statement).first()

    statement = (
        select(UserEvent)
        .join(Teamming, UserEvent.user_id == Teamming.user_id)
        .join(Team, Team.uuid == Teamming.team_uuid)
        .where(Team.uuid == db_tuple.team_uuid)
    )
    events = session.exec(statement).all()
    if events:
        events_as_lines = [Line(start=e.starts_at, end=e.ends_at) for e in events]
        union_lines = get_union_segments(events_as_lines, True)
        events = [
            GroupEvent(
                group_uuid=belonging_group,
                starts_at=l.start,
                ends_at=l.end,
                team_uuid=db_tuple.team_uuid,
                name=(team_name + "의 일정"),
            )
            for l in union_lines
        ]

        statement = (
            select(GroupEvent)
            .where(GroupEvent.team_uuid == db_tuple.team_uuid)
        )
        existing_events = session.exec(statement).all()
        for e in existing_events:
            session.delete(e)

        for e in events:
            session.add(e)

    session.commit()
    session.refresh(db_tuple)
    for e in events:
        session.refresh(e)

    return body
