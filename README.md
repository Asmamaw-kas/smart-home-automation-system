Here is a clean, merged, single `README.md` file you can copy directly:

````markdown
# 🏠 Smart Home Automation System


An IoT-based **Smart Home Automation and Security System** for monitoring, controlling, and automating household appliances through a modern web dashboard.

[![Django](https://img.shields.io/badge/Django-4.2-green.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-purple.svg)](https://tailwindcss.com/)
[![Arduino](https://img.shields.io/badge/Arduino-IoT-teal.svg)](https://www.arduino.cc/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#-license)


---

## 📌 Overview

The **Smart Home Automation System** is a full-stack IoT project that allows users to remotely control and monitor home devices such as lights, fans, doors, locks, sensors, and cameras.

It combines:

- **Django REST Framework** backend
- **React + TailwindCSS** frontend
- **Arduino / Raspberry Pi** hardware integration
- **Sensors and actuators** for automation
- **JWT authentication**
- **Real-time updates**
- **Security monitoring**
- **Optional camera surveillance**

This project is designed for academic, learning, and practical smart home automation use cases.

---

## 📋 Table of Contents

- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Hardware Components](#-hardware-components)
- [Software Stack](#-software-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Configuration](#-environment-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Hardware Setup](#-hardware-setup)
- [Project Structure](#-project-structure)
- [Screenshots](#-screenshots)
- [Backend Requirements Reference](#-backend-requirements-reference)
- [Publish to GitHub](#-publish-to-github)
- [Repository Checklist](#-repository-checklist)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [Code of Conduct](#-code-of-conduct)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)
- [Project Team](#-project-team)

---

## ✨ Features

### 🎮 Device Control

- Smart lighting control
- Automatic light control based on ambient light
- Temperature-based smart fan control
- Automatic door opening using ultrasonic distance detection
- PIN-based smart door locking system
- Relay-based appliance control

### 📊 Dashboard and Monitoring

- Real-time temperature monitoring
- Real-time humidity monitoring
- Light intensity monitoring
- Device status display
- Energy usage tracking
- Interactive graphs and charts
- Live system overview

### 🤖 Automation

- Custom automation rules
- Sensor-triggered automation
- Time-based schedules
- Scene management
- Multi-device automation
- If-this-then-that style logic

### 🔐 Security

- JWT authentication
- PIN-protected door access
- Failed PIN attempt tracking
- Lockout after repeated failed attempts
- Emergency lock mode
- Access history
- Security event logs

### 🎥 Camera Surveillance

- Optional webcam or IP camera support
- MJPEG live streaming
- Snapshot capture
- Motion detection alerts
- Camera status management

### 📝 Logging

- Device operation logs
- Sensor history logs
- User activity logs
- Security event logs
- System error logs
- Energy usage records

### 🎨 User Interface

- Responsive web design
- Mobile, tablet, and desktop support
- Dark and light theme support
- Modern dashboard layout
- Real-time updates
- Toast notifications

---

## 🏗 System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                        │
│                    React Frontend :3000                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ HTTP / WebSocket
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                     Django Backend :8000                    │
│                                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │  Users  │ │ Devices │ │ Sensors │ │  Logs   │          │
│  │   App   │ │   App   │ │   App   │ │   App   │          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
│                                                             │
│                    ┌─────────┐                              │
│                    │ Camera  │                              │
│                    │   App   │                              │
│                    └─────────┘                              │
│                         │                                    │
│                         │ Serial Communication              │
│                         ▼                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Arduino / Raspberry Pi                  │   │
│  │                                                      │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │   │
│  │  │DHT11 │ │ LDR  │ │Servo │ │Relay │ │Buzzer│       │   │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Hardware Components

| Component | Quantity | Purpose |
|---|---:|---|
| Arduino Uno / Nano / Mega or Raspberry Pi | 1 | Main hardware controller |
| DHT11 / DHT22 Sensor | 1 | Temperature and humidity readings |
| LDR Sensor | 1 | Light intensity detection |
| HC-SR04 Ultrasonic Sensor | 1 | Distance measurement |
| Servo Motor | 1 | Automatic door opening |
| 4x3 Matrix Keypad | 1 | PIN entry |
| Relay Module | 1 | Fan or appliance switching |
| Buzzer | 1 | Alerts and notifications |
| LEDs | 2 | Device/status indicators |
| Breadboard and jumper wires | As needed | Circuit connections |
| USB cable | 1 | Programming and serial communication |
| Power supply | As needed | Powering actuators and modules |

---

## 💻 Software Stack

### Backend

| Technology | Version | Purpose |
|---|---:|---|
| Python | 3.9+ | Backend language |
| Django | 4.2.x | Web framework |
| Django REST Framework | 3.14.x | REST API |
| Django Channels | 4.x | WebSocket support |
| Simple JWT | 5.3.x | Authentication |
| PostgreSQL | 14+ | Production database |
| SQLite | Built-in | Development database |
| PySerial | 3.5 | Arduino serial communication |
| OpenCV | 4.x | Camera streaming |
| Pillow | 10.x | Image handling |
| drf-yasg | 1.21.x | API documentation |

### Frontend

| Technology | Version | Purpose |
|---|---:|---|
| React | 18.x | UI framework |
| Vite | 4.x | Frontend build tool |
| TailwindCSS | 3.x | Styling |
| React Router | 6.x | Routing |
| Axios | 1.x | HTTP requests |
| Recharts | 2.x | Data visualization |
| Socket.io Client | 4.x | Real-time communication |
| React Hot Toast | 2.x | Notifications |

---

## 📋 Prerequisites

Before running the project, make sure you have the following installed.

### Required Software

- Python 3.9 or higher
- Node.js 18 or higher
- npm or yarn
- Git
- Arduino IDE
- PostgreSQL, optional for production use

### Required Hardware

- Arduino board or Raspberry Pi
- Sensors and actuators listed above
- USB cable
- Breadboard
- Jumper wires
- Suitable power supply

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/smart-home-automation-system.git
cd smart-home-automation-system
```

> Replace `YOUR_USERNAME` with your actual GitHub username.

---

### 2. Backend Setup

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment:

```bash
# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

Create the backend environment file:

```bash
cp .env.example .env
```

Apply database migrations:

```bash
python manage.py migrate
```

Create an admin user:

```bash
python manage.py createsuperuser
```

Optional camera setup:

```bash
python manage.py shell
```

Then run:

```python
from camera.models import Camera

Camera.objects.create(
    name="PC Webcam",
    location="Computer",
    camera_id=0,
    resolution="640x480",
    fps=30,
    status="online",
    is_active=True
)

exit()
```

---

### 3. Frontend Setup

From the project root:

```bash
cd frontend
```

Install frontend dependencies:

```bash
npm install
```

Create the frontend environment file:

```bash
cp .env.example .env
```

---

### 4. Arduino Setup

1. Open the Arduino IDE.
2. Install the required libraries:
   - DHT sensor library
   - Keypad library
   - Servo library
3. Open the Arduino sketch from:

```text
arduino/smart_home.ino
```

4. Select the correct board.
5. Select the correct port.
6. Upload the code.
7. Note the Arduino port, for example:
   - Windows: `COM3`
   - Linux: `/dev/ttyUSB0`
   - macOS: `/dev/tty.usbmodemXXXX`

---

## ⚙ Environment Configuration

### Backend `.env` Example

```env
DEBUG=True
SECRET_KEY=django-insecure-your-secret-key-here

DATABASE_NAME=smart_home_db
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432

ARDUINO_PORT=COM3
ARDUINO_BAUD=9600
```

> Change `ARDUINO_PORT` to match your actual Arduino port.

---

### Frontend `.env` Example

```env
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000
```

---

## 🏃 Running the Application

### Start the Backend Server

```bash
cd backend
```

Activate the virtual environment:

```bash
# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

Run the Django server:

```bash
python manage.py runserver
```

Backend URL:

```text
http://localhost:8000
```

---

### Start the Frontend Server

Open a new terminal:

```bash
cd frontend
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

---

### Application URLs

| Service | URL |
|---|---|
| Frontend | `http://localhost:3000` |
| Backend API | `http://localhost:8000/api` |
| Django Admin | `http://localhost:8000/admin` |
| API Documentation | `http://localhost:8000/api/docs` |

---

## 📡 API Documentation

### Authentication Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/register/` | POST | Register a new user |
| `/api/auth/login/` | POST | Login user |
| `/api/auth/logout/` | POST | Logout user |
| `/api/auth/profile/` | GET / PATCH | View or update profile |
| `/api/auth/change-password/` | POST | Change password |

---

### Device Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/devices/devices/` | GET / POST | List or create devices |
| `/api/devices/devices/{id}/` | GET / PUT / DELETE | Manage a device |
| `/api/devices/devices/{id}/control/` | POST | Control a device |
| `/api/devices/dashboard/` | GET | Device dashboard data |

---

### Sensor Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/sensors/sensors/` | GET / POST | List or create sensors |
| `/api/sensors/data/` | GET | Get sensor data |
| `/api/sensors/current/` | GET | Get current readings |
| `/api/sensors/dashboard/` | GET | Sensor dashboard data |

---

### Automation Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/devices/automations/` | GET / POST | Manage automation rules |
| `/api/devices/scenes/` | GET / POST | Manage scenes |
| `/api/devices/schedules/` | GET / POST | Manage schedules |

---

### Camera Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/camera/cameras/` | GET / POST | Manage cameras |
| `/api/camera/mjpeg/{id}/` | GET | Live MJPEG stream |
| `/api/camera/snapshot/{id}/` | GET | Capture snapshot |

---

## 🔌 Hardware Setup

### Arduino Pin Configuration

```cpp
#define DHT_PIN 2          // DHT11 / DHT22 Temperature and Humidity Sensor
#define LDR_PIN A0         // LDR Light Sensor
#define TRIG_PIN 9         // Ultrasonic Trigger Pin
#define ECHO_PIN 10        // Ultrasonic Echo Pin
#define LIGHT_PIN 8        // LED Light
#define RELAY_FAN_PIN 7    // Fan Relay
#define SERVO_PIN 6        // Door Servo Motor
#define BUZZER_PIN A3      // Buzzer

// Keypad Pins
// Rows:    R1-D3, R2-D4, R3-D5, R4-D11
// Columns: C1-D12, C2-D13, C3-A5
```

---

### Circuit Overview

```text
                    Smart Home System Circuit

     Arduino Uno                    Sensors & Actuators
    ┌───────────┐
    │         D2├──────────────► DHT11 / DHT22
    │         A0├──────────────► LDR
    │         D9├──────────────► Ultrasonic TRIG
    │        D10├──────────────► Ultrasonic ECHO
    │         D8├──────────────► LED Light
    │         D7├──────────────► Relay Fan
    │         D6├──────────────► Servo Motor
    │         A3├──────────────► Buzzer
    │   D3,D4,D5├──────────────► Keypad Rows
    │ D11,D12,D13,A5───────────► Keypad Columns
    └───────────┘
```

---

## 📁 Project Structure

```text
smart-home-automation-system/
│
├── backend/
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   │
│   ├── users/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── signals.py
│   │
│   ├── devices/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   └── urls.py
│   │
│   ├── sensors/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── consumers.py
│   │   └── urls.py
│   │
│   ├── logs/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   └── urls.py
│   │
│   ├── camera/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   └── urls.py
│   │
│   ├── core/
│   │   ├── serial_handler.py
│   │   └── automation.py
│   │
│   ├── requirements.txt
│   └── manage.py
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── Auth.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Devices.jsx
│   │   │   ├── Automation.jsx
│   │   │   ├── Security.jsx
│   │   │   ├── Logs.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── Camera.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── deviceService.js
│   │   │   ├── sensorService.js
│   │   │   ├── logService.js
│   │   │   ├── cameraService.js
│   │   │   └── websocket.js
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── DeviceContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useWebSocket.js
│   │   │   ├── useDevice.js
│   │   │   └── useSensor.js
│   │   │
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   └── helpers.js
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── arduino/
│   └── smart_home.ino
│
├── screenshots/
│   ├── dashboard.png
│   ├── devices.png
│   ├── automation.png
│   ├── security.png
│   ├── camera.png
│   ├── logs.png
│   └── darkmode.png
│
├── .gitignore
├── README.md
└── LICENSE
```

---

## 📸 Screenshots

Create a `screenshots` folder and add the following images:

```text
screenshots/
├── dashboard.png
├── devices.png
├── automation.png
├── security.png
├── camera.png
├── logs.png
└── darkmode.png
```

<details>
<summary>View screenshots</summary>

### Dashboard

![Dashboard](screenshots/dashboard.png)

### Device Control

![Devices](screenshots/devices.png)

### Automation Rules

![Automation](screenshots/automation.png)

### Security Panel

![Security](screenshots/security.png)

### Camera Stream

![Camera](screenshots/camera.png)

### Activity Logs

![Logs](screenshots/logs.png)

### Dark Mode

![Dark Mode](screenshots/darkmode.png)

</details>

---

## 📦 Backend Requirements Reference

Use the following dependencies in `backend/requirements.txt`:

```txt
Django==4.2.7
djangorestframework==3.14.0
djangorestframework-simplejwt==5.3.0
django-cors-headers==4.3.1
python-dotenv==1.0.0
psycopg2-binary==2.9.9
pyserial==3.5
channels==4.0.0
channels-redis==4.1.0
pillow==10.1.0
drf-yasg==1.21.7
opencv-python-headless==4.8.1.78
numpy==1.24.3
```

Install them using:

```bash
pip install -r requirements.txt
```

---

## 🚢 Publish to GitHub

### 1. Create a GitHub Repository

Create a new repository on GitHub named:

```text
smart-home-automation-system
```

---

### 2. Initialize Git and Push

From the project root:

```bash
cd smart-home-automation-system

git init
git add .
git commit -m "Initial commit: Smart Home Automation System"

git remote add origin https://github.com/YOUR_USERNAME/smart-home-automation-system.git
git branch -M main
git push -u origin main
```

---

### 3. Verify Repository

```bash
git status
git log --oneline
```

---

### 4. Recommended GitHub Topics

Add these topics to your GitHub repository:

```text
smart-home
iot
django
react
arduino
home-automation
raspberry-pi
websocket
tailwindcss
```

---

### 5. Optional GitHub Badges

After replacing `YOUR_USERNAME`, you can add these badges near the top of this README:

```markdown
[![GitHub stars](https://img.shields.io/github/stars/YOUR_USERNAME/smart-home-automation-system)](https://github.com/YOUR_USERNAME/smart-home-automation-system/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/YOUR_USERNAME/smart-home-automation-system)](https://github.com/YOUR_USERNAME/smart-home-automation-system/network)
[![GitHub issues](https://img.shields.io/github/issues/YOUR_USERNAME/smart-home-automation-system)](https://github.com/YOUR_USERNAME/smart-home-automation-system/issues)
[![GitHub license](https://img.shields.io/github/license/YOUR_USERNAME/smart-home-automation-system)](https://github.com/YOUR_USERNAME/smart-home-automation-system/blob/main/LICENSE)
```

---

## ✅ Repository Checklist

Before pushing your project, make sure:

- Sensitive data is not committed
- `.env` files are ignored
- Only `.env.example` files are committed
- `node_modules/` is not committed
- `venv/` is not committed
- Large unnecessary files are removed
- Screenshots are added if available
- Repository URL is updated in this README
- GitHub default branch is set to `main`
- Issues and Discussions are enabled if needed

Recommended `.gitignore` entries:

```gitignore
.env
*.env
venv/
__pycache__/
*.pyc
node_modules/
dist/
build/
.DS_Store
db.sqlite3
media/
staticfiles/
```

---

## 🛠 Troubleshooting

### Arduino Connection Failed

Check the connected port.

```bash
# Linux
ls /dev/ttyUSB* /dev/ttyACM*

# macOS
ls /dev/tty.*

# Windows
# Check Device Manager for COM port
```

Then update the backend `.env` file:

```env
ARDUINO_PORT=COM3
ARDUINO_BAUD=9600
```

---

### Camera Stream Not Working

Install OpenCV:

```bash
pip install opencv-python-headless
```

Verify camera access:

```bash
python -c "import cv2; cap = cv2.VideoCapture(0); print(cap.isOpened())"
```

If it prints `True`, the camera is available.

---

### WebSocket Connection Failed

Check that the backend server is running:

```bash
python manage.py runserver
```

Also confirm your frontend `.env` contains:

```env
VITE_WS_URL=ws://localhost:8000
```

---

### Database Migration Errors

Try running:

```bash
python manage.py makemigrations
python manage.py migrate
```

If migrations are already out of sync, you may need:

```bash
python manage.py migrate --fake
python manage.py makemigrations
python manage.py migrate
```

---

### Frontend Not Starting

Delete dependencies and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

On Windows PowerShell:

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npm run dev
```

---

## 🤝 Contributing

Contributions are welcome.

### How to Contribute

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/AmazingFeature
```

3. Make your changes.
4. Commit your changes.

```bash
git commit -m "Add AmazingFeature"
```

5. Push to your branch.

```bash
git push origin feature/AmazingFeature
```

6. Open a pull request.

---

### Contribution Guidelines

- Follow clean code practices.
- Write clear commit messages.
- Update documentation when needed.
- Test your changes before submitting.
- Keep pull requests focused and easy to review.

---

### Code Style

| Area | Style |
|---|---|
| Python | Follow PEP 8 |
| Django | Use clear app structure |
| JavaScript / React | Use consistent component structure |
| CSS | Prefer Tailwind utility classes |
| Commits | Use meaningful messages |

---

### Reporting Issues

When opening an issue, include:

- Clear description of the problem
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if possible
- Error logs if available

---

## 🌍 Code of Conduct

### Our Pledge

We pledge to make participation in this project welcoming, respectful, and harassment-free for everyone.

### Our Standards

Examples of positive behavior:

- Using welcoming and inclusive language
- Respecting different viewpoints
- Accepting constructive criticism
- Focusing on what is best for the project
- Helping other contributors learn and improve

Unacceptable behavior includes:

- Harassment or discrimination
- Insulting or disrespectful comments
- Publishing private information without permission
- Any behavior that makes the community unsafe

---

## 📄 License

This project is licensed under the **MIT License**.

```txt
MIT License

Copyright (c) 2024 Asmamaw Kassie, Temesgen Molla, Ayichew Mulusew

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

Special thanks to:

- **University of Gondar**
- **Fasil Campus**
- **Department of Computer Engineering**
- Project supervisors and instructors
- The open-source community
- Django, React, Arduino, and TailwindCSS communities

---

## 👥 Project Team

| Name | ID |
|---|---|
| Asmamaw Kassie | 00727/14 |
| Temesgen Molla | 01322/14 |
| Ayichew Mulusew | 02668/14 |

**University:** University of Gondar, Fasil Campus  
**Department:** Computer Engineering  
**Project:** Smart Home Automation System  

---

## 🔗 Project Link

```text
https://github.com/YOUR_USERNAME/smart-home-automation-system
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## ⭐ Support

If this project helped you, please give it a star on GitHub.

---

<div align="center">

**Built with ❤️ for Smart Home Automation**

</div>
````
