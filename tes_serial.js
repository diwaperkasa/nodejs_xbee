var SerialPort = require('serialport');
//var xbee_api = require('xbee-api');
var port = new SerialPort('/dev/ttyUSB0', {
  baudRate: 9600
});

port.on('open', function() {
	console.log('Port is open');
});

// Switches the port into "flowing mode"
port.on('data', function (data) {
  console.log('Data:', data.toString('utf8'));
});