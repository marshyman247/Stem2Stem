#include <ArduinoJson.h>
#include <nRF24L01.h>
#include <RF24.h>
#include <SPI.h>
#include <DHT.h>

#define DHTPIN 3
#define DHTTYPE DHT22
#define STRMAX 32
#define CE_PIN   2
#define CSN_PIN 10


//Radio Setup
const byte slaveAddress[5] = {'M', 'A', 'R', 'S', 'H'};
const byte masterAddress[5] = {'B', 'R', 'O', 'W', 'N'};
const uint32_t SPI_SPEED = 500000 ; // 500000 Hz
RF24 radio(CE_PIN, CSN_PIN, SPI_SPEED);

//Sensor Setup
const int soilPin = A0;
const int LDRPin = A2;
DHT tempPin(DHTPIN, DHTTYPE);
double soilMoisture, light, temperature = 0;

//Pump Setup
const int pumpPin = 9;
double wateringMoisture;
double minMoisture = 0;
unsigned long waterStart;
unsigned long waterStop;

//Communication Setup
char dataToSend[STRMAX];
char dataReceived[STRMAX];
bool failFlag = false;
unsigned long currentMillis;
unsigned long prevMillis;
int failCount = 0;

void setup() {
  Serial.begin(9600);
  tempPin.begin();
  pinMode(pumpPin, OUTPUT);
  radioSetup();

}
void loop() {
  if ( radio.available() ) {
    receive();
  }
  DynamicJsonDocument jsonToSend(1024);
  //DATA READINGS
  for (int i = 0; i <= 100; i++)
  {
    soilMoisture += analogRead(soilPin);
    light += analogRead(LDRPin);
    temperature += tempPin.readTemperature();
    delay(1);
  }

  temperature = round((double)temperature / 100);
  light = round((double)light / 100);
  soilMoisture = round((double)soilMoisture / 100);
  soilMoisture = round(soilMoisture * 100 / 1023);
  jsonToSend["M"] = soilMoisture;
  jsonToSend["L"] = light;
  jsonToSend["T"] = temperature;
  serializeJson(jsonToSend, dataToSend);
  unsigned long txIntervalMillis = failFlag == false ? 30000 : 1000;
  currentMillis = millis();
  if (currentMillis - prevMillis >= txIntervalMillis) {
    send();
    prevMillis = millis();
  }
  jsonToSend.clear();
}
void send() {
  radio.stopListening();
  bool rslt;
  rslt = radio.write( &dataToSend, sizeof(dataToSend) );
  radio.startListening();

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
    if (failCount >= 5) {
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
  radio.openReadingPipe(1, masterAddress);
  radio.startListening();

}
void receive() {
  DynamicJsonDocument jsonReceived(1024);
  //INCOMMING COMMAND
  Serial.println("RADIO AVAILABLE");
  radio.read( &dataReceived, sizeof(dataReceived) );
  if ((dataReceived != NULL) || (dataReceived[0] != '\0') || (dataReceived != " ") || (dataReceived != "")) { //If Command Received
    Serial.println("DATA NOT NULL");
    Serial.println(dataReceived);
    deserializeJson(jsonReceived, dataReceived);
    String command = jsonReceived["Command"];
    if (command == "Water") {
      Serial.println("WATER COMMAND");
      //Water Plants Mode Of Operation.
      minMoisture = jsonReceived["minM"];
      wateringMoisture = analogRead(soilPin);
      Serial.println(wateringMoisture);
      if (wateringMoisture < minMoisture) { //If Plant Needs Watering
        waterStart = millis();
        waterStop = millis();
        digitalWrite(pumpPin, HIGH);
        while (waterStop - waterStart < 2000 && wateringMoisture < minMoisture) {
          //Power WaterPump
          Serial.println("PUMPING WATER ");
          waterStop = millis();
          Serial.print("Value: ");
          Serial.print(wateringMoisture);
          Serial.print("   Time: " );
          Serial.println(waterStop - waterStart);
          delay(500);
          wateringMoisture = analogRead(soilPin);
        }
        digitalWrite(pumpPin, LOW);

      } else {
        //Plant Does Not Need Water
        digitalWrite(pumpPin, LOW);
        Serial.println("WATER UNNECESSARY");
      }
      digitalWrite(pumpPin, LOW);
      waterStart = 0;
      waterStop  = 0;
      Serial.println("WATER EXIT");

    }
    command = "";
    jsonReceived.clear();

  }


}
