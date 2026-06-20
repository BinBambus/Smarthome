# SmartLight API & Scheduler

Ein leichtgewichtiges Smarthome-Backend, das dein günstiges LED-Licht in einen intelligenten Lichtwecker verwandelt. Die App bietet eine REST-API, um Weckzeiten komfortabel zu planen. Um Ressourcen zu schonen, werden die Wecker direkt in die Linux-Crontab eingetragen – stabil, ausfallsicher und überlebt jeden Systemneustart.

---

## 🚀 Features

* **REST-API:** Einfache Endpunkte zum Erstellen, Auflisten und Löschen von Weckzeiten.
* **Linux-Native Scheduling:** Nutzt die systemeigene `crontab`, wodurch kein schwerer Applikations-Server permanent im RAM laufen muss.
* **Robust & Ausfallsicher:** Einmal gesetzte Wecker bleiben auch nach einem Stromausfall oder Reboot des Servers (z. B. Raspberry Pi) aktiv.
* **Sanftes Aufwachen:** Startet dein LED-Skript exakt zur gewünschten Minute.

---

## 🛠️ Tech Stack & Voraussetzungen

* **Backend:** Python 3.x mit Flask (oder Node.js / Express)
* **Scheduling:** `python-crontab` (Bibliothek zur sicheren Manipulation der System-Crontab)
* **Betriebssystem:** Linux (Raspberry Pi OS, Arch, Ubuntu, CachyOS etc.)
* **Hardware:** Günstige LED-Streifen (angesteuert via GPIO oder ESP8266/ESP32 Webhook)

---

## 📦 Installation & Setup

1. **Repository klonen:**
```bash
   git clone [https://github.com/dein-benutzername/smartlight-wakeup.git](https://github.com/dein-benutzername/smartlight-wakeup.git)
   cd smartlight-wakeup