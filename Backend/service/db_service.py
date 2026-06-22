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
    """
    Create a new alarm instance and return it.
    """
    # 1. Prüfen, ob conflict existiert
    db_alarm = crud.check_alarm_instance_conflict(db, alarm_instance)
    if db_alarm is True:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Alarm instance conflict with existing instance"
        )

    # 2. Alarm instance in DB erstellen
    try:
        return crud.create_alarm_instance(db, alarm_instance)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create alarm instance"
        )

"""         /create_alarm_schedule           """
def create_alarm_schedule(db: Session, alarm_schedule: schemas.AlarmSchedule):
    """
    Create a new alarm schedule and return it.
    """
    # 1. Prüfen, ob conflict existiert
    db_schedule = crud.check_alarm_schedule_conflict(db, alarm_schedule)
    if db_schedule is True:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Conflict detected"
        )

    # 32 Alarm schedule in DB erstellen
    try:
        return crud.create_alarm_schedule(db, alarm_schedule)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create alarm schedule"
        )

"""         /api/alarm/instances           """
def get_alarm_instances(db: Session):
    """
    Retrieve all alarm instances and return it.
    """
    # 1. Read all instances
    try:
        return crud.get_alarm_instances(db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to retrieve alarm instances"
        )

"""         /api/alarm/schedules        """
def get_alarm_schedules(db: Session):
    """
    Retrieve all alarm schedules and return it.
    """
    # 1. Read all instances
    try:
        return crud.get_alarm_schedules(db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to retrieve alarm schedules"
        )


"""         /api/alarm/schedule           """
def update_alarm_schedule(db: Session, alarm_schedule: schemas.AlarmSchedule):
    """
    Update an alarm schedule.
    """
    # 1. Updated überprüft selbst
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
    """
    Update an alarm instance.
    """
    # 1. Updated überprüft selbst
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
    """
    Delete an alarm schedule.
    """
    # 1. Delete
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
    """
    Delete an alarm instance.
    """
    # 1. Delete 
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