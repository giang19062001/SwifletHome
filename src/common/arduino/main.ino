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
// const char* mqttServer = "103.77.160.68";
const char* mqttServer = "172.16.20.134"; // localhost
const char* mqttClientId = "MAC-USR000001-HOM000003";
const int mqttPort = 1883;
String mqttTopic = String("sensor/") + mqttClientId + "/data";

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

  if (current < 50) current = 0;

  return current;
}

// ====== MQTT CONNECT ======
void connectMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("Connecting MQTT...");
    if (mqttClient.connect(mqttClientId)) {
      Serial.println("OK");
    } else {
      Serial.print("Failed, rc=");
      Serial.println(mqttClient.state());
      delay(3000);
    }
  }
}

// ====== SEND DATA ======
void sendSensorData() {
  // DHT11
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  if (isnan(h) || isnan(t)) {
    h = 0;
    t = 0;
  }

  // Current
  float current = readCurrent();

  // OLED
  display.clearDisplay();
  display.setTextSize(2);

  display.setCursor(0, 0);
  display.printf("T: %.1fC\n", t);

  display.setCursor(0, 20);
  display.printf("H: %.0f%%\n", h);

  display.setCursor(0, 45);
  display.printf("I: %.0fmA\n", current);

  display.display();

  // MQTT JSON
  char payload[128];
  snprintf(payload, sizeof(payload),
           "{\"temperature\":%.1f,\"humidity\":%.0f,\"current\":%.0f}",
           t, h, current);

  mqttClient.publish(mqttTopic.c_str(), payload);

  Serial.print("MQTT sent: ");
  Serial.println(payload);
}

// ====== SETUP ======
void setup() {
  Serial.begin(115200);
  delay(1000);

  Wire.begin(SDA_PIN, SCL_PIN);

  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.setTextColor(SSD1306_WHITE);

  dht.begin();
  calibrateZeroCurrent();

  // WiFi
  WiFi.begin(ssid, pass);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected");
  Serial.println(WiFi.localIP());

  // MQTT
  mqttClient.setServer(mqttServer, mqttPort);
  connectMQTT();

  sendSensorData();
}

// ====== LOOP ======
void loop() {
  if (!mqttClient.connected()) {
    connectMQTT();
  }
  mqttClient.loop();

  unsigned long now = millis();
  if (now - previousMillis >= interval) {
    previousMillis = now;
    sendSensorData();
  }
}
