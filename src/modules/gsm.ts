// Thanks ChatGPT

import { SerialPort } from 'serialport';
import dotenv from 'dotenv'

// Load environment variables
dotenv.config();

const PORT_NAME = process.env.GSM_PORT_NAME || 'COM1'; // Default to COM1 if not set
const PHONE_NUMBER = process.env.GSM_PHONE_NUMBER || '+0000000000'; // Default placeholder

const port = new SerialPort({
  path: PORT_NAME,
  baudRate: 9600,
  autoOpen: false,
});

const sendCommand = (command: string, delayTime: number = 10000): Promise<string> => {
  return new Promise((resolve, reject) => {
    let response = '';

    console.log(`📤 Sending: ${command}`);
    port.write(`${command}\r\n`, (err) => {
      if (err) {
        console.error(`⚠️ Error sending command: ${err.message}`);
        return reject(err);
      }
    });

    const onData = (data: Buffer) => {
      response += data.toString();
      if (response.includes('OK') || response.includes('>')) {
        port.off('data', onData);
        console.log(`📥 Response: ${response.trim()}`);
        resolve(response.trim());
      }
    };

    port.on('data', onData);

    setTimeout(() => {
      port.off('data', onData);
      reject(new Error('⏳ No response from SIM800L!'));
    }, delayTime);
  });
};

const sendSMS = async () => {
  console.log('📡 Sending SMS...');
  await sendCommand('AT'); // Check if module is responding
  await sendCommand('AT+CMGF=1'); // Set text mode
  await sendCommand(`AT+CMGS="${PHONE_NUMBER}"`); // Set recipient

  console.log('⌛ Waiting for message prompt...');
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Short delay

  await sendCommand('Hello, how are you? Greetings from admin\x1A'); // Send message + Ctrl+Z
  console.log(`✅ Message sent to ${PHONE_NUMBER}`);
};

const receiveSMS = async () => {
  console.log('📡 Receiving SMS...');
  await sendCommand('AT+CMGF=1'); // Set text mode
  await sendCommand('AT+CNMI=1,2,0,0,0'); // Set to receive live SMS
  console.log('✅ Ready to receive SMS');
};

// Event listener to log received SMS
port.on('data', (data) => {
  const message = data.toString();
  console.log('📩 Incoming SMS Data:', message);

  if (message.includes('+CMT:')) {
    const lines = message.split('\n');
    if (lines.length >= 2) {
      const senderInfo = lines[0].trim(); // Contains sender and timestamp
      const smsText = lines.slice(1).join('\n').trim(); // Message content
      console.log('📨 New SMS Received!');
      console.log(`📞 From: ${senderInfo}`);
      console.log(`📜 Message: ${smsText}`);
    }
  }
});

const callNumber = async () => {
  console.log('📞 Calling...');
  await sendCommand(`ATD${PHONE_NUMBER};`); // Dial the number
  console.log(`📞 Calling ${PHONE_NUMBER}...`);
};

port.open((err) => {
  if (err) {
    return console.error(`❌ Serial Port Error: ${err.message}`);
  }

  console.log('✅ Serial Port Opened');
  console.log("Type 's' to send SMS, 'r' to receive SMS, or 'c' to call");

  process.stdin.on('data', async (data) => {
    const command = data.toString().trim();
    if (command === 's') await sendSMS();
    else if (command === 'r') await receiveSMS();
    else if (command === 'c') await callNumber();
    else console.log('❌ Invalid command. Use "s", "r", or "c".');
  });
});
