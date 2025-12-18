yarn run start:dev

# MQTT
sudo apt update
sudo apt upgrade -y

# Cài Mosquitto broker và client
sudo apt install mosquitto mosquitto-clients -y

# Kích hoạt để Mosquitto tự chạy khi boot máy
sudo systemctl enable mosquitto

# Khởi động Mosquitto 
sudo systemctl start mosquitto

# Kiểm tra trạng thái
sudo systemctl status mosquitto

# Cho phép port 1883 (MQTT)
sudo ufw allow 1883/tcp


# kiểm tra MQTT
sudo ss -tuln | grep 1883

# cho phép kết nối MQTT từ bên ngoài
sudo nano /etc/mosquitto/mosquitto.d

# thêm nội dung
listener 1883
bind_address 0.0.0.0
allow_anonymous true  

# Khởi động lại Mosquitto 
sudo systemctl restart mosquitto