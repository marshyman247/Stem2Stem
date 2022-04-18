#include <SPI.h>
#include <nRF24L01.h>
#include <RF24.h>


#define CE_PIN   2
#define CSN_PIN 10
#define STRMAX 32

//Radio Setup
const byte slaveAddress[5] = {'M', 'A', 'R', 'S', 'H'};
const uint32_t SPI_SPEED = 500000 ; // 500000 Hz
RF24 radio(CE_PIN, CSN_PIN, SPI_SPEED);

//Communication Setup
char dataReceived[STRMAX]; 

void setup() {
  Serial.begin(9600);
}

void loop() {
  if ( radio.available() ) {
    radio.read( &dataReceived, sizeof(dataReceived) );
    Serial.print(dataReceived);
    Serial.println();
    delay(2000);
  }
}
void radioSetup(){
  radio.begin();
  radio.setDataRate( RF24_250KBPS );
  radio.openReadingPipe(1, slaveAddress);
  radio.setRetries(3, 5); // delay, count
  radio.startListening();
}
