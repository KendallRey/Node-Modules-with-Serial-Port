# Some Electronic Sensor run in Node with Serial Port
Just a reference of code for when I need it... someday

## Pre-requisites
1. Install the packages:
```bash
npm install
```
2. Create `.env` for environment variables.

### GSM SIM800L
- `GSM Module`, `SMS`, `Message`, `SIM Card`, `Call`, `Text`
- Module used:
  - USB to TTL Serial Adapter CH340 Chip Converter Module (see CH340.png in assets)
  - SIM800L V2 5V Wireless GSM GPRS Module (see SIM800L.png in assets)
- Create `.env` in project root directory:
  - `GSM_PORT_NAME` -> COM name, see from Serial Monitor, e.g. "COM8"
  - `GSM_PHONE_NUMBER` -> Phone number with country code, e.g. "+63945XXXXXXX"
- pinout:
  - CH340 (TX) -> SIM800L (RX)
  - CH340 (RX) -> SIM800L (TX)
  - CH340 (5V) -> SIM800L (5VIN *power*)
  - CH340 (GND) -> SIM800L (GND *power*)
  - CH340 (GND) -> SIM800L (GND *uart ttl*)
  - yes both (GND) *power and uart ttl* of SIM800L needs to be connected to CH340 (GND), *might want to use breadboard*
- Run Command:
  ```bash
  npm run gsm
  ```
- Notes:
  - Sim size is Micro!
  - Can't send message with URL, it will be marked as sent but will not be received, probably blocked by network providers for security reasons.
  - SIM800L blinks red light interval meaning:
    - 1s -> connecting / trying to connect to network
    - 3s -> connected and ready to send and receive calls or sms