int raw;
int minimum = 1023;
int maximum;
void setup() {
  Serial.begin(9600);
}

void loop() {
  raw = analogRead(A2);
  if (raw > maximum) {
    maximum = raw;
  }
  if (raw < minimum) {
    minimum = raw;
  }
  Serial.print("MAX: ");
  Serial.print(maximum);
  Serial.print("   MIN: ");
  Serial.println(minimum);
  delay(500);
}
