const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const readline = require('readline');

// Configura el puerto serial
const port = new SerialPort({
  path: 'COM3', // Asegúrate de usar el puerto correcto
  baudRate: 9600
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

// Abrir el puerto
port.on('open', () => {
  console.log('Puerto serial abierto');
  promptUser(); // Iniciar la interacción con el usuario una vez que el puerto esté abierto
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

// Función para preguntar al usuario qué mensaje enviar
function promptUser() {
  rl.question('¿Qué mensaje quieres enviar al Arduino? ', (message) => {
    port.write(message + '\n', err => {
      if (err) {
        return console.log('Error al enviar mensaje:', err.message);
      }
      console.log('Mensaje enviado:', message);
      promptUser(); // Volver a preguntar después de enviar el mensaje
    });
  });
}

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