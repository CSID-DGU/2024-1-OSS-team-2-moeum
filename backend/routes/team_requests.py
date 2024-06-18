from fastapi import APIRouter, Depends, Body, HTTPException, status
from sqlmodel import select
from typing import List

from database.connection import get_session
from auth.authenticate import authenticate
from models.team_requests import TeamRequstForm, TeamRequest, TeamRequestProcessForm
from models.users import User
from models.memberships import Membership

team_request_router = APIRouter(prefix="/teamrequest", tags=["Team Request"])



@team_request_router.post('')
async def team_request(session = Depends(get_session),
                             user = Depends(authenticate),
                             team_request: TeamRequstForm = Body(...)):
    
    if not team_request.requested_user_id:
        team_request.requested_user_id = user

    statement = select(Membership.group_uuid).where(Membership.user_id == team_request.requested_user_id)
    user_belonging_groups = session.exec(statement).all()

    if not team_request.belonging_group_uuid in user_belonging_groups:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User does not belongs to given group (group_uuid)."
        )

    team_request = TeamRequest(**team_request.model_dump())
    
    session.add(team_request)
    session.commit()
    session.refresh(team_request)

    return team_request



@team_request_router.get('', response_model=List[TeamRequest])
async def retrieve_team_requests(session = Depends(get_session),
                                 user = Depends(authenticate)) -> List[TeamRequest]:
    
    statement = select(TeamRequest).join(Membership, TeamRequest.belonging_group_uuid == Membership.group_uuid).where(Membership.user_id == user).where(Membership.permission == 'admin')
    result = session.exec(statement)
    result = result.all()

    return result



@team_request_router.post('/accept')
async def accept_team_request(session = Depends(get_session),
                              team_request_process: TeamRequestProcessForm = Body(...)):
    
    statement = select(TeamRequest).where(TeamRequest.team_request_uuid == team_request_process.team_request_uuid)
    result = session.exec(statement)
    team_request = result.first()

    if not team_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team Request not found."
        )
    
    session.delete(team_request)
    session.commit()

    return {
        "msg": "success",
        "detail": "팀 요청을 수락하고 삭제했습니다."
    }
