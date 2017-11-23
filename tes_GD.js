var GoogleSpreadsheet = require('google-spreadsheet');
var creds = require('./credential/client_secret.json');
var async = require('async');
// Create a document object using the ID of the spreadsheet - obtained from its URL.
var doc = new GoogleSpreadsheet('1uQWfRuXUxQsRNMrR_1R8k_coxTrbGpakr_nP4L7lK8o');
var name_sheet = 'buoy_002';
var sheet;

var data = {
	//id: parsedata.id, // buoy id
	//RSSI: Db, // RSSI value in -Db
	datestamp : "001", // date stamp in UNIX
	suhu_air: 0, // water temp
	suhu_udara: 0, // air temp
	suhu_udara_bmp: 0, // air temp from BMP
	kelembapan: 0, // humidinity
	tekanan: 0, // air pressure
	voltase: 0,
	rssi: 0,
	address: 0
};

// Authenticate with the Google Spreadsheets API.
var isconnected = false;
async.series([
	function setAuth(step) {
	// Authenticate with the Google Spreadsheets API.
	doc.useServiceAccountAuth(creds, function(err) {
		if (!err) {
			isconnected = true;
			console.log('Connected to GoogleDrive');
		} else {
			isconnected = false;
			console.log("Can't connect to GoogleDrive");
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
					console.log('Sheet name: '+name_sheet);
					for (var i = 0; i < info.worksheets.length; i++){
						if (info.worksheets[i].title === name_sheet) {
							sheet = info.worksheets[i];
							sheet.setHeaderRow(['datestamp', 'suhu_air', 'suhu_udara', 'suhu_udara_bmp', 'kelembapan', 'tekanan', 'voltase', 'rssi', 'address'], function() {
								//console.log('found sheet: '+sheet.title);
								foundsheet = true;
								sheet.addRow({ datestamp: data.datestamp, suhu_air: data.suhu_air, suhu_udara: data.suhu_udara, suhu_udara_bmp:data.suhu_udara_bmp, kelembapan: data.kelembapan, tekanan: data.tekanan, voltase: data.voltase, rssi: data.rssi, address: data. address }, function(err) {
									if(!err) {
										console.log('Succes add new data to GoogleSpreadsheet');
										step();
									}
								});
							});
							step();
							break;
						}
					}
					if (!foundsheet) {
						doc.addWorksheet({title: name_sheet}, function(err, worksheet) {
							if (!err) {
								sheet = worksheet;
								sheet.setHeaderRow(['datestamp', 'suhu_air', 'suhu_udara', 'suhu_udara_bmp', 'kelembapan', 'tekanan', 'voltase', 'rssi', 'address'], function() {
									//console.log('make new sheet: '+sheet.title);
									sheet.addRow({ datestamp: data.datestamp, suhu_air: data.suhu_air, suhu_udara: data.suhu_udara, suhu_udara_bmp:data.suhu_udara_bmp, kelembapan: data.kelembapan, tekanan: data.tekanan, voltase: data.voltase, rssi: data.rssi, address: data. address }, function(err) {
										if(!err) {
											console.log('Succes add new data to GoogleSpreadsheet');
											step();
										}
									});
								});
								step();
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
], function(err){
	if( err ) {
	  console.log('Error: '+err);
	}
});


