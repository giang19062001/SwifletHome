#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "DHT.h"
#include "ACS712.h"
#include <WiFi.h>
#include <PubSubClient.h>

// ====== WIFI ======
char ssid[] = "Dreamplex";
char pass[] = "Dreamchaser";

// ====== MQTT ======
const char* mqttServer = "103.77.160.68";
// const char* mqttServer = "172.16.20.134"; // localhost
const char* mqttClientId = "MAC-USR000001-HOM000003";
const int mqttPort = 1883;

// Topic dữ liệu cảm biến
String dataTopic = String("sensor/") + mqttClientId + "/data";
// Topic trạng thái online/offline
String statusTopic = String("sensor/") + mqttClientId + "/status";

WiFiClient espClient;
PubSubClient mqttClient(espClient);

// ====== OLED ======
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define SDA_PIN 8
#define SCL_PIN 9
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// ====== DHT11 ======
#define DHTPIN 2
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// ====== ACS712 - GPIO4 ======
ACS712 ACS(4, 3.3, 4095, 185);
float zeroOffset = 0;

// ====== Timer ======
unsigned long previousMillis = 0;
const long interval = 3000;  // 3 giây

// ====== CALIBRATE ======
void calibrateZeroCurrent() {
  const int N = 1000;
  float sum = 0;

  Serial.println("Calibrating...");

  for (int i = 0; i < N; i++) {
    sum += ACS.mA_DC();
    delay(2);
  }

  zeroOffset = sum / N;
  Serial.print("Zero offset = ");
  Serial.println(zeroOffset);
}

// ====== READ CURRENT ======
float readCurrent() {
  const int N = 100;
  float sum = 0;

  for (int i = 0; i < N; i++) {
    sum += ACS.mA_DC();
    delay(2);
  }

  float current = (sum / N) - zeroOffset;

  if (current < 100) current = 0;

  return current;
}

// ====== MQTT RECONNECT & LWT ======
void connectMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("Connecting to MQTT broker... ");

    // === LAST WILL AND TESTAMENT ===
    // Nếu mất kết nối đột ngột -> broker sẽ tự publish "offline"
    if (mqttClient.connect(mqttClientId,
                            statusTopic.c_str(),  // topic
                            1,                    // Đảm bảo broker NHẤT ĐỊNH nhận được tin "offline" này khi sensor thật sự offine dù cho bất kì lỗi nào xảy ra ( lỗi mạng,...)
                            true,                 // retain = true -> Broker LUÔN GIỮ dữ liệu mới nhất trên topic đó
                            "offline")) {         // payload khi mất kết nối
      Serial.println("OK");

      // kết nối thành công báo -> 'ONLINE'
      mqttClient.publish(statusTopic.c_str(), "online", true); // retain = true
      Serial.println("Published online status (retained)");
    } else {
      Serial.print("Failed, rc=");
      Serial.println(mqttClient.state());
      Serial.println("Retry in 3 seconds...");
      delay(3000);
    }
  }
}

// ====== SEND SENSOR DATA ======
void sendSensorData() {
  // Đọc DHT11
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (isnan(h) || isnan(t)) {
    Serial.println("Failed to read from DHT sensor!");
    h = 0;
    t = 0;
  }

  // Đọc dòng điện
  float current = readCurrent();

  // Hiển thị OLED
  display.clearDisplay();
  display.setTextSize(2);
  display.setCursor(0, 0);
  display.printf("T: %.1fC\n", t);

  display.setCursor(0, 20);
  display.printf("H: %.0f%%\n", h);

  display.setCursor(0, 45);
  display.printf("I: %.0fmA\n", current);

  display.display();

  // Tạo JSON payload
  char payload[128];
  snprintf(payload, sizeof(payload),
           "{\"temperature\":%.1f,\"humidity\":%.0f,\"current\":%.0f}",
           t, h, current);

  // Publish dữ liệu cảm biến
  bool published = mqttClient.publish(dataTopic.c_str(), payload);

  Serial.print("MQTT sent to ");
  Serial.print(dataTopic);
  Serial.print(": ");
  Serial.println(published ? payload : "FAILED");
}

// ====== SETUP ======
void setup() {
  Serial.begin(115200);
  delay(1000);

  // Khởi động I2C cho OLED
  Wire.begin(SDA_PIN, SCL_PIN);

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("SSD1306 allocation failed"));
    for (;;);
  }
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.display();

  // Khởi động cảm biến
  dht.begin();
  calibrateZeroCurrent();

  // Kết nối WiFi
  WiFi.begin(ssid, pass);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  // Cấu hình MQTT
  mqttClient.setServer(mqttServer, mqttPort);

  // Kết nối MQTT lần đầu (có LWT)
  connectMQTT();

  // Gửi dữ liệu lần đầu tiên
  sendSensorData();
}


// ====== LOOP ======
void loop() {
  // Đảm bảo kết nối MQTT luôn sống
  if (!mqttClient.connected()) {
    connectMQTT();
  }
  mqttClient.loop(); // Xử lý keep-alive, reconnect tự động

  // Gửi dữ liệu định kỳ
  unsigned long now = millis();
  if (now - previousMillis >= interval) {
    previousMillis = now;
    sendSensorData();
  }
}