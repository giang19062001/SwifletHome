yarn run start:dev

# MQTT
sudo apt update
sudo apt upgrade -y

# Cài Mosquitto broker và client
sudo apt install mosquitto mosquitto-clients -y

# Kích hoạt để Mosquitto tự chạy khi boot máy
sudo systemctl enable mosquitto

# Khởi động Mosquitto ngay
sudo systemctl start mosquitto

# Kiểm tra trạng thái (phải thấy "active (running)")
sudo systemctl status mosquitto

# Cho phép port 1883 (MQTT)
sudo ufw allow 1883/tcp