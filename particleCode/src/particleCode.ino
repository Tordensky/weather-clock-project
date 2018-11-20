#include <AccelStepper.h>
#include <ArduinoJson.h>
#include <Adafruit_DHT.h>

//  IKONER
const int UKJENT_TILSTAND     = -1;
const int IKON_SOL            = 1;
const int IKON_SOL_BAK_SKY    = 2;
const int IKON_OVERSKYET      = 3;
const int IKON_REGN           = 4;
const int IKON_LYN            = 5;
const int IKON_SNOW           = 6;


const int POSITION_UKJENT_TILSTAND     = -100;
const int POSITION_IKON_SOL            = 0;
const int POSITION_IKON_SOL_BAK_SKY    = 350;
const int POSITION_IKON_OVERSKYET      = 700;
const int POSITION_IKON_REGN           = 1024;
const int POSITION_IKON_LYN            = 1400;
const int POSITION_IKON_SNOW           = 1750;



const int stepsPerRevolution = 2046;

// initialize the stepper library on pins 8 through 11:
AccelStepper stepper(AccelStepper::FULL4WIRE, D1, D3, D2, D4);

int currentPosition = 0;
int STEPS_PER_ROTATION = 2024;
int MAX_SPEED = 300.0;
int ACCELERATION_SPEED = 60;

// DHT SENSOR
#define DHTPIN 5
#define DHTTYPE DHT22

double tempCelcius = 0.0;
double humidity = 0.0;
DHT dht(DHTPIN, DHTTYPE);

// HOME BUTTON
int buttonPin = D0;
int HOME_OFFSETT = -50;

// STATES
int MODE_INIT_HOME_BUTTON = 0;
int MODE_INIT_STEPPER = 1;
int MODE_READY = 2;

int currentMode = MODE_INIT_STEPPER;
int waitMillis = 0;
int currentIcon = -1;

void setup() {
    Particle.function("ping", ping);
    Particle.function("rerunInit", rerunInit);
    Particle.function("goto", gotoIcon);
    Particle.function("getWeather", getWeather);
    Particle.function("doMeasure", doMeasure);

    stepper.setMaxSpeed(MAX_SPEED);
    stepper.setSpeed(MAX_SPEED);
    stepper.setAcceleration(MAX_SPEED);


    Particle.variable("currentIcon", currentIcon);

    Particle.variable("temp", tempCelcius);
    Particle.variable("humidity", humidity);
	dht.begin();

    // Subscribe to the integration response event
    //Particle.subscribe("hook-response/GetWeatherData", myHandler, MY_DEVICES);

    // Init home button
    pinMode( buttonPin , INPUT_PULLUP);
    initClock();
}


void initClock() {
    waitMillis = 0;

    // Move away from button before reset home position
    int buttonState = digitalRead( buttonPin );
    if (buttonState == LOW) {
        currentMode = MODE_INIT_HOME_BUTTON;
    } else {
        currentMode = MODE_INIT_STEPPER;
    }
}

void loop() {
    // Set Stepper home position
    if (currentMode == MODE_INIT_HOME_BUTTON) {
        stepper.enableOutputs();
        stepper.runToNewPosition(400);
        stepper.disableOutputs();
        currentMode = MODE_INIT_STEPPER;
    } else if (currentMode == MODE_INIT_STEPPER) {
        stepper.enableOutputs();
        stepper.moveTo(6000);
        int buttonState = digitalRead( buttonPin );
        if (buttonState == LOW) {
            stepper.setCurrentPosition(HOME_OFFSETT);
            currentPosition = HOME_OFFSETT;
            stepper.disableOutputs();
            stepper.setAcceleration(ACCELERATION_SPEED);
            gotoIcon("1");
            //testAllIkons();
            currentMode = MODE_READY;
        } else if (stepper.distanceToGo() == 0) {
            stepper.disableOutputs();
        }
    } else {
        // Trigger the integration
        if (waitMillis < millis()) {
            getWeatherInternal();
            waitMillis = millis() + 240000;
        }
    }

    stepper.run();
}

