from fastapi import APIRouter, Depends, Body
from typing import List, Union
from sqlmodel import select

from database.connection import get_session
from auth.authenticate import authenticate
from models.teams import Team, TeamCreateData
from models.teammings import Teamming

team_router = APIRouter(prefix='/team', tags=["Team"])

@team_router.post('', response_model=Team)
async def create_team(team: TeamCreateData = Body(...), 
                      session=Depends(get_session)) -> Team:
    team = Team(**team.model_dump())

    session.add(team)
    session.commit()
    session.refresh(team)

    return team

@team_router.get('', response_model=List[Team])
async def retrieve_teams(session=Depends(get_session),
                         user_id: Union[str, None] = None
                         ) -> List[Team]:
    
    if not user_id:
        statement = select(Team)
    else:
        statement = select(Team).join(Teamming, Teamming.team_uuid == Team.uuid).where(Teamming.user_id == user_id)

    teams = session.exec(statement).all()
    
    return teams

