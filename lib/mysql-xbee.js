var mysql = require('mysql');
var EventEmitter = require('events').EventEmitter;
var async = require('async');
	

var MysqlXbee = function(name, options) {
	var MySql = new EventEmitter;
	var isconnectmysql = false;

	/**
	MySql.options = {
		host: '202.78.201.187',
		user: 'wcsmarin_diwa',
		password: 'xbeediwa153',
		database: 'xbee_node'
	}
	**/
	
	MySql.options = options;
	
	console.log(name, "Sql setting are:", MySql.options);
	
	MySql.connection = mysql.createConnection({
	  host     : MySql.options.host,
	  port: 3306,
	  user     : MySql.options.user,
	  password : MySql.options.password,
	  database : MySql.options.database
	});
	
	MySql.connection.connect(function(err){
		if(err){
			MySql.emit("error", err);
			isconnectmysql = false;
		  } else {
			console.log('Connection mysql established');
			isconnectmysql = true;
		  } 
	});
	
	MySql.updatedata = function(parsedata, address) {
		var data = {
			//id: parsedata.id, // buoy id
			//RSSI: Db, // RSSI value in -Db
			datestamp : parsedata.datestamp, // date stamp in UNIX
			suhu_air: parsedata.suhu_air, // water temp
			suhu_udara: parsedata.suhu_udara, // air temp
			suhu_udara_bmp: parsedata.suhu_udara_bmp, // air temp from BMP
			kelembapan: parsedata.kelembapan, // humidinity
			tekanan: parsedata.tekanan, // air pressure
			voltase: parsedata.voltase,
			rssi: parsedata.rssi,
			address: address.remote64
		};
		var id_buoy = parsedata.id;
		
		async.series([
		function pushdata(step) {
			//var name_table = prefix + data.id.toString();
			if (isconnectmysql) {
				MySql.connection.query("CREATE TABLE IF NOT EXISTS Buoy_" + id_buoy + " (\
				  ID int NOT NULL AUTO_INCREMENT,\
				  Date timestamp NOT NULL DEFAULT NOW(),\
				  datestamp varchar(50),\
				  suhu_air float,\
				  suhu_udara float,\
				  suhu_udara_bmp float,\
				  kelembapan float,\
				  tekanan float,\
				  voltase float,\
				  rssi integer,\
				  address varchar(50),\
				  PRIMARY KEY (ID)\
				) ENGINE=InnoDB  DEFAULT CHARSET=utf8;", function(err, data) {
					if (err) {
						MySql.emit("error", err);
					}					
				});
				
				MySql.connection.query("INSERT INTO Buoy_" + id_buoy + " SET ?", data, function(err, rest) {
					if (err) {
						MySql.emit("error", err);
						step();
					} else {
						console.log('Success update data SQL table');
						step();
					}
				});
			}	
		}
		],	function(err){
				if( err ) {
					MySql.emit("error", err);
				}
			});	
	
	};
	
	MySql.updateLOG = function(log, address) {
		var data = {
			id_buoy: log.id,
			log: log.log,
			address64: address
		};
		
		async.series([
		function pushdata(step) {
			if (isconnectmysql) {
				MySql.connection.query("CREATE TABLE IF NOT EXISTS LOG_" + data.id_buoy + " (\
					id int NOT NULL AUTO_INCREMENT,\
					Date timestamp NOT NULL DEFAULT NOW(),\
					id_buoy integer,\
					log varchar(150),\
					address64 varchar(50),\
					PRIMARY KEY (id)\
				) ENGINE=InnoDB  DEFAULT CHARSET=utf8;", function(err, data) {
					if (err) {
						MySql.emit("error", err);
					}
				});
				
				MySql.connection.query("INSERT INTO LOG_" + data.id_buoy + " SET ?", data, function(err, rest) {
					if (err) {
						MySql.emit("error", err);
						step();
					} else {
						console.log('Success update log data SQL table');
						step();
					}
				});
			}
		}
		],	function(err){
				if( err ) {
					MySql.emit("error", err);
				}
			});	
	};
	
	MySql.on("error", function(err) {
		if (err.code === "PROTOCOL_CONNECTION_LOST") {
			MySql.connection.connect(function(err) {
				if(err){
					MySql.emit("error", err);
					isconnectmysql = false;
				  } else {
					console.log('Connection mysql established');
					isconnectmysql = true;
				  } 
			});
		}
		console.log("Error:", err.code); // 'ER_BAD_DB_ERROR'
	});
	
	return MySql;
};

module.exports = MysqlXbee;