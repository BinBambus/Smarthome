from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status
from jwt.exceptions import InvalidTokenError
from passlib.context import CryptContext
import hashlib
import jwt
import os

from sqlalchemy.orm import Session
from database import crud
from models import schemas


"""         /create_alarm_instance           """
def create_alarm_instance(db: Session, alarm_instance: schemas.AlarmInstance):
    db_alarm = crud.check_alarm_instance_conflict(db, alarm_instance)
    if db_alarm is True:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Alarm instance conflict with existing instance"
        )

    try:
        return crud.create_alarm_instance(db, alarm_instance)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create alarm instance"
        )

"""         /create_alarm_schedule           """
def create_alarm_schedule(db: Session, alarm_schedule: schemas.AlarmSchedule):
    db_schedule = crud.check_alarm_schedule_conflict(db, alarm_schedule)
    if db_schedule is True:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Conflict detected"
        )

    try:
        return crud.create_alarm_schedule(db, alarm_schedule)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create alarm schedule"
        )

"""         /api/alarm/instances           """
def get_alarm_instances(db: Session):
    try:
        return crud.get_alarm_instances(db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to retrieve alarm instances"
        )

"""         /api/alarm/schedules        """
def get_alarm_schedules(db: Session):
    try:
        return crud.get_alarm_schedules(db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to retrieve alarm schedules"
        )

"""         /api/led/status        """
def get_led_status(db: Session):
    try:
        return crud.get_led_status(db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to retrieve led status"
        )

"""         /api/alarm/schedule           """
def insert_or_update_led_status(db: Session, led_status: schemas.LedStatus):
    try:
        db_schedule = crud.updateOrInsert_led_status(db, led_status)
        if db_schedule is None:
            raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Conflict detected"
        )
        return db_schedule
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update alarm schedule"
        )

"""         /api/alarm/schedule           """
def update_alarm_schedule(db: Session, alarm_schedule: schemas.AlarmSchedule):
    try:
        db_schedule = crud.update_alarm_schedule(db, alarm_schedule)
        if db_schedule is None:
            raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Conflict detected"
        )
        return db_schedule
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update alarm schedule"
        )

"""         /api/alarm/instance           """
def update_alarm_instance(db: Session, alarm_instance: schemas.AlarmInstance):
    try:
        db_instance = crud.update_alarm_instance(db, alarm_instance)
        if db_instance is None:
            raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Conflict detected"
        )
        return db_instance
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update alarm instance"
        )


"""         /api/alarm/schedule           """
def delete_alarm_schedule(db: Session, alarm_schedule: schemas.AlarmSchedule):
    try:
        db_schedule = crud.delete_alarm_schedule(db, alarm_schedule)
        if db_schedule is None:
            raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Conflict detected"
        )
        return db_schedule
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update alarm schedule"
        )

"""         /api/alarm/instance           """
def delete_alarm_instance(db: Session, alarm_instance: schemas.AlarmInstance):
    try:
        db_instance = crud.delete_alarm_instance(db, alarm_instance)
        if db_instance is None:
            raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Conflict detected"
        )
        return db_instance
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update alarm instance"
        )