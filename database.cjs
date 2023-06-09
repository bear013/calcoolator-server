const sqlite3 = require('sqlite3').verbose();

module.exports = {
	db : new sqlite3.Database('./db/calculator.db'),

	selectOneRow: function (database, query, params) {
		return new Promise((resolve, reject) => {
			database.get(query, params, (err, row) => {
				if (err) {
					reject(err); 
				} else {
					resolve(row);
				}
			});
		});
	},

	selectAllRows: function (database, query, params) {
		return new Promise((resolve, reject) => {
			database.all(query, params, (err, rows) => {
				if (err) {
					reject(err); 
				} else {
					resolve(rows);
				}
			});
		});
	},
	
	execStatement: function(database, statement, params) {
		return new Promise((resolve, reject) => {
			database.run(statement,params, (err) => {
				if (err) {
					reject(err); 
				} else {
					resolve("OK");
				}
			});
		});
	},


}