import serial
import requests
import threading

url = 'http://localhost:3001'  # Adjust the URL if your Node.js server runs on a different port
ser = serial.Serial('COM11', 115200)  # Replace 'COMx' with your actual serial port

def send_request(data):
    response = requests.post(url, data=data)
    print('Response:', response.text)

while True:
    data = ser.readline().decode().strip()
    print('RFID Data:', data)
    # Process RFID data here
    # Send the request in a separate thread to make it non-blocking
    try:
        threading.Thread(target=send_request, args=(data,)).start()
    except:
        print("Oops")

