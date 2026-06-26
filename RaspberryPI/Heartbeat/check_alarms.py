import os
import requests
import subprocess
from datetime import datetime

host_ip = os.getenv("HOST_IP", "localhost")
url = f"http://{host_ip}:5000/api"

# Current time (e.g. Montag, 22.06.2026, 20:50 Uhr)
now = datetime.now()
current_time_str = now.strftime("%H:%M")          # "20:50"
current_day_str = now.strftime("%A").lower()      # "monday", "tuesday", etc.

# --------------------------------
#          DB abfrage
# --------------------------------
# 1. Instances
try:
    response = requests.get(f"{url}/alarm/instances")

    if response.status_code == 200:
        alarm_instances = response.json()
    else:
        print(f"Error while retrieving Instances! Status-Code: {response.status_code}")
        alarm_instances = []

except requests.exceptions.ConnectionError:
    print("No connection to FastAPI possible. Is docker running?")
    alarm_instances = []


# 2. Schedules
try:
    response = requests.get(f"{url}/alarm/schedules")

    if response.status_code == 200:
        alarm_schedules = response.json()
    else:
        print(f"Error while retrieving Schedules! Status-Code: {response.status_code}")
        alarm_schedules = []

except requests.exceptions.ConnectionError:
    print("No connection to FastAPI possible. Is docker running?")
    alarm_schedules = []


# --------------------------------
#      Filter for activeness
# --------------------------------
delete_instances = []
# 1. Check Instances
for instance in alarm_instances:
    # Combined date ("2026-06-22") & time ("07:50:00") to datetime
    alarm_time_str = f"{instance['date']} {instance['time'][:5]}"
    alarm_datetime = datetime.strptime(alarm_time_str, "%Y-%m-%d %H:%M")
    
    # Check A: Is alarm obsolete
    if alarm_datetime < now and instance['time'][:5] != current_time_str:
        delete_instances.append(instance)
        
    # Check B: Is alarm exactly this minute active
    elif instance["is_active"] and instance["time"][:5] == current_time_str:
        
        # Start alarm.py in background with flags
        subprocess.Popen([
            "python", "alarm.py", 
            "--color", instance["led_color"], 
            "--duration", str(instance["duration_minutes"])
        ])

    
# 2. Check weekly schedules
for schedule in alarm_schedules:
    schedule_time_str = schedule["time"][:5]
    
    # Weekday correct, time and active-state correct?
    if schedule.get(current_day_str) is True and schedule_time_str == current_time_str and schedule["is_active"] is True:
        print(f"Triggering weekly schedule (ID: {schedule['id']})!")
        
        # Start alarm.py in background with flags
        subprocess.Popen([
            "python", "alarm.py", 
            "--color", schedule["led_color"], 
            "--duration", str(schedule["duration_minutes"])
        ])
    

# --------------------------------
#          DB cleanup
# --------------------------------
try:
    for instance in delete_instances:
        json_data = {
            "id": instance["id"],
            "is_active": instance["is_active"],
            "led_color": instance["led_color"],
            "time": instance["time"],
            "date": instance["date"],
            "duration_minutes": instance["duration_minutes"],
        }
        response = requests.delete(f"{url}/alarm/instance", json=json_data)

        if response.status_code != 200:
            print(f"Error while retrieving Instances! Status-Code: {response.status_code}")

except requests.exceptions.ConnectionError:
    print("No connection to FastAPI possible. Is docker running?")
    alarm_instances = []