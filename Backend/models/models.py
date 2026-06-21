from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, func, Date, Time
from database.db import Base

class AlarmSchedule(Base):
    __tablename__ = "alarm_schedule"
    id = Column(Integer, primary_key=True, index=True)
    time = Column(Time, nullable=False)
    duration_minutes = Column(Integer, nullable=False, default=10)
    led_color = Column(String(6), nullable=False)
    is_active = Column(Boolean, nullable=False, default=False)
    monday = Column(Boolean, nullable=False, default=False)
    tuesday = Column(Boolean, nullable=False, default=False)
    wednesday = Column(Boolean, nullable=False, default=False)
    thursday = Column(Boolean, nullable=False, default=False)
    friday = Column(Boolean, nullable=False, default=False)
    saturday = Column(Boolean, nullable=False, default=False)
    sunday = Column(Boolean, nullable=False, default=False)

class AlarmInstance(Base):
    __tablename__ = "alarm_instance"
    id = Column(Integer, primary_key=True, index=True)
    schedule_id = Column(Integer, ForeignKey("alarm_schedule.id"), nullable=True)
    date = Column(Date, nullable=False)
    time = Column(Time, nullable=False)
    duration_minutes = Column(Integer, nullable=False, default=10)
    led_color = Column(String(6), nullable=False)
    is_active = Column(Boolean, nullable=False, default=False)