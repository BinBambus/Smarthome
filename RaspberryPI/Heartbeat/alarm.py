import asyncio
import os
import argparse
import requests
from bleak import BleakScanner
from pymagicstrip import MagicStripDevice

# API configuration
host_ip = os.getenv("HOST_IP", "localhost")
url = f"http://{host_ip}:5000/api"

# ---------------------------------------------------------------------------
#   Helper-functions
# ---------------------------------------------------------------------------
async def toggle_on(strip, led_status):
    if not led_status["is_on"]:
        await strip.toggle_power()
        led_status["is_on"] = True
        requests.post(f"{url}/led/status", json=led_status)

async def set_led_color(strip, hex_code, led_status):
    r = int(hex_code[0:2], 16)
    g = int(hex_code[2:4], 16)
    b = int(hex_code[4:6], 16)
    
    await strip.set_color(r, g, b)
    led_status["led_color"] = hex_code
    requests.post(f"{url}/led/status", json=led_status)

async def set_brightness(strip, brightness, led_status):
    await strip.set_brightness(brightness)
    led_status["brightness"] = brightness
    requests.post(f"{url}/led/status", json=led_status)


# ---------------------------------------------------------------------------
#   Main-Routine
# ---------------------------------------------------------------------------
async def main(target_color, duration_minutes):
    led_status = None
    
    # 1. Get LED-Status from FastAPI or create fallback entry
    try:
        response = requests.get(f"{url}/led/status")
        if response.status_code == 200:
            led_status = response.json()
            if not led_status == []:
                led_status = led_status[0]

        if not led_status or led_status == []:
            json_data = {
                "hex_code": "ff:ff:2a:00:06:f7",  # Bluetooth-MAC-Adress of LED-Strip
                "is_on": False,
                "led_color": "2AD5D5",
                "brightness": 255,
            }
            response = requests.post(f"{url}/led/status", json=json_data)
            if response.status_code == 200:
                led_status = response.json()
            else:
                print(f"Error on create of LED-Status! Status: {response.status_code}")
                return 1

    except requests.exceptions.ConnectionError:
        print("No connection to FastAPI possible. Docker running?")
        return 1

    # 2. Start connection to Bluetooth Magic Strip
    mac_address = led_status["hex_code"]
    print(f"Connect to Magic Strip via Bluetooth ({mac_address})...")
    retries = 3

    for attempt in range(1, retries + 1):
        try:
            device_found = await BleakScanner.find_device_by_address(mac_address, timeout=1.0)
            if device_found:
                break
        except Exception as scan_error:
            print(f"Error on scan: {scan_error}")
        

    strip = MagicStripDevice(mac_address)
    
    for attempt in range(1, retries + 1):
        try:
            async with strip:
                print("Connected via Bluetooth!")
                await toggle_on(strip, led_status)
                await set_led_color(strip, target_color, led_status)
                
                # 3. Alarm-Clock-Simulation (Sunrise-Effect)
                steps = 255
                duration_seconds = 60 * duration_minutes
                wait_time = duration_seconds / steps

                await asyncio.sleep(2)

                for i in range(1, steps + 1):
                    brightness = int((i / steps) * 255)
                    
                    await set_brightness(strip, brightness, led_status)                
                    await asyncio.sleep(wait_time)
                break
                
        except Exception as e:
            print(f"Connection lost or error occured: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="LED Alarm Clock Controller")
    
    parser.add_argument("--color", type=str, default="FF88FF", help="Target HEX color (e.g. FF88FF)")
    parser.add_argument("--duration", type=int, default=10, help="Duration of sunrise in minutes")
    
    args = parser.parse_args()

    try:
        asyncio.run(main(target_color=args.color, duration_minutes=args.duration))
    except Exception as e:
        print(f"Error within Loop: {e}")
    finally:
        print("Bluetooth-Connection closed successfully.")