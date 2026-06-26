from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from bleak import BleakScanner
from pymagicstrip import MagicStripDevice
import asyncio
from contextlib import asynccontextmanager
from datetime import timedelta
from models import schemas
from typing import List
from database.db import get_db, init_db
from sqlalchemy.orm import Session
from service import db_service
from enum import Enum

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield
    pass

app = FastAPI(lifespan=lifespan)

@app.post("/api/alarm/instance")
async def create_alarm_instance(alarm_instance: schemas.AlarmInstance, db: Session = Depends(get_db)):
    return db_service.create_alarm_instance(db, alarm_instance)

@app.post("/api/alarm/schedule")
async def create_alarm_schedule(alarm_schedule: schemas.AlarmSchedule, db: Session = Depends(get_db)):  
    return db_service.create_alarm_schedule(db, alarm_schedule)

@app.get("/api/alarm/instances", response_model=List[schemas.AlarmInstance])
async def get_alarm_instances(db: Session = Depends(get_db)):
    return db_service.get_alarm_instances(db)

@app.get("/api/alarm/schedules", response_model=List[schemas.AlarmSchedule])
async def get_alarm_schedules(db: Session = Depends(get_db)):
    return db_service.get_alarm_schedules(db)

@app.put("/api/alarm/schedule")
async def update_alarm_schedule(alarm_schedule: schemas.AlarmSchedule, db: Session = Depends(get_db)):  
    return db_service.update_alarm_schedule(db, alarm_schedule)

@app.put("/api/alarm/instance")
async def update_alarm_instance(alarm_instance: schemas.AlarmInstance, db: Session = Depends(get_db)):  
    return db_service.update_alarm_instance(db, alarm_instance)

@app.delete("/api/alarm/schedule")
async def delete_alarm_schedule(alarm_schedule: schemas.AlarmSchedule, db: Session = Depends(get_db)):  
    return db_service.delete_alarm_schedule(db, alarm_schedule)

@app.delete("/api/alarm/instance")
async def delete_alarm_instance(alarm_instance: schemas.AlarmInstance, db: Session = Depends(get_db)):  
    return db_service.delete_alarm_instance(db, alarm_instance)


# ---------------------------------------------------------------
#                       LED-STATUS
# ---------------------------------------------------------------
@app.post("/api/led/status")
async def insert_or_update_led_status(led_status: schemas.LedStatus, db: Session = Depends(get_db)):  
    return db_service.insert_or_update_led_status(db, led_status)

@app.get("/api/led/status", response_model=List[schemas.LedStatus])
async def get_alarm_instances(db: Session = Depends(get_db)):
    return db_service.get_led_status(db)


# -------------------------------------------------------------------------------
#                           WEBSOCKET
# -------------------------------------------------------------------------------
class Log(Enum):
    I = "[INFO] "
    S = "[SUCCESS] "
    W = "[WARNING] "
    E = "[ERROR] "

@app.websocket("/api/ws/led")
async def websocket_led_control(websocket: WebSocket, db: Session = Depends(get_db)):
    await websocket.accept()
    print(Log.S.value + f"Frontend connected!")

    # 1. Zustand aus der DB holen
    db_status_list = db_service.get_led_status(db)
    if db_status_list:
        current_status = db_status_list[0]
    else:
        from models.models import LedStatus as DB_LedStatus
        current_status = DB_LedStatus(id=1, hex_code="ff:ff:2a:00:06:f7", is_on=False, led_color="2AD5D5", brightness=100)

    print(Log.I.value + f"Start scan for device: {current_status.hex_code}")
    try:
        device_found = await BleakScanner.find_device_by_address(current_status.hex_code, timeout=1.0)
        if not device_found:
            print(Log.W.value + f"LED-Strip not found!")
        else:
            print(Log.I.value + f"Device found!")
        await asyncio.sleep(0.3)

    except WebSocketDisconnect:
        print(Log.I.value + f"Frontend closed")
        return
    except Exception as scan_error:
        print(Log.E.value + f"on Scan: {scan_error}")
        # Still continue

    print(Log.I.value + f"Initialize MagicStripDevice...")
    strip = MagicStripDevice(current_status.hex_code)
    retries = 3
    is_connected = False

    for attempt in range(1, retries + 1):
        if websocket.client_state.value == 3:
                print(Log.I.value + f"Frontend closed")
                return
        try:
            async with strip:
                print(Log.S.value + f"Bluetooth-Connected with LED-Strip")
                is_connected = True

                await websocket.send_json({
                    "type": "bluetooth_status",
                    "connected": is_connected,
                    "message": f"Success connected to LED-Strip (Try {attempt})"
                })
                
                while True:
                    try:
                        data = await websocket.receive_json()
                        print(Log.S.value + f"Recieved instruction: {data}")
                    except WebSocketDisconnect:
                        print(Log.I.value + f"Frontend closed")
                        return 

                    if "brightness" in data:
                        new_brightness = int(data["brightness"])
                        await strip.set_brightness(new_brightness)
                        current_status.brightness = new_brightness
                    
                    if "color" in data:
                        hex_code = data["color"]
                        r = int(hex_code[0:2], 16)
                        g = int(hex_code[2:4], 16)
                        b = int(hex_code[4:6], 16)
                        await strip.set_color(r, g, b)
                        current_status.led_color = hex_code

                    if "is_on" in data:
                        target_power = bool(data["is_on"])
                        if current_status.is_on != target_power:
                            await strip.toggle_power()
                            current_status.is_on = target_power
                            db_service.insert_or_update_led_status(db, current_status)

        except WebSocketDisconnect:
            print(Log.I.value + f"Frontend closed")
            return

        except Exception as e:
            print(Log.W.value + f"Bluetooth-Connection try {attempt}/{retries} failed: {e}")
            if attempt < retries:
                await asyncio.sleep(1)
            else:
                print(Log.E.value + f"all Bluetooth-Connection trys failed!")
                try:
                    await websocket.close(code=status.WS_1011_INTERNAL_ERROR)
                except:
                    pass
                return
        finally:
            if is_connected:
                try:
                    db_service.insert_or_update_led_status(db, current_status)
                    print(Log.S.value + f"saved final LED-State to DB")
                except Exception as db_err:
                    print(Log.S.value + f"on DB-Save within Cleanup: {db_err}")