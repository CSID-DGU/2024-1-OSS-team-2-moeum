from dotenv import load_dotenv
import os
from sqlmodel import SQLModel, Session, create_engine

load_dotenv()
USERNAME = os.environ.get('MYSQL_USERNAME')
PASSWORD = os.environ.get('MYSQL_PASSWORD')
HOST = os.environ.get('MYSQL_HOST')
PORT = os.environ.get('MYSQL_PORT')
DB_NAME = os.environ.get('MYSQL_DB_NAME')

DB_URL = f'mysql+pymysql://{USERNAME}:{PASSWORD}@{HOST}:{PORT}/{DB_NAME}'


connect_args = {}
engine_url = create_engine(DB_URL, echo=True, connect_args=connect_args)

def conn():
    SQLModel.metadata.create_all(engine_url)

def get_session():
    with Session(engine_url) as session:
        yield session