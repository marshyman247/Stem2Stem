#include <SPI.h>
#include <nRF24L01.h>
#include <RF24.h>

#define CE_PIN   2
#define CSN_PIN 10
#define STRMAX 32

//Radio Setup
const byte masterAddress[5] = {'M', 'A', 'R', 'S', 'H'};
const byte slaveAddress[5] =   {'B', 'R', 'O', 'W', 'N'};
const uint32_t SPI_SPEED = 500000 ; // 500000 Hz
RF24 radio(CE_PIN, CSN_PIN, SPI_SPEED);

//Communication Setup
char dataReceived[STRMAX]; 
char dataToSend[STRMAX];
bool failFlag = false;
int failCount = 0;
void setup() {
  Serial.begin(9600);
  radioSetup();
}

void loop() {
  if (Serial.available()) {
    delay(10);
    int availableBytes = Serial.available();
    for (int i = 0; i < availableBytes; i++)
    {
      dataToSend[i] = Serial.read();
    }
    send();
  }
  if ( radio.available() ) {
    radio.read( &dataReceived, sizeof(dataReceived) );
    Serial.print(dataReceived);
    Serial.println();
    delay(2000);
  }
}
void radioSetup() {
  radio.begin();
  radio.setDataRate( RF24_250KBPS );
  radio.openWritingPipe(slaveAddress);
  radio.openReadingPipe(1, masterAddress);
  radio.setRetries(3, 5); // delay, count
  radio.startListening();
}
void send() {
  radio.stopListening();
  Serial.println(dataToSend);
  bool rslt;
  rslt = radio.write( dataToSend, strlen(dataToSend) );
  radio.startListening();
  if (rslt) {
    failFlag = false;
    failCount = 0;
  }
  else {
    failFlag = true;
    failCount ++;
    if (failCount >= 5) {
      radio.powerDown();
      delay(5000);
      radio.powerUp();
    }
  }
}
