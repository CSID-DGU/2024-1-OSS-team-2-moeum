from fastapi import APIRouter, Depends, HTTPException, status
from typing import Union
from sqlmodel import select
from datetime import datetime

from auth.authenticate import authenticate
from database.connection import get_session
from models.teammings import Teamming
from models.user_events import UserEvent
from utils.dict_by_tag import get_dict_by_key_value_list
from utils.line_calculator import Line, get_union_segments
from utils.time_match import get_available_time
from models.group_events import GroupEvent
from models.teams import Team
from models.user_events import UserEvent

search_router = APIRouter(prefix="/search", tags=["Searching"])


@search_router.get("")
async def search_teams(
    user=Depends(authenticate), session=Depends(get_session), team_uuid: str = None
):

    if not team_uuid:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="team_uuid가 없어서 처리할 수 없습니다.",
        )

    statement = (
        select(
            Teamming.team_uuid,
            Team.name,
            Team.group_uuid,
            UserEvent.starts_at,
            UserEvent.ends_at,
        )
        .join(UserEvent, UserEvent.user_id == Teamming.user_id)
        .join(Team, Team.uuid == Teamming.team_uuid)
        .where(Teamming.user_id != user)
    )
    teammings = session.exec(statement).all()

    grouped_teammings_events = get_dict_by_key_value_list(
        teammings, lambda x: x[0], lambda y: Line(y[3], y[4])
    )
    grouped_teammings = get_dict_by_key_value_list(
        teammings, lambda x: x[0], lambda y: y[1], set
    )
    grouped_teammings_groups = get_dict_by_key_value_list(
        teammings, lambda x: x[0], lambda y: y[2], set
    )

    lines_tobe_compared = []
    # if user_id:
    #     statement = select(UserEvent.starts_at, UserEvent.ends_at).where(UserEvent.user_id == user_id)
    #     user_events = session.exec(statement).all()
    #     lines_tobe_compared = [Line(info[0], info[1]) for info in user_events]

    # elif group_uuid:
    #     statement = select(GroupEvent.starts_at, GroupEvent.ends_at).where(GroupEvent.group_uuid == group_uuid)
    #     group_events = session.exec(statement).all()
    #     lines_tobe_compared = [Line(info[0], info[1]) for info in group_events]

    statement = (
        select(UserEvent.starts_at, UserEvent.ends_at)
        .join(Teamming, UserEvent.user_id == Teamming.user_id)
        .where(Teamming.team_uuid == team_uuid)
    )
    team_events = session.exec(statement).all()
    lines_tobe_compared = [Line(info[0], info[1]) for info in team_events]

    # else:
    #     statement = select(UserEvent.starts_at, UserEvent.ends_at).where(UserEvent.user_id == user)
    #     user_events = session.exec(statement).all()
    #     lines_tobe_compared = [Line(info[0], info[1]) for info in user_events]

    for key, value in grouped_teammings_events.items():
        available_time = get_available_time(value, lines_tobe_compared)

        result = {}
        sum = 0
        result["team_name"] = grouped_teammings[key].pop()
        result["belonging_group_uuid"] = grouped_teammings_groups[key].pop()
        result["sum_second"] = 0
        result["available_time"] = []

        time_dict_list = [{"start": x.start, "end": x.end} for x in available_time]

        # for e in available_time_per_day:
        #     date = e[0].start.strftime("%y-%m-%d")
        #     for i, line in enumerate(e):
        #         sum += (line.end - line.start).seconds
        #         e[i] = {"start": line.start, "end": line.end}

        #     element = {}
        #     element["date"] = date
        #     element["list"] = e

        for e in available_time:
            sum += (e.end - e.start).seconds

        result["available_time"] = [{
            "list": time_dict_list
        }]
        result["sum_second"] = sum

        grouped_teammings_events[key] = result

    return dict(
        sorted(grouped_teammings_events.items(), key=lambda x: x[1]["sum_second"], reverse=True)
    )
