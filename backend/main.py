from fastapi import FastAPI
import uvicorn
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import os
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from fastapi.middleware.cors import CORSMiddleware

from routes.users import user_router
from routes.groups import group_router
from routes.memberships import membership_router
from routes.user_events import user_events_router
from routes.group_events import group_events_router
from routes.teams import team_router
from routes.teammings import teamming_router
from routes.search import search_router
from routes.music_transcriptions import music_transcription_router
from routes.team_requests import team_request_router
from routes.collaborations import collaboration_router
from database.connection import conn

load_dotenv()
HOST = os.environ.get('HOST')

class CSPMiddleWare(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers['Content-Security-Policy'] = (
            "default-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            f"connect-src 'self' http://{HOST}:8000"
        )
        return response

@asynccontextmanager
async def lifespan(app: FastAPI):
    # on start up
    conn()
    yield
    # on exit

app = FastAPI(root_path='/api', lifespan=lifespan)
# app.add_middleware(CSPMiddleWare)

origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(user_router)
app.include_router(group_router)
app.include_router(membership_router)
app.include_router(user_events_router)
app.include_router(group_events_router)
app.include_router(team_router)
app.include_router(teamming_router)
app.include_router(search_router)
app.include_router(music_transcription_router)
app.include_router(team_request_router)
app.include_router(collaboration_router)



# @app.on_event('startup')
# def on_startup():
#     conn()

if __name__ == '__main__':
    uvicorn.run("main:app", host=HOST, port=8000, reload=True)