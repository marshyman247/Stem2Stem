#include <ArduinoJson.h>
#include <nRF24L01.h>
#include <RF24.h>
#include <SPI.h>

#define STRMAX 32
#define CE_PIN   2
#define CSN_PIN 10

//Radio Setup
const byte slaveAddress[5] = {'M', 'A', 'R', 'S', 'H'};
const uint32_t SPI_SPEED = 500000 ; // 500000 Hz
RF24 radio(CE_PIN, CSN_PIN, SPI_SPEED);

//Sensor Setup
const int soilPin = A0;
const int LDRPin = A2;
const int tempPin = A3;
double soilMoisture, light, temperature = 0;

//Communication Setup
char dataToSend[STRMAX];
bool failFlag = false;
unsigned long currentMillis;
unsigned long prevMillis;
unsigned long failMillis;
int failCount = 0;

void setup() {
  Serial.begin(9600);
  radioSetup();

}
void loop() {
  DynamicJsonDocument json(1024);
    for (int i = 0; i <= 100; i++) 
  { 
  soilMoisture += analogRead(soilPin);
  light += analogRead(LDRPin);
  temperature += analogRead(tempPin);
  delay(1);
  }
  temperature = round((double)temperature /100);
  light = round((double)light /100);
  soilMoisture = round((double)soilMoisture /100);
  temperature *= 3300 / 1024;
  temperature = (temperature - 500)/10;
  soilMoisture = round(soilMoisture * 100/1024);
  json["M"] = soilMoisture;
  json["L"] = light;
  json["T"] = temperature;
  serializeJson(json, dataToSend);
  unsigned long txIntervalMillis = failFlag == false ? 1800000 : 1000; 
  currentMillis = millis();
  if (currentMillis - prevMillis >= txIntervalMillis) {
    send();
    prevMillis = millis();
  }
  json.clear();
}
void send() {
  bool rslt; 
  rslt = radio.write( &dataToSend, sizeof(dataToSend) );
  Serial.print("Data Sent ");
  Serial.print(dataToSend);
  if (rslt) {
    Serial.println("  Acknowledge received");
    failFlag = false;
    failCount = 0;
  }
  else {
    Serial.println("  Send Failed");
    failFlag = true;
    failCount ++;
    if(failCount >= 5){
      Serial.println("Radio Timeout: Power Down");
      radio.powerDown();
      delay(5000);
      Serial.println("Radio Timeout: Power Up");
      radio.powerUp();
      }
  }
}
void radioSetup() {
  radio.begin();
  radio.setDataRate( RF24_250KBPS );
  radio.setRetries(3, 5); // delay, count
  radio.openWritingPipe(slaveAddress);
}
