#include <LiquidCrystal.h>

// Initialize the LCD
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);  // RS, E, D4, D5, D6, D7

const int columns = 16;
const float sampleRate = 50.0;  // Sampling rate in Hz (lower for visual effect)
const float twoPi = 6.28318530718;
const float phaseIncrement = twoPi / columns;
float globalPhase = 0.0;  // Global phase to shift the wave
int sineFrequency = 293;  // Frequency of sine wave in Hz

// Custom characters for different wave heights
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
  lcd.begin(16, 2);  // Set up the LCD's number of columns and rows

  // Create custom characters
  for (int i = 0; i < 8; i++) {
    lcd.createChar(i, waveShapes[i]);
  }
}

void loop() {
  for (int col = 0; col < columns; col++) {
    float currentAngle = globalPhase + phaseIncrement * col;
    float sineValue = sin(currentAngle);
    int waveIndex = map((int)(sineValue * 100), -100, 100, 0, 7);

    lcd.setCursor(col, 0);
    lcd.write(byte(waveIndex));
  }

  globalPhase += phaseIncrement;
  if (globalPhase >= twoPi) {
    globalPhase -= twoPi;
  }

  // Display the frequency and decibel on the second line
  float decibel = 20 * log10(abs(sin(globalPhase) + 0.1));  // Calculate decibel from amplitude
  lcd.setCursor(0, 1);
  lcd.print("FREQ:");
  lcd.print(sineFrequency);
  lcd.print(" DEC:");
  lcd.print((int)decibel);

  delay(1000 / sampleRate);
}

int map(int x, int in_min, int in_max, int out_min, int out_max) {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
