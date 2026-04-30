"""
Serial communication handler for Arduino
"""
import serial
import threading
import time
import logging
from django.conf import settings

logger = logging.getLogger(__name__)


class SerialHandler:
    _instance = None
    _instance_lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._instance_lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        self.serial_conn = None
        self.is_connected = False
        self.receive_thread = None
        self.running = False
        self.callbacks = []
        self._serial_lock = threading.Lock()
        self._connect_lock = threading.Lock()
        self._initialized = True

    def connect(self):
        """Connect to Arduino lazily and safely"""
        with self._connect_lock:
            if self.is_connected and self.serial_conn and self.serial_conn.is_open:
                return True

            try:
                self.serial_conn = serial.Serial(
                    port=settings.ARDUINO_PORT,
                    baudrate=settings.ARDUINO_BAUD,
                    timeout=1
                )
                time.sleep(2)

                self.is_connected = True
                self.running = True

                if self.receive_thread is None or not self.receive_thread.is_alive():
                    self.receive_thread = threading.Thread(target=self._receive_data, daemon=True)
                    self.receive_thread.start()

                logger.info(f"Connected to Arduino on {settings.ARDUINO_PORT}")
                return True

            except Exception as e:
                logger.error(f"Failed to connect to Arduino: {e}")
                self.is_connected = False
                self.serial_conn = None
                return False

    def _receive_data(self):
        """Receive data from Arduino"""
        while self.running:
            try:
                if self.serial_conn and self.serial_conn.is_open and self.serial_conn.in_waiting:
                    line = self.serial_conn.readline().decode('utf-8', errors='ignore').strip()
                    if line:
                        self._process_data(line)
            except Exception as e:
                logger.error(f"Error receiving data: {e}")
                self.is_connected = False
            time.sleep(0.1)

    def _process_data(self, data):
        logger.debug(f"Received from Arduino: {data}")
        for callback in self.callbacks:
            try:
                callback(data)
            except Exception as e:
                logger.error(f"Error in callback: {e}")

    def send_command(self, command):
        """Send command to Arduino"""
        try:
            if not self.is_connected or not self.serial_conn or not self.serial_conn.is_open:
                if not self.connect():
                    return False

            with self._serial_lock:
                self.serial_conn.write(f"{command}\n".encode())
                logger.info(f"Sent command: {command}")
                return True

        except Exception as e:
            logger.error(f"Error sending command: {e}")
            self.is_connected = False
            return False

    def register_callback(self, callback):
        if callback not in self.callbacks:
            self.callbacks.append(callback)

    def disconnect(self):
        self.running = False
        if self.serial_conn and self.serial_conn.is_open:
            self.serial_conn.close()
        self.is_connected = False

    def get_status(self):
        return {
            'connected': self.is_connected,
            'port': settings.ARDUINO_PORT if self.is_connected else None
        }


class Commands:
    LIGHT_ON = "LIGHT_ON"
    LIGHT_OFF = "LIGHT_OFF"
    FAN_ON = "FAN_ON"
    FAN_OFF = "FAN_OFF"
    DOOR_OPEN = "DOOR_OPEN"
    DOOR_CLOSE = "DOOR_CLOSE"
    DOOR_LOCK = "DOOR_LOCK"
    DOOR_UNLOCK = "DOOR_UNLOCK"
    ENABLE_AUTO = "AUTO_ON"
    DISABLE_AUTO = "AUTO_OFF"
    EMERGENCY_LOCK = "EMERGENCY"
    SET_TEMP_THRESHOLD = "TEMP_THRESHOLD:{}"
    SET_LIGHT_THRESHOLD = "LIGHT_THRESHOLD:{}"
    REQUEST_STATUS = "STATUS"
    REQUEST_SENSORS = "SENSORS"