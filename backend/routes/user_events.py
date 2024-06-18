from fastapi import APIRouter, Depends, Body, HTTPException, status
from typing import List, Union
from sqlmodel import select

from database.connection import get_session
from auth.authenticate import authenticate
from models.user_events import UserEvent, UserEventCreateData
from models.groups import Group
from models.teams import Team
from utils.line_calculator import get_union_segments, Line
from models.group_events import GroupEvent
from models.teammings import Teamming
from utils.dict_by_tag import get_dict_by_key_value_list


user_events_router = APIRouter(prefix="/user/calendar", tags=["UserCalendar"])


@user_events_router.post("", response_model=UserEvent)
async def add_new_event(
    session=Depends(get_session),
    user=Depends(authenticate),
    user_event: UserEventCreateData = Body(...),
) -> UserEvent:

    if not user_event.user_id:
        user_event.user_id = user
    elif user != user_event.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="캘린더 이벤트를 등록하는 유저가 본인이 아닙니다.",
        )

    user_event = UserEvent(**user_event.model_dump())
    session.add(user_event)

    ##### 그룹 일정 수정하는 부분 #####

    # 유저가 속하는 모든 팀 불러오기
    statement = (
        select(Team.uuid, Team.group_uuid, Team.name)
        .join(Teamming, Team.uuid == Teamming.team_uuid)
        .where(Teamming.user_id == user_event.user_id)
    )
    result = session.exec(statement).all()
    user_event_as_line = Line(start=user_event.starts_at, end=user_event.ends_at)

    for team_uuid, group_uuid, team_name in result:
        statement = select(GroupEvent).where(GroupEvent.team_uuid == team_uuid)
        existing_group_team_events = session.exec(statement).all()
        existing_group_team_events_as_lines = [
            Line(start=e.starts_at, end=e.ends_at) for e in existing_group_team_events
        ]
        new_group_team_events_as_lines = get_union_segments(
            [*existing_group_team_events_as_lines, user_event_as_line],
            require_sorting=True,
        )
        new_group_team_events = [
            GroupEvent(
                group_uuid=group_uuid,
                starts_at=l.start,
                ends_at=l.end,
                team_uuid=team_uuid,
                name=(team_name + "의 일정"),
            )
            for l in new_group_team_events_as_lines
        ]

        for e in existing_group_team_events:
            session.delete(e)
        for e in new_group_team_events:
            session.add(e)

    session.commit()
    session.refresh(user_event)

    return user_event


@user_events_router.get("")
async def retrieve_user_events(
    user=Depends(authenticate),
    session=Depends(get_session),
    user_id: Union[None, str] = None,
) -> List[UserEvent]:
    if user_id:
        statement = select(UserEvent).where(UserEvent.user_id == user_id)
    else:
        statement = select(UserEvent).where(UserEvent.user_id == user)
    statement = statement.order_by(UserEvent.starts_at)

    events = session.exec(statement).all()
    # for event in events:
    #     print(event.starts_at.day)
    return events
