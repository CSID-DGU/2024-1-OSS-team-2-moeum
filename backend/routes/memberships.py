from fastapi import APIRouter, Depends, Body, HTTPException, status
from typing import List
from sqlmodel import select

from database.connection import get_session
from auth.authenticate import authenticate
from models.memberships import Membership, MemberShipCreateData

membership_router = APIRouter(prefix='/membership', tags=["Membership"])



@membership_router.post('', response_model=Membership)
async def establish_membership(session=Depends(get_session),
                               user=Depends(authenticate),
                               membership: MemberShipCreateData = Body(...)) -> Membership:
    
    if not membership.user_id:
        membership.user_id = user
    membership = Membership(**membership.model_dump())
    
    # statement = select(Membership).where(Membership.user_id == membership.user_id)\
    #     .where(Membership.group_uuid == membership.group_uuid)
    
    statement = select(Membership).where(Membership.user_id == membership.user_id)
    
    existing_membership = session.exec(statement).all()

    if not existing_membership:
        session.add(membership)
        session.commit()
        session.refresh(membership)
        return membership
    
    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="해당 멤버는 그룹에 이미 소속되어 있습니다."
    )