# main.py
from fastapi import FastAPI, Depends, HTTPException, status
from contextlib import asynccontextmanager
from datetime import timedelta
from models import schemas
from typing import List
from database.db import get_db, init_db
from sqlalchemy.orm import Session
from service import db_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield
    pass

app = FastAPI(lifespan=lifespan)

@app.post("/api/alarm/instance")
async def add_alarm(alarm_instance: schemas.AlarmInstance, db: Session = Depends(get_db)):
    # 
    db_service.create_alarm_instance(db, alarm_instance)

    return {
        "message": "Alarm instance created successfully"
    }


@app.post("/api/alarm/schedule")
async def add_weekly_alarm(
    alarm_schedule: schemas.AlarmSchedule,
    db: Session = Depends(get_db)
):  
    # Authentifizierung
    db_service.create_alarm_schedule(db, alarm_schedule)

    return {
        "message": "Alarm schedule created successfully"
    }

@app.get("/api/alarm/instances", response_model=List[schemas.AlarmInstance])
async def get_alarm_instances(db: Session = Depends(get_db)):
    return db_service.get_alarm_instances(db)

@app.get("/api/alarm/schedules", response_model=List[schemas.AlarmSchedule])
async def get_alarm_schedules(db: Session = Depends(get_db)):
    return db_service.get_alarm_schedules(db)

@app.put("/api/alarm/schedule")
async def update_alarm_schedule(
    alarm_schedule: schemas.AlarmSchedule,
    db: Session = Depends(get_db)
):  
    return db_service.update_alarm_schedule(db, alarm_schedule)

@app.put("/api/alarm/instance")
async def update_alarm_instance(
    alarm_instance: schemas.AlarmInstance,
    db: Session = Depends(get_db)
):  
    return db_service.update_alarm_instance(db, alarm_instance)
