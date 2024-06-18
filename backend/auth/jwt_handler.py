import time
import os
from datetime import datetime

from fastapi import HTTPException, status
from jose import jwt, JWTError
from dotenv import load_dotenv

load_dotenv()
JWT_SECRET = os.environ.get("JWT_SECRET_KEY")

def create_access_token(user: str):
    payload = {
        "user": user,
        "expires": time.time() + 3600
    }

    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
    return token


def verify_access_token(token: str):
    try:
        data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        expire = data.get("expires")

        if expire is None:
            raise HTTPException(
                status_code = status.HTTP_400_BAD_REQUEST,
                detail="No access token supplied. (access_token이 필요합니다.)"
            )
        
        if datetime.now() > datetime.fromtimestamp(expire):
            raise HTTPException(
                status_code = status.HTTP_403_FORBIDDEN,
                detail="Token expired. (토큰이 만료되었습니다.)"
            )
        
        return data
    
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid token. (토큰이 올바르지 않습니다.)"
        )