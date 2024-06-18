from fastapi import APIRouter, Depends, Body, HTTPException, status
from typing import List, Union
from sqlmodel import select

from database.connection import get_session
from auth.authenticate import authenticate
from models.groups import Group, GroupData
from models.memberships import Membership
from models.users import User, UserDataResponse

group_router = APIRouter(prefix='/group', tags=["Group"])

@group_router.get("/all", response_model=List[Group])
async def retrive_all_groups(session=Depends(get_session)) -> List[Group]:
    statement = select(Group)
    groups = session.exec(statement).all()
    return groups

@group_router.get("", response_model=List[Group])
async def retrieve_group_data(session=Depends(get_session), 
                              group_uuid: Union[None, str] = None,
                              user=Depends(authenticate)) -> List[Group]:
    if not group_uuid:
        statement = select(Group).join(Membership).where(Membership.user_id == user)
    else:
        statement = select(Group).where(Group.uuid == group_uuid)
    
    result = session.exec(statement)
    result = result.all()
    return result

@group_router.get("/member", response_model=List[UserDataResponse])
async def retrieve_group_members(session=Depends(get_session),
                                 group_uuid: str = None) -> List[UserDataResponse]:
    if not group_uuid:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="group_uuid가 필요합니다."
        )
    
    statement = select(User).join(Membership, User.id == Membership.user_id).where(Membership.group_uuid == group_uuid)

    result = session.exec(statement)
    result = result.all()
    return result

@group_router.post("", response_model=Group)
async def add_group(session=Depends(get_session),
                    group: Group = Body(...)) -> Group:
    statement = select(Group).where(Group.uuid == group.uuid)
    existing_groups = session.exec(statement).all()

    if not existing_groups:
        group.uuid = None
        
        session.add(group)
        session.commit()
        session.refresh(group)
        return group
    
    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="이미 동일한 uuid의 group이 존재합니다."
    )

# @group_router.post("/promote")
# async def register_new_promotion():
