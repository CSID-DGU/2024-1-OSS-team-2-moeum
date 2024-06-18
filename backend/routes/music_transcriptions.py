from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, status, BackgroundTasks
from sqlmodel import select
from fastapi.responses import FileResponse
from tempfile import NamedTemporaryFile
from typing import List
import os, uuid, time
from transcribe import transcribe_file
from pydub import AudioSegment
import torch

from auth.authenticate import authenticate
from database.connection import get_session
from models.music_transcriptions import MusicTranscription

music_transcription_router = APIRouter(prefix="/sheet", tags=["Music Transcription"])

MUSIC_FILE_UPLOAD_DIR = './file/music_file'
MUSIC_SHEET_DOWNLOAD_DIR = './file/music_sheet'


async def save_file(file, save_path: str, file_extension: str):
    content = await file.read()
    filename = f"{str(uuid.uuid4())}.{file_extension}"
    with open(os.path.join(save_path, filename), "wb") as fp:
        fp.write(content)

    return filename

def process_file(filename):
    session = next(get_session())

    file_path = os.path.join(MUSIC_FILE_UPLOAD_DIR, filename)
    output_file = file_path.replace(".wav", ".flac")
    print(output_file)

    # Load the input file
    sound = AudioSegment.from_wav(file_path)
    # Set to mono and change the frame rate
    sound = sound.set_channels(1).set_frame_rate(16000)
    # Export the sound as FLAC
    sound.export(output_file, format="flac")

    transcribe_file("./runs/model/model-100000.pt",[output_file], MUSIC_SHEET_DOWNLOAD_DIR,None, 0.5,0.5,'cuda' if torch.cuda.is_available() else 'cpu')

    print("process complete")

    # 여기에 MUSIC_SHEET_DOWNLOAD_DIR 안에 파일 넣는 로직 추가해야 함

    statement = select(MusicTranscription).where(MusicTranscription.music_file_path == filename)
    music_transcription = session.exec(statement).first()
    music_transcription.sheet_file_path = filename.replace(".wav", ".flac.pred.mid")
    session.add(music_transcription)
    session.commit()
    session.refresh(music_transcription)
    




@music_transcription_router.get("", response_model=List[MusicTranscription])
async def retrieve_music_transcriptions(user = Depends(authenticate),
                                        session = Depends(get_session)) -> MusicTranscription:
    statement = select(MusicTranscription).where(MusicTranscription.user_id == user)
    result = session.exec(statement).all()
    return result


@music_transcription_router.post("/upload")
async def upload_music_file(file: UploadFile = File(...),
                            user = Depends(authenticate),
                            session = Depends(get_session),
                            background_tasks: BackgroundTasks = None):
    
    filename = await save_file(file, MUSIC_FILE_UPLOAD_DIR, file.filename.split(".")[1])
    music_transcription = MusicTranscription(music_file_path=filename, user_id=user)
    session.add(music_transcription)
    session.commit()
    session.refresh(music_transcription)
    
    background_tasks.add_task(process_file, filename)

    return music_transcription

@music_transcription_router.get("/download")
async def download_sheet_file(user = Depends(authenticate),
                              session = Depends(get_session),
                              transcription_uuid: str = None):
    if not transcription_uuid:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="transcription_uuid가 없습니다."
        )
    
    statement = select(MusicTranscription.sheet_file_path).where(MusicTranscription.uuid == transcription_uuid).where(MusicTranscription.user_id == user)
    sheet_file_name = session.exec(statement).first()
    print(sheet_file_name)

    if not sheet_file_name:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="찾을 수 없습니다."
        )
    
    sheet_file_path = os.path.join(MUSIC_SHEET_DOWNLOAD_DIR, sheet_file_name)

    return FileResponse(sheet_file_path, filename=sheet_file_name, media_type="application/x-msmediaview")
    



