var GoogleSpreadsheet = require('google-spreadsheet');
var async = require('async');
var creds = require('../credential/client_secret.json');
var EventEmitter = require('events').EventEmitter;

// Create a document object using the ID of the spreadsheet - obtained from its URL.
var doc = new GoogleSpreadsheet('1uQWfRuXUxQsRNMrR_1R8k_coxTrbGpakr_nP4L7lK8o');

var googledrive = function() {
	console.log('GoogleDrive module loaded');
	var drive = new EventEmitter();
	var data = {
			datestamp : '', // date stamp in UNIX
			suhu_air: 0.0, // water temp
			suhu_udara: 0.0, // air temp
			suhu_udara_bmp: 0.0, // air temp from BMP
			kelembapan: 0.0, // humidinity
			tekanan: 0, // air pressure
			voltase: 0.0,
			rssi: 0,
			address: ''
		};
	var isconnected = false;
	
	drive.pushdata = function (parsedata, adrs) {
		data = parsedata;
		data.address = adrs.remote64;
		var datestamp = GetTime();
		//console.log(data);
		var sheet;
		var sheet_name = 'Buoy_' + parsedata.id;
		async.series([
		function setAuth(step) {
		// Authenticate with the Google Spreadsheets API.
		doc.useServiceAccountAuth(creds, function(err) {
			if (!err) {
				isconnected = true;
				console.log('Connected to GoogleSpreadsheet');
			} else {
				isconnected = false;
				console.log("Can't connect to GoogleSpreadsheet");
			}
			step();
		});
		},
		function getInfoAndWorksheets(step) {
			if (isconnected) {
				doc.getInfo(function(err, info) {
					if (!err) {
						var foundsheet = false;
						console.log('Loaded doc: '+info.title+' by '+info.author.email);
						//console.log('Sheet name: '+sheet_name);
						for (var i = 0; i < info.worksheets.length; i++){
							//console.log('Available sheet:'+info.worksheets[i].title);
							if (info.worksheets[i].title === sheet_name) {
								foundsheet = true;
								sheet = info.worksheets[i];
								sheet.setHeaderRow(['DATE', 'datestamp', 'suhu_air', 'suhu_udara', 'suhu_udara_bmp', 'kelembapan', 'tekanan', 'voltase', 'rssi', 'address'], function() {
									//console.log('found sheet: '+sheet.title);
									sheet.addRow({ DATE: datestamp, datestamp: data.datestamp, suhu_air: data.suhu_air, suhu_udara: data.suhu_udara, suhu_udara_bmp: data.suhu_udara_bmp, kelembapan: data.kelembapan, tekanan: data.tekanan, voltase: data.voltase, rssi: data.rssi, address: data. address }, function(err) {
										if(!err) {
											console.log('Succes add new data to GoogleSpreadsheet');
											step();
										}
									});
								});
								break;
							}
						}
						if (!foundsheet) {
							doc.addWorksheet({title: sheet_name}, function(err, worksheet) {
								if (!err) {
									sheet = worksheet;
									sheet.setHeaderRow(['DATE', 'datestamp', 'suhu_air', 'suhu_udara', 'suhu_udara_bmp', 'kelembapan', 'tekanan', 'voltase', 'rssi', 'address'], function() {
										//console.log('make new sheet: '+sheet.title);
										sheet.addRow({ DATE: datestamp, datestamp: data.datestamp, suhu_air: data.suhu_air, suhu_udara: data.suhu_udara, suhu_udara_bmp: data.suhu_udara_bmp, kelembapan: data.kelembapan, tekanan: data.tekanan, voltase: data.voltase, rssi: data.rssi, address: data. address }, function(err) {
											if(!err) {
												console.log('Succes add new data to GoogleSpreadsheet');
												step();
											}
										});
									});
								}
							});
						}
					}
				});
			}
		},
		function managingSheets(step) {
			step();
		}
	],	function(err){
			if( err ) {
			console.log('Error: '+err);
			}
		});	
	
	};	
	
	drive.pushlog = function (value, address) {
		var data = {
			log: value.log.replace(/\0/g, ''),
			address: address
		};
		//console.log(data);
		var datestamp = GetTime();
		var sheet_name = 'Log_' + value.id;
		var sheet;
		async.series([
		function setAuth(step) {
		// Authenticate with the Google Spreadsheets API.
		doc.useServiceAccountAuth(creds, function(err) {
			if (!err) {
				isconnected = true;
				console.log('Connected to GoogleSpreadsheet');
			} else {
				isconnected = false;
				console.log("Can't connect to GoogleSpreadsheet");
			}
			step();
		});
		},
		function getInfoAndWorksheets(step) {
			if (isconnected) {
				doc.getInfo(function(err, info) {
					if (!err) {
						var foundsheet = false;
						console.log('Loaded doc: '+info.title+' by '+info.author.email);
						//console.log('Sheet name: '+sheet_name);
						for (var i = 0; i < info.worksheets.length; i++){
							//console.log('Available sheet:'+info.worksheets[i].title);
							if (info.worksheets[i].title === sheet_name) {
								foundsheet = true;
								sheet = info.worksheets[i];
								sheet.setHeaderRow(['datestamp', 'log', 'alamat'], function() {
									//console.log('found sheet: '+sheet.title);
									sheet.addRow({ datestamp: datestamp, log: data.log, alamat: data.address }, function(err) {
										if(!err) {
											console.log('Succes add log to GoogleSpreadsheet');
											step();
										}
									});
								});
								break;
							}
						}
						if (!foundsheet) {
							doc.addWorksheet({title: sheet_name}, function(err, worksheet) {
								if (!err) {
									sheet = worksheet;
									sheet.setHeaderRow(['datestamp', 'log', 'alamat'], function() {
										//console.log('make new sheet: '+sheet.title);
										sheet.addRow({ datestamp: datestamp, log: data.log, alamat: data.address }, function(err) {
											if(!err) {
												console.log('Succes add log to GoogleSpreadsheet');
												step();
											}
										});
									});
								}
							});
						}
					}
				});
			}
		},
		function managingSheets(step) {
			step();
		}
	],	function(err){
			if( err ) {
			console.log('Error: '+err);
			}
		});	
	};
	
	function GetTime() {
		var date = new Date();
		var Y = date.getFullYear();
		var M = date.getMonth() + 1;
		var D = date.getDate();
		var h = date.getHours();
		var m = date.getMinutes();
		var s = date.getSeconds();
		var buff = D + "/" + M + "/" + Y + " " + h + ":" + m + ":" + s;
		
		return buff;
	}
	
	return drive;
};
	
module.exports = googledrive;