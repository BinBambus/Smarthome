from pydantic import BaseModel, Field
from datetime import date, time

class AlarmBase(BaseModel):
    id: int
    time: time
    led_color: str = Field(max_length=6)
    duration_minutes: int
    is_active: bool

class AlarmInstance(AlarmBase):
    date: date

class AlarmSchedule(AlarmBase):
    monday: bool
    tuesday: bool
    wednesday: bool
    thursday: bool
    friday: bool
    saturday: bool
    sunday: bool

class LedStatus(BaseModel):
    hex_code: str
    is_on: bool
    led_color: str = Field(max_length=6)
    brightness: int