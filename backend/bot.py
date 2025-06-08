import requests
import time
import threading
from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.orm import sessionmaker, declarative_base

TOKEN = '7946373810:AAE5aXCQ7PHA69D6hI5Pg7TY81yR5yhtbMY'
GROUP_ID = -4962220917  # ID твоего телеграм-чата

DATABASE_URL = "sqlite:///./servers.db"

Base = declarative_base()

class ServerModel(Base):
    __tablename__ = "servers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    url = Column(String, nullable=False)
    rent_until = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def send_message(text):
    url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
    payload = {"chat_id": GROUP_ID, "text": text}
    try:
        requests.post(url, data=payload)
    except Exception as e:
        print("Ошибка при отправке сообщения в Telegram:", e)

def check_servers():
    last_status = {}
    while True:
        session = SessionLocal()
        servers = session.query(ServerModel).all()
        for s in servers:
            try:
                r = requests.get(s.url, timeout=5)
                active = r.status_code == 200
            except:
                active = False

            if s.is_active != active:
                s.is_active = active
                session.add(s)
                session.commit()

            if s.id not in last_status or last_status[s.id] != active:
                last_status[s.id] = active
                status_text = "🟢 Активен" if active else "🔴 Неактивен"
                send_message(f"{s.name} ({s.url}) теперь {status_text}\nАренда до: {s.rent_until}")

        session.close()
        time.sleep(20)

def periodic_report():
    while True:
        session = SessionLocal()
        servers = session.query(ServerModel).all()
        text = "📊 Отчет по серверам:\n"
        for s in servers:
            status_text = "🟢 Активен" if s.is_active else "🔴 Неактивен"
            text += f"{s.name} — {s.url} — {status_text} — аренда до {s.rent_until}\n"
        send_message(text)
        session.close()
        time.sleep(43200)  # 12 часов

def start_bot():
    t1 = threading.Thread(target=check_servers, daemon=True)
    t2 = threading.Thread(target=periodic_report, daemon=True)
    t1.start()
    t2.start()
