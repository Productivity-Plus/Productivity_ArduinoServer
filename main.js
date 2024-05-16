const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const port = new SerialPort({
    path: 'COM3', // Asegúrate de usar el puerto correcto
    baudRate: 9600
  });

const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

// Abrir el puerto
port.on('open', () => {
  console.log('Puerto serial abierto');
});

// Leer los datos del puerto
parser.on('data', data => {
  console.log(`Mensaje recibido: ${data}`);
});

// Enviar un mensaje al Arduino
port.write('Hola Arduino\n', err => {
  if (err) {
    return console.log('Error al enviar mensaje:', err.message);
  }
  console.log('Mensaje enviado');
});