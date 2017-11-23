// Buatan Diwa & Sunny

var EventEmitter = require('events').EventEmitter;
var MysqlXbee = require('./lib/mysql-xbee');
var Hardware = require('./lib/hardware-xbee');
var GoogleDrive = require('./lib/GoogleDrive');

var localhost_setting = {
		host: 'localhost',
		user: 'root',
		password: 'root',
		database: 'xbee_node'
	};

var name_service = "localhost";	
var mysql_localhost = new MysqlXbee(name_service, localhost_setting);
var hardware = new Hardware();
var googledrive = new GoogleDrive();
var global = new EventEmitter();

hardware.on("parse-data", function(parsedata, address) {
	mysql_localhost.updatedata(parsedata, address);
	googledrive.pushdata(parsedata, address);
	// set sleep time each buoy in minutes
	var sleep_time = 30;
	hardware.write("sleep_t(" + sleep_time + ")", address);
	// send ATCommand "DB" for get RSSI from each node
	hardware.writeAT("DB", [], address);
	// Calibrate RTC each buoy
	setTime(address);
});

hardware.on("log", function(log, alamat) {
	mysql_localhost.updateLOG(log, alamat);
	googledrive.pushlog(log, alamat);
});

hardware.on("raw-frame", function(frame) {
	//console.log(frame);
	if (frame.type === 151) {
		var rawATFrame = frame;
		//console.log('RAW:', rawATFrame);
		// Remote AT Command sketch here!!!
		if (rawATFrame.command === "DB") {
			// Get RSSI in Desible (Db) from Node
			if (rawATFrame.commandData.length !== 0) {
				var data = rawATFrame.commandData[0] * -1;
				var address = rawATFrame.remote64;
				console.log('RSSI:', data, 'Db', "from", address);
			}
		}
	}
});

function setTime(address) {
	var date = new Date();
	var Y = date.getFullYear();
	var M = date.getMonth() + 1;
	var D = date.getDate();
	var h = date.getHours();
	var m = date.getMinutes();
	var s = date.getSeconds();
	var buff = "rtc_ajust(" + D + "," + M + "," + Y + "," + h + "," + m + "," + s + ")";
	hardware.write(buff,address);
}
