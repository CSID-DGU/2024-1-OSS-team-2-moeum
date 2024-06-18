from fastapi import APIRouter, Depends, Body, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import List, Union
from sqlmodel import select

from models.users import User, UserDataResponse, UserSignUpData
from database.connection import get_session
from auth.hash_password import HashPassword
from auth.jwt_handler import create_access_token
from auth.authenticate import authenticate

hash_password = HashPassword()

user_router = APIRouter(prefix="/user", tags=["User"])

@user_router.post("/signup")
async def add_user(session=Depends(get_session),
                   user: UserSignUpData = Body(...)) -> dict:
    
    statement = select(User).where(User.id == user.id)
    existing_user = session.exec(statement).first()

    if not existing_user:
        hashed_password = hash_password.create_hash(user.password)
        user.password = hashed_password

        user = User(**user.model_dump())

        session.add(user)
        session.commit()
        session.refresh(user)
        return {
            "msg": "success"
        }
    
    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="이미 동일한 이름의 사용자가 있습니다."
    )

@user_router.post("/signin")
async def sign_in(user: OAuth2PasswordRequestForm = Depends(), session = Depends(get_session)) -> dict:
    statement = select(User).where(User.id == user.username)
    existing_user = session.exec(statement).first()

    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="id에 해당하는 사용자 정보가 없습니다."
        )

    if hash_password.verify_hash(user.password, existing_user.password):
        access_token = create_access_token(existing_user.id)
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": existing_user.id
        }
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials passed. (정보가 일치하지 않습니다.)"
    )

@user_router.get("", response_model=UserDataResponse)
async def retrieve_user_data(user = Depends(authenticate),
                             session = Depends(get_session),
                             user_id: Union[None, str] = None) -> UserDataResponse:

    if user_id:
        statement = select(User).where(User.id == user_id)
    else:
        statement = select(User).where(User.id == user)
        
    existing_user = session.exec(statement).first()

    if existing_user:
        return existing_user
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="id에 해당하는 사용자 정보가 없습니다."
    )