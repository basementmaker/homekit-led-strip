const gpio = require('pigpio').Gpio;
const hap = require("hap-nodejs");

const Accessory = hap.Accessory;
const Characteristic = hap.Characteristic;
const CharacteristicEventTypes = hap.CharacteristicEventTypes;
const Service = hap.Service;

const accessoryUuid = hap.uuid.generate("basementmaker.projects.ledstrip");
const accessory = new Accessory("LED Strip Accesssory", accessoryUuid);

const lightService = new Service.Lightbulb("LED Strip");

const onCharacteristic = lightService.getCharacteristic(Characteristic.On);
const brightnessCharacteristic = lightService.getCharacteristic(Characteristic.Brightness);

var showLogging = false;
var LEDstripStatusIsOn = false;
var currentLEDbrightness = 0;
var ledStripGPIOpin = new gpio(17, {mode: gpio.OUTPUT});

ledStripGPIOpin.pwmWrite(0);

onCharacteristic.on(CharacteristicEventTypes.GET, callback => {
  if (showLogging) { console.log("Is LED Strip On?: " + LEDstripStatusIsOn); }
  callback(undefined, LEDstripStatusIsOn);
});

onCharacteristic.on(CharacteristicEventTypes.SET, (value, callback) => {
  if (showLogging) { console.log("Setting LED Strip On: " + value); }
  if ( value == true && LEDstripStatusIsOn == false) {
    if ( currentLEDbrightness == 0 ) {
      ledStripGPIOpin.pwmWrite(255);
    } else {
      ledStripGPIOpin.pwmWrite(currentLEDbrightness);
    }
  } else if ( value == false ) {
    ledStripGPIOpin.pwmWrite(0);
  } else {
    // do nothing
  }
  LEDstripStatusIsOn = value;
  callback();
});

brightnessCharacteristic.on(CharacteristicEventTypes.GET, (callback) => {
  if (showLogging) { console.log("Current Strip brightness level?: " + currentLEDbrightness); }
  callback(undefined, currentLEDbrightness);
});

brightnessCharacteristic.on(CharacteristicEventTypes.SET, (value, callback) => {
  if (showLogging) { console.log("Setting Strip brightness level to: " + value); }
  var val = parseInt(255*(value/100), 10);
  ledStripGPIOpin.pwmWrite(val);
  currentLEDbrightness = Math.ceil((val/255)*100);
  callback();
});

accessory.addService(lightService);

accessory.publish({
  username: "BB:00:00:00:00:01",
  pincode: "000-00-123",
  port: 47129,
  category: hap.Categories.LIGHTBULB
});

if (showLogging) { console.log("Accessory setup finished!"); }
