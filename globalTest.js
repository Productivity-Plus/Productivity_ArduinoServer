require('dotenv').config(); //initialize dotenv
const path = require('path');
const fs = require("fs"); 
const fsp = require('fs').promises;
//const express = require('express');
//const cors = require('cors');
//const appE = express();
//const server = require('http').Server(appE);
//const cron = require("node-cron");
const WebSocketClient = require("websocket").client;
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const readline = require('readline');

const port = new SerialPort({
    path: 'COM5', // Asegúrate de usar el puerto correcto
    baudRate: 9600
  });

  const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

// Constantes Globales Del Entorno
const WEBSOCKETS_URL = process.env.WEBSOCKETS_URL == undefined ? 'wss://ws.productivityplus.tech/' : process.env.WEBSOCKETS_URL;
const SMS_ID = process.env.KIOSKO_ID == undefined ? '6000' : process.env.KIOSKO_ID;
let REMOTE_ID = process.env.REMOTE_ID == undefined ? '5001' : process.env.REMOTE_ID;

// Variables de Funcionamiento
var socketclient = new WebSocketClient();
let connection; // Variable global para la conexión
const isDev = false; //process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin';
let timeoutId;


const register = {
  type: 'register',
  clientId: SMS_ID
};

let messageResponse = {
  type: 'message',
  recipientId: REMOTE_ID,
  command: "Data*",
};


socketclient.on('connectFailed', function (error) {
  console.log('Connect Error: ' + error.toString());
});

socketclient.on('connect', function (conn) {
  console.log('Connection established!');
  clearTimeout(timeoutId);
  connection = conn;                            // Asignar la conexión a la variable global
  connection.sendUTF(JSON.stringify(register));

  connection.on('error', function (error) {
    console.log("Connection error: " + error.toString());
    timeoutId = setTimeout(function () {
      console.log("Tratando de reconectarse...");
      socketclient.connect(WEBSOCKETS_URL);
    }, 2000);
  });

  connection.on('close', function () {
    console.log('Connection closed!');
    timeoutId = setTimeout(function () {
      console.log("Tratando de reconectarse...");
      socketclient.connect(WEBSOCKETS_URL);
    }, 2000);
  });

  connection.on('message', async function (message) {

    const prefix = message.utf8Data.split('*')[0];
    const data = message.utf8Data.split('*')[1];

    console.log('Prefijo: ' + prefix);
    console.log('Data: ' + data);

    switch (prefix) {
      case "sendsms":
      case "sendSMS":
        const properties = JSON.parse(data);
        port.write("SMS" + properties.number + properties.msg + '\n', err => {
            if (err) {
              return console.log('Error al enviar mensaje:', err.message);
            }
            /*
            let messageResponse = {
                type: 'message',
                recipientId: REMOTE_ID,
                command: "OK*",
              };
            connection.sendUTF(JSON.stringify(messageResponse));
            */
            console.log('Mensaje enviado:', data);
        }); 
        break;

        case "notification":
            console.log('Notificación Ignorada');
        break;

      default:
        console.log("----------------------------------");
        break;
    }

    //console.log("Mensaje recibido: " + message.utf8Data);
  });
});

// Abrir el puerto
port.on('open', () => {
    console.log('Puerto serial abierto');
  });
  
  // Leer los datos del puerto
  parser.on('data', data => {
    console.log(`Mensaje recibido: ${data}`);
  });
  
  // Configurar readline para la entrada del usuario
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  // Manejar el cierre de la aplicación
  rl.on('close', () => {
    console.log('Cerrando la interfaz');
    port.close(err => {
      if (err) {
        return console.log('Error al cerrar el puerto:', err.message);
      }
      console.log('Puerto serial cerrado');
    });
  });

  socketclient.connect(WEBSOCKETS_URL);





