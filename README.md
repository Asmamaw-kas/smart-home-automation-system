# 🏠 Smart Home Automation System

[![Django](https://img.shields.io/badge/Django-4.2-green.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-purple.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An **IoT-based Smart Home Automation and Security System** that enables remote monitoring and control of household appliances through a modern web application. The system integrates microcontrollers (Arduino/Raspberry Pi) with various sensors and actuators to automate home functions.

## 📋 Table of Contents
- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Hardware Components](#-hardware-components)
- [Software Stack](#-software-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Hardware Setup](#-hardware-setup)
- [Project Structure](#-project-structure)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

## ✨ Features

### 🎮 Device Control
- **Smart Lighting** - Manual/automatic control based on ambient light
- **Smart Fan** - Temperature-based automatic fan control
- **Smart Door** - Ultrasonic distance-based automatic door opening
- **Smart Lock** - PIN-based secure door locking system

### 📊 Dashboard & Monitoring
- Real-time sensor data visualization (Temperature, Humidity, Light)
- Live device status monitoring
- Energy consumption tracking
- Interactive charts and graphs

### 🤖 Automation Rules
- Create custom automation rules (If-This-Then-That)
- Time-based scheduling
- Sensor-triggered automation (Temperature, Light, Motion)
- Scene management for multi-device control

### 🔒 Security Features
- JWT-based authentication
- PIN-protected door access
- Access logs and history
- Failed attempt lockout (3 attempts)
- Emergency lock mode

### 🎥 Camera Surveillance (Optional)
- Live MJPEG streaming
- Snapshot capture
- Motion detection alerts
- Camera recording management

### 📝 Logging System
- Comprehensive activity logging
- Device operation history
- Security event tracking
- System error logs
- Energy usage logs

### 🎨 UI/UX Features
- Dark/Light theme mode
- Responsive design (Mobile/Tablet/Desktop)
- Real-time WebSocket updates
- Modern, intuitive interface

## 🏗 System Architecture
...

## 🔧 Hardware Components

| Component | Quantity | Purpose |
|-----------|----------|---------|
| Arduino Uno / Raspberry Pi | 1 | Main controller |
| DHT11/DHT22 Sensor | 1 | Temperature & Humidity |
| LDR (Light Dependent Resistor) | 1 | Light intensity |
| HC-SR04 Ultrasonic Sensor | 1 | Distance measurement |
| Servo Motor | 1 | Automatic door opening |
| 4x3 Matrix Keypad | 1 | PIN entry |
| Relay Module | 1 | Fan/Light control |
| Buzzer | 1 | Alert notifications |
| LEDs | 2 | Status indicators |
| Jumper Wires & Breadboard | - | Circuit connections |

## 💻 Software Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Django | 4.2 | Web framework |
| Django REST Framework | 3.14 | API development |
| Django Channels | 4.0 | WebSocket support |
| PostgreSQL | 14+ | Production database |
| SQLite | - | Development database |
| JWT | 5.3 | Authentication |
| OpenCV | 4.x | Camera streaming |
| PySerial | 3.5 | Serial communication |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18 | UI framework |
| Vite | 4.x | Build tool |
| TailwindCSS | 3.x | Styling |
| React Router | 6 | Navigation |
| Recharts | 2.x | Data visualization |
| Axios | 1.x | HTTP client |
| Socket.io-client | 4.x | WebSocket client |
| React Hot Toast | 2.x | Notifications |

## 📋 Prerequisites

### Hardware Requirements
- Arduino Uno/Nano/Mega or Raspberry Pi
- Sensors and actuators listed above
- USB cable for programming
- Power supply (5V/12V as needed)

### Software Requirements
- Python 3.9 or higher
- Node.js 18 or higher
- npm or yarn package manager
- Git
- PostgreSQL (optional for production)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/smart-home-automation-system.git
cd smart-home-automation-system
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your configuration

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Create camera device (for webcam)
python manage.py shell
# Navigate to frontend directory (from root)
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your API URL
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000
