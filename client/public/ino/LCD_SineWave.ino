#include <LiquidCrystal.h>

LiquidCrystal lcd(12, 11, 5, 4, 3, 2); 

const int columns = 16;
const float sampleRate = 50.0;  
const float twoPi = 6.28318530718;
float globalPhase = 0.0;  
bool enableWaveMovement = true;

int micPin = A0;  

byte waveShapes[8][8] = {
  {0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b11111},  // Lowest
  {0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b11111, 0b11111},
  {0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b11111, 0b11111, 0b11111},
  {0b00000, 0b00000, 0b00000, 0b00000, 0b11111, 0b11111, 0b11111, 0b11111},
  {0b00000, 0b00000, 0b00000, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111},
  {0b00000, 0b00000, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111},
  {0b00000, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111},
  {0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111}   // Highest
};

void setup() {
  lcd.begin(16, 2); 
  pinMode(A0, INPUT);
  Serial.begin(9600);

  for (int i = 0; i < 8; i++) {
    lcd.createChar(i, waveShapes[i]);
  }
}

void loop() {
  int mn = 1024;
  int mx = 0;

  for (int i = 0; i < 100; ++i) {
    int val = analogRead(micPin);
    mn = min(mn, val);
    mx = max(mx, val);
  }

  int delta = mx - mn;

  Serial.println(delta);
  int sineFrequency = map(delta, 0, 1023, 50, 1000); 
  float phaseIncrement = twoPi * sineFrequency / sampleRate;  

  for (int col = 0; col < columns; col++) {
    float currentAngle = enableWaveMovement ? globalPhase + phaseIncrement * col : phaseIncrement * col;
    float sineValue = sin(currentAngle);
    int waveIndex = map((int)(sineValue * 100), -100, 100, 0, 7);

    lcd.setCursor(col, 0);
    lcd.write(byte(waveIndex));
  }

  if (enableWaveMovement) {
    globalPhase += phaseIncrement;
    if (globalPhase >= twoPi) {
      globalPhase -= twoPi;  
    }
  }

  float decibel = 20 * log10(delta / 10.0 + 0.1); 
  lcd.setCursor(0, 1);
  lcd.print("f:");
  lcd.print(sineFrequency);
  lcd.print(" dB:");
  lcd.print((int)decibel);

  delay(1000 / sampleRate);
}

int map(int x, int in_min, int in_max, int out_min, int out_max) {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