void getWeatherInternal() {
    int res = doMeasure("");
    if (res == 0) {
        char eventData[64];
        sprintf(eventData, "{\"temp\": %.2f, \"humidity\": %.2f}", tempCelcius, humidity);
        Particle.publish("GetWeatherData", eventData, PRIVATE);
    } else {
        Particle.publish("GetWeatherData", "", PRIVATE);
    }
}

void testAllIkons() {
    stepper.enableOutputs();
    stepper.runToNewPosition(-POSITION_IKON_SOL);
    delay(1000);
    stepper.runToNewPosition(-POSITION_IKON_SOL_BAK_SKY);
    delay(1000);
    stepper.runToNewPosition(-POSITION_IKON_OVERSKYET);
    delay(1000);
    stepper.runToNewPosition(-POSITION_IKON_REGN);
    delay(1000);
    stepper.runToNewPosition(-POSITION_IKON_SNOW);
    delay(1000);
    stepper.runToNewPosition(-POSITION_IKON_LYN);
    delay(1000);
    stepper.runToNewPosition(-POSITION_IKON_SOL);
    stepper.disableOutputs();
}


void myHandler(const char *event, const char *json) {
    StaticJsonBuffer<600> jsonBuffer;
    JsonObject& root = jsonBuffer.parseObject(json);

    if (!root.success()) {
        Particle.publish("Received-Result-FAILED", json, PRIVATE);
        return;
    }

    const char* weather = root["text"];
    const int iconNumber = root["icon"];
    motorController(iconNumber);
    Particle.publish("Received-Result", weather, PRIVATE);
}

int getPositionForIcon(int iconNumber) {
    if (iconNumber == UKJENT_TILSTAND) { // UKJENT
        return POSITION_UKJENT_TILSTAND;
    } else if (iconNumber == IKON_SOL) { // SOL
        return POSITION_IKON_SOL;
    } else if (iconNumber == IKON_SOL_BAK_SKY) { // SOL bak sky
        return POSITION_IKON_SOL_BAK_SKY;
    } else if (iconNumber == IKON_OVERSKYET) { // Overskyet
        return POSITION_IKON_OVERSKYET;
    } else if (iconNumber == IKON_REGN) { // Regn
        return POSITION_IKON_REGN;
    } else if (iconNumber == IKON_LYN) { // Lyn
        return POSITION_IKON_LYN;
    } else if (iconNumber == IKON_SNOW) { // Snø
        return POSITION_IKON_SNOW;
    } else {
        return POSITION_UKJENT_TILSTAND;
    }
}

void motorController(int iconNumber) {
    currentIcon = iconNumber;
    int positionForIcon = getPositionForIcon(iconNumber);
    int deltaCurPos =  positionForIcon - currentPosition;
    currentPosition = (currentPosition + deltaCurPos) % STEPS_PER_ROTATION;

    Particle.publish("Viser ikon", String(iconNumber), PRIVATE);

    stepper.enableOutputs();
    stepper.runToNewPosition(-currentPosition);
    stepper.disableOutputs();

}

int gotoIcon(String command) {
    int iconNumber = atoi(command);
    motorController(iconNumber);
    return 0;
}

int rerunInit(String command) {
    initClock();
    return 0;
}

int getWeather(String command) {
    getWeatherInternal();
    return 0;
}

int doMeasure(String command) {
    float t = dht.getTempCelcius();
    float h = dht.getHumidity();
    if (!isnan(h) && !isnan(t)) {
        tempCelcius = t;
        humidity = h;
        char eventData[64];
        sprintf(eventData, "{\"temp\": %.2f, \"humidity\": %.2f}", tempCelcius, humidity);
        Particle.publish("Reading", eventData);
        return 0;
    }

    return -1;
}

int ping(String command) {
    stepper.enableOutputs();
    stepper.setSpeed(500);
    stepper.setAcceleration(500);
    for (int i = 0; i < 2; i += 1) {
        stepper.runToNewPosition(-(currentPosition + 100));
        stepper.runToNewPosition(-(currentPosition - 100));
    }
    stepper.runToNewPosition(-(currentPosition));
    stepper.setAcceleration(ACCELERATION_SPEED);
    stepper.disableOutputs();

    return 0;
}

