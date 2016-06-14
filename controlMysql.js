var mysql = require("mysql"), eventEmitter = require("events").EventEmitter, cache = new eventEmitter();

var pool = mysql.createPool({
	connectionLimit: 10,
	host: 'localhost',
	user: 'Paul',
	password: '1qaz23we',
	database: 'crBooking'
});

function insert(table, values){
	pool.getConnection(function (err, connection){
		if (err){
			console.log(err);
			return;
		};
		var n = JSON.stringify(values).length;
		if(n <= 5){
			console.log("插入数据不能为空！");
			return;
		}
		
		var query = connection.query("insert into " + table + " set ?", values, function (err, result) {
			if (err){
				console.log(err);
				return;
			};
			cache.emit("insert", result);
			setTimeout(function () {
				connection.release();
			}, 1000);
		});
	});
}

function query(querySql){
	pool.getConnection(function (err, connection){
		if (err){
			console.log(err);
			return;
		};
		var n = querySql.length;
		if(n <= 4){
			console.log("查询条件不能为空！");
			return;
		}
		
		var query = connection.query(querySql, function (err, result) {
			if (err){
				console.log(err);
				return;
			};
			cache.emit("query", result);
			setTimeout(function () {
				connection.release();
			}, 1000);
		});
	});
}

function transfer(string){
	return pool.escape(string);
}

exports.insert = insert;
exports.query = query;
exports.transfer = transfer;
exports.cache = cache;