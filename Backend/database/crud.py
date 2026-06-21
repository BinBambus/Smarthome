from datetime import datetime, timedelta, timezone
import os
from sqlalchemy import or_
from sqlalchemy.orm import Session
from models import schemas, models

# ------------------------------------------------------------------------
#                               CREATE
# ------------------------------------------------------------------------
def create_alarm_schedule(db: Session, alarm_schedule: schemas.AlarmSchedule):
    db_alarm_schedule = models.AlarmSchedule(
        time=alarm_schedule.time,
        led_color=alarm_schedule.led_color,
        duration_minutes=alarm_schedule.duration_minutes,
        is_active=alarm_schedule.is_active,
        monday=alarm_schedule.monday,
        tuesday=alarm_schedule.tuesday,
        wednesday=alarm_schedule.wednesday,
        thursday=alarm_schedule.thursday,
        friday=alarm_schedule.friday,
        saturday=alarm_schedule.saturday,
        sunday=alarm_schedule.sunday
    )
    db.add(db_alarm_schedule)
    db.commit()
    db.refresh(db_alarm_schedule)
    return db_alarm_schedule

def create_alarm_instance(db: Session, alarm_instance: schemas.AlarmInstance):
    db_alarm_instance = models.AlarmInstance(
        time=alarm_instance.time,
        date=alarm_instance.date,
        led_color=alarm_instance.led_color,
        duration_minutes=alarm_instance.duration_minutes,
        is_active=alarm_instance.is_active
    )
    db.add(db_alarm_instance)
    db.commit()
    db.refresh(db_alarm_instance)
    return db_alarm_instance

# ------------------------------------------------------------------------
#                       CHECK CONFLICTS
# ------------------------------------------------------------------------
def check_alarm_instance_conflict(db: Session, alarm_instance: schemas.AlarmInstance):
    entry = db.query(models.AlarmInstance).filter(
        models.AlarmInstance.time == alarm_instance.time,
        models.AlarmInstance.date == alarm_instance.date
    ).first()
    
    if entry:
        return True

    return False

def check_alarm_schedule_conflict(db: Session, alarm_schedule: schemas.AlarmSchedule):
    # Wir bauen dynamisch Bedingungen nur für die Tage, die TRUE sind
    conditions = []
    if alarm_schedule.monday: conditions.append(models.AlarmSchedule.monday == True)
    if alarm_schedule.tuesday: conditions.append(models.AlarmSchedule.tuesday == True)
    if alarm_schedule.wednesday: conditions.append(models.AlarmSchedule.wednesday == True)
    if alarm_schedule.thursday: conditions.append(models.AlarmSchedule.thursday == True)
    if alarm_schedule.friday: conditions.append(models.AlarmSchedule.friday == True)
    if alarm_schedule.saturday: conditions.append(models.AlarmSchedule.saturday == True)
    if alarm_schedule.sunday: conditions.append(models.AlarmSchedule.sunday == True)

    if not conditions:
        return True

    # Eine einzige, effiziente Abfrage
    entry = db.query(models.AlarmSchedule).filter(
        models.AlarmSchedule.time == alarm_schedule.time,
        or_(*conditions)
    ).first()

    if entry:
        return True

    return False

# ------------------------------------------------------------------------
#                               GET
# ------------------------------------------------------------------------
def get_alarm_instances(db: Session): 
    entries = db.query(models.AlarmInstance).all()
    return entries

def get_alarm_schedules(db: Session): 
    entries = db.query(models.AlarmSchedule).all()
    return entries

# ------------------------------------------------------------------------
#                            UPDATE
# ------------------------------------------------------------------------
def update_alarm_instance(db: Session, alarm_instance: schemas.AlarmInstance): 
    # 1. Bestehenden Eintrag aus der DB heraussuchen
    db_instance = db.query(models.AlarmInstance).filter(models.AlarmInstance.id == alarm_instance.id).first()
    
    if not db_instance:
        return None
    
    # 2. Besteht schon der gleiche eintrag
    entry = db.query(models.AlarmInstance).filter(
        models.AlarmInstance.id != alarm_instance.id,
        models.AlarmInstance.time == alarm_instance.time,
        models.AlarmInstance.date == alarm_instance.date
    ).first()

    if entry:
        return None
    
    # 3. Die Werte mit den neuen Daten überschreiben
    db_instance.time = alarm_instance.time
    db_instance.led_color = alarm_instance.led_color
    db_instance.duration_minutes = alarm_instance.duration_minutes
    db_instance.is_active = alarm_instance.is_active
    db_instance.date = alarm_instance.date

    # 4. Speichern
    db.commit()
    db.refresh(db_instance)
    return db_instance
    


def update_alarm_schedule(db: Session, alarm_schedule: schemas.AlarmSchedule): 
    # 1. Bestehenden Zeitplan suchen
    db_schedule = db.query(models.AlarmSchedule).filter(models.AlarmSchedule.id == alarm_schedule.id).first()
    
    if not db_schedule:
        return None

    # 2. Prüfe nach konflikten
    conditions = []
    if alarm_schedule.monday: conditions.append(models.AlarmSchedule.monday == True)
    if alarm_schedule.tuesday: conditions.append(models.AlarmSchedule.tuesday == True)
    if alarm_schedule.wednesday: conditions.append(models.AlarmSchedule.wednesday == True)
    if alarm_schedule.thursday: conditions.append(models.AlarmSchedule.thursday == True)
    if alarm_schedule.friday: conditions.append(models.AlarmSchedule.friday == True)
    if alarm_schedule.saturday: conditions.append(models.AlarmSchedule.saturday == True)
    if alarm_schedule.sunday: conditions.append(models.AlarmSchedule.sunday == True)

    if not conditions:
        return None

    entry = db.query(models.AlarmSchedule).filter(
        models.AlarmSchedule.id != alarm_schedule.id,
        models.AlarmSchedule.time == alarm_schedule.time,
        or_(*conditions)
    ).first()

    if entry:
        return None

    # 3. Werte überschreiben
    db_schedule.time = alarm_schedule.time
    db_schedule.led_color = alarm_schedule.led_color
    db_schedule.duration_minutes = alarm_schedule.duration_minutes
    db_schedule.is_active = alarm_schedule.is_active
    db_schedule.monday = alarm_schedule.monday
    db_schedule.tuesday = alarm_schedule.tuesday
    db_schedule.wednesday = alarm_schedule.wednesday
    db_schedule.thursday = alarm_schedule.thursday
    db_schedule.friday = alarm_schedule.friday
    db_schedule.saturday = alarm_schedule.saturday
    db_schedule.sunday = alarm_schedule.sunday

    # 4. Speichern
    db.commit()
    db.refresh(db_schedule)
    return db_schedule