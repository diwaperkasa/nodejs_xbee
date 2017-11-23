//var util = require('util');
var SerialPort = require('serialport');
var xbee_api = require('xbee-api');
var C = xbee_api.constants;
var EventEmitter = require('events').EventEmitter;
//var ParseXbee = require('./parse-xbee');

var hardwarexbee = function() {
	var hardware = new EventEmitter();
	//var reader = new ParseXbee();
	
	var xbeeAPI = new xbee_api.XBeeAPI({
		api_mode: 1
	});
 
	hardware.serial = new SerialPort("/dev/ttyUSB0", {
		baudrate: 9600,
		parser: xbeeAPI.rawParser()
	});
 
	hardware.serial.on("open", function(err) {
		if (err) {
			return console.log('Error opening serial-port: ', err.message);
		}
		console.log('Serial-Port open');
	});
	
	xbeeAPI.on("frame_object", function(frame) {
	// Get all rest bytes as buffer	
	if (frame.data === 'undefined') return;
	hardware.emit("raw-frame", frame);			
	if (frame.type === C.FRAME_TYPE.ZIGBEE_RECEIVE_PACKET) {
		var data = frame.data.slice(0, frame.data.length).toString();	
		console.log(data);
		var parts = data.split('>');
		var alamat = {
				remote64: frame.remote64.toString(), // address of sender XBee
				remote16: frame.remote16.toString()
			};
		if (parts[0] === "@dp") {
			var parsing = parts[1].split(',');
			var parsedata = {
				id: parsing[0], // buoy id
				datestamp : parsing[1], // date stamp in UNIX
				suhu_air: parseFloat(parsing[2]), // water temp
				suhu_udara: parseFloat(parsing[3]), // air temp
				suhu_udara_bmp: parseFloat(parsing[4]), // air temp bmp
				kelembapan: parseFloat(parsing[5]), // humidinity
				tekanan: parseFloat(parsing[6]), // air pressure
				voltase: parseFloat(parsing[7]), // air pressure
				rssi: parseFloat(parsing[8]) // air pressure
			};
			hardware.emit("parse-data", parsedata, alamat);
		} else if (parts[0] === "log") {
			var parsing = parts[1].split(',');
			var value = {
				id: parsing[0],
				log: parsing[1]
			};
			hardware.emit("log", value, alamat.remote64);
		} 
	} else if (frame.type === C.FRAME_TYPE.ZIGBEE_TRANSMIT_STATUS) {
		//status pengiriman data
	}
	});
	
	var _text = []; // create empty array 
	
	hardware.write = function(command, address) {
		_text.push({
			cmd: command,
			add: address
		});
	};
	
	function sendRepeatly() {
		if (_text.length > 0)
		{
			var frameId = xbeeAPI.nextFrameId();
			var frame_obj = {
				type: 0x10, // xbee_api.constants.FRAME_TYPE.ZIGBEE_TRANSMIT_REQUEST 
				id: frameId, // optional, nextFrameId() is called per default 
				destination64: _text[0].add.remote64,
				destination16: _text[0].add.remote16, // optional, "fffe" is default 
				broadcastRadius: 0x00, // optional, 0x00 is default 
				options: 0x00, // optional, 0x00 is default 
				data: _text[0].cmd // Can either be string or byte array. 
			};
			console.log("command: " + frame_obj.data +" to: " + frame_obj.destination64.toString());
			hardware.serial.write(xbeeAPI.buildFrame(frame_obj));
			
			_text.splice(0, 1);
		}
	}
	
	setInterval(sendRepeatly,1000);
	
	hardware.writeAT = function(command, args, address) {
		var frameId = xbeeAPI.nextFrameId();
		var frame_obj = {
			type: C.FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST,
			id: frameId, // optional, nextFrameId() is called per default 
			destination64: address.remote64,
			destination16: address.remote16, // optional, "fffe" is default 
			remoteCommandOptions: 0x02, // optional, 0x02 is default 
			command: command,
			commandParameter: args,
		};
		console.log("commandAT: " + command.toString() + " to: " + frame_obj.destination64.toString());
		hardware.serial.write(xbeeAPI.buildFrame(frame_obj));
	};
	
	hardware.close = function() {
		var sp = hardware.serial;
		hardware.serial.flush(function(err) {
		  setTimeout(function() {
			sp.close();
		  }, 10);
		});
	};
	
	return hardware;
};
module.exports = hardwarexbee;