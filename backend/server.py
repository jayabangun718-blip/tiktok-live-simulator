from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import socketio
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

CONTROL_PIN = os.environ.get('CONTROL_PIN', '1234')
ROOM_ID = 'live'

# FastAPI app (kept as fastapi_app; the exported `app` is the Socket.IO wrapper)
fastapi_app = FastAPI()
api_router = APIRouter(prefix="/api")

# Socket.IO server
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ---------------- Models ----------------
class Host(BaseModel):
    name: str = "JB_Rogers"
    message: str = "F0Lo yg duluan naik"
    photoUri: Optional[str] = None
    hearts: str = "260.9K"


class Guest(BaseModel):
    id: str
    name: str
    viewers: int = 0
    photoUri: Optional[str] = None
    bgPhotoUri: Optional[str] = None
    muted: bool = True


class RoomState(BaseModel):
    host: Host = Field(default_factory=Host)
    guests: List[Guest]
    lionSeq: int = 0
    lionTargetIdx: int = 0


class PinBody(BaseModel):
    pin: str


class GuestPatch(BaseModel):
    name: Optional[str] = None
    viewers: Optional[int] = None
    photoUri: Optional[str] = None
    bgPhotoUri: Optional[str] = None
    muted: Optional[bool] = None


class HostPatch(BaseModel):
    name: Optional[str] = None
    message: Optional[str] = None
    photoUri: Optional[str] = None
    hearts: Optional[str] = None


class LionBody(BaseModel):
    targetIdx: int


DEFAULT_GUESTS = [
    {"id": "g1", "name": "Danton_", "viewers": 0, "photoUri": None, "bgPhotoUri": None, "muted": True},
    {"id": "g2", "name": "RAGA_", "viewers": 0, "photoUri": None, "bgPhotoUri": None, "muted": True},
    {"id": "g3", "name": "ALL", "viewers": 0, "photoUri": None, "bgPhotoUri": None, "muted": True},
    {"id": "g4", "name": "Hunaepi", "viewers": 0, "photoUri": None, "bgPhotoUri": None, "muted": True},
    {"id": "g5", "name": "JBS CHA_", "viewers": 0, "photoUri": None, "bgPhotoUri": None, "muted": True},
    {"id": "g6", "name": "IsRa Rog_", "viewers": 0, "photoUri": None, "bgPhotoUri": None, "muted": True},
    {"id": "g7", "name": "johan_kw1", "viewers": 0, "photoUri": None, "bgPhotoUri": None, "muted": True},
]


def default_state() -> dict:
    return RoomState(guests=[Guest(**g) for g in DEFAULT_GUESTS]).model_dump()


async def get_room() -> dict:
    doc = await db.rooms.find_one({"_id": ROOM_ID})
    if not doc:
        state = default_state()
        await db.rooms.insert_one({"_id": ROOM_ID, **state})
        return state
    doc.pop("_id", None)
    return doc


async def save_room(state: dict) -> None:
    await db.rooms.replace_one({"_id": ROOM_ID}, {"_id": ROOM_ID, **state}, upsert=True)


async def broadcast_state() -> dict:
    state = await get_room()
    await sio.emit('room_state', state, room=ROOM_ID)
    return state


# ---------------- REST ----------------
@api_router.get("/")
async def root():
    return {"message": "Live Room API"}


@api_router.get("/room")
async def read_room():
    return await get_room()


@api_router.post("/control/auth")
async def control_auth(body: PinBody):
    return {"ok": body.pin == CONTROL_PIN}


@api_router.put("/room")
async def replace_room(state: RoomState):
    await save_room(state.model_dump())
    return await broadcast_state()


@api_router.patch("/room/host")
async def patch_host(patch: HostPatch):
    state = await get_room()
    for k, v in patch.model_dump(exclude_unset=True).items():
        state["host"][k] = v
    await save_room(state)
    return await broadcast_state()


@api_router.patch("/room/guest/{guest_id}")
async def patch_guest(guest_id: str, patch: GuestPatch):
    state = await get_room()
    for g in state["guests"]:
        if g["id"] == guest_id:
            for k, v in patch.model_dump(exclude_unset=True).items():
                g[k] = v
    await save_room(state)
    return await broadcast_state()


@api_router.post("/room/lion")
async def trigger_lion(body: LionBody):
    state = await get_room()
    idx = body.targetIdx
    if 0 <= idx < len(state["guests"]):
        cur = int(state["guests"][idx].get("viewers", 0) or 0)
        state["guests"][idx]["viewers"] = cur + 29999
    state["lionTargetIdx"] = idx
    state["lionSeq"] = int(state.get("lionSeq", 0) or 0) + 1
    await save_room(state)
    return await broadcast_state()


@api_router.post("/room/reset")
async def reset_room():
    state = default_state()
    await save_room(state)
    return await broadcast_state()


# ---------------- Socket.IO ----------------
@sio.event
async def connect(sid, environ):
    await sio.enter_room(sid, ROOM_ID)
    state = await get_room()
    await sio.emit('room_state', state, to=sid)
    logger.info(f"Client connected: {sid}")


@sio.event
async def disconnect(sid):
    logger.info(f"Client disconnected: {sid}")


# ---------------- Wire up ----------------
fastapi_app.include_router(api_router)

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@fastapi_app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


# Exported ASGI app = Socket.IO wrapping FastAPI
app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app, socketio_path='/api/socket.io')
