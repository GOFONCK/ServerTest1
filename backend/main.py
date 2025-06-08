from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from sqlalchemy.orm import Session
import uvicorn
from datetime import date

from database import SessionLocal, init_db, ServerDB  # твой файл с настройками БД и моделью SQLAlchemy
import bot  # если у тебя есть telegram-бот, подключи сюда

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # при необходимости ограничь домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic-модель для запроса создания/обновления сервера
class ServerCreate(BaseModel):
    name: str
    url: HttpUrl
    rent_until: date

# Pydantic-модель для ответа (включает id и is_active)
class Server(BaseModel):
    id: int
    name: str
    url: HttpUrl
    rent_until: date
    is_active: bool

    class Config:
        orm_mode = True  # чтобы Pydantic умел читать из ORM-объекта

@app.get("/servers/", response_model=list[Server])
def list_servers(db: Session = Depends(get_db)):
    servers = db.query(ServerDB).all()
    return servers

@app.post("/servers/", response_model=Server)
def add_server(server: ServerCreate, db: Session = Depends(get_db)):
    new_server = ServerDB(
        name=server.name,
        url=str(server.url),  # преобразуем HttpUrl в строку
        rent_until=server.rent_until,
        is_active=True,
    )
    db.add(new_server)
    db.commit()
    db.refresh(new_server)
    return new_server

@app.put("/servers/{server_id}", response_model=Server)
def update_server(server_id: int, server: ServerCreate, db: Session = Depends(get_db)):
    existing = db.query(ServerDB).filter(ServerDB.id == server_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Server not found")
    existing.name = server.name
    existing.url = str(server.url)
    existing.rent_until = server.rent_until
    db.commit()
    db.refresh(existing)
    return existing

@app.delete("/servers/{server_id}")
def delete_server(server_id: int, db: Session = Depends(get_db)):
    existing = db.query(ServerDB).filter(ServerDB.id == server_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Server not found")
    db.delete(existing)
    db.commit()
    return {"ok": True}
@app.on_event("startup")
def on_startup():
    bot.start_bot()
    print("Мониторинг серверов запущен")

if __name__ == "__main__":
    uvicorn.run("main:app", port=8000, reload=True)
