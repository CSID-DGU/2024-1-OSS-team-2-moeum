from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlmodel import select
from typing import Union

from database.connection import get_session
from auth.authenticate import authenticate
from models.group_events import GroupEvent, GroupEventCreateData
from models.memberships import Membership
from models.groups import Group

group_events_router = APIRouter(prefix="/group/calendar", tags=["GroupCalendar"])

@group_events_router.get("")
async def retrieve_group_events(session=Depends(get_session),
                                user=Depends(authenticate),
                                group_uuid: Union[None, str] = None):
    if not group_uuid:
        statement = select(GroupEvent).select_from(Membership).join(GroupEvent, Membership.user_id == user)
    else:
        statement = select(GroupEvent).where(GroupEvent.group_uuid == group_uuid)
    
    result = session.exec(statement).all()

    return result

@group_events_router.post("", response_model=GroupEvent)
async def create_group_event(event: GroupEventCreateData = Body(...),
                             session=Depends(get_session),
                             user=Depends(authenticate)) -> GroupEvent:
    if not event.group_uuid:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="group_uuid가 있어야 합니다."
        )
    
    statement = select(Group).where(Group.uuid == event.group_uuid)
    existing_group = session.exec(statement).first()
    if not existing_group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="존재하지 않는 그룹의 uuid입니다."
        )

    event = GroupEvent(**event.model_dump())
    session.add(event)
    session.commit()
    session.refresh(event)

    return event


