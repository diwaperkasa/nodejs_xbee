	var EventEmitter = require('events').EventEmitter;
	var fs = require('fs');

	var parsexbee = function () {
	
	var reader = new EventEmitter();
	reader.parsedata = function (rawdata) {
		var parts = rawdata.split(',');
		var maindata = {
			id: parts[0], // buoy id
			datestamp : parts[1], // date stamp in UNIX
			suhu_air: parts[2], // water temp
			suhu_udara: parts[3], // air temp
			kelembapan: parts[4], // humidinity
			tekanan: parts[5] // air pressure
		};
		return maindata;
	};
		
		return reader;
	};
	
	module.exports = parsexbee;