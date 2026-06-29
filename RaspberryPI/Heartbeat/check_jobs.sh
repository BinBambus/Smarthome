#!/bin/bash

# Move to the absolute path of your project
cd /home/pi/Smarthome/RaspberryPI/Heartbeat

# Activate the virtual environment
source venv/bin/activate

# Run script
python check_alarms.py

