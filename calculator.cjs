const sqlite3 = require('sqlite3').verbose();

const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = {

	selectOneRow: function (database, query, params) {
		console.log(query)
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
		console.log(query)
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

	responseTemplates: [{"httpCode":200,"resultCode":"0","message":"OK"},{"httpCode":500,"resultCode":"-1","message":"Internal Error"}],

	db: new sqlite3.Database('./db/calculator.db'),

	getResponse: function (index,params){
		//console.log(index)
		//console.log(params)
		var r = this.responseTemplates[index];
		var toReturn = {"httpCode":r.httpCode,"resultCode":r.resultCode,"message":r.message,"data":params};
		//console.log(toReturn)
		return toReturn;
	},

	getHistory: function (req) {
		return new Promise((resolve, reject) => {
			
			console.log(req.query);
			
			var token = req.get('x-access-token');
			console.log(token);
			
			var validToken = false;
			var decodedUsername = jwt.verify(token,process.env.TOKEN_KEY);
			console.log(decodedUsername)
			
			var resultIndex = 0;
			var result = {}
			var totalPages = 0;
			
			queryParams = [decodedUsername.user_id,
							req.query.untilDate + ' 23:59:59',
							req.query.fromDate + ' 00:00:00',
							req.query.maxAmount,
							req.query.minAmount,
							req.query.type,
							req.query.type,
							req.query.offset]
							
			countQueryParams = [decodedUsername.user_id,
							req.query.untilDate + ' 23:59:59',
							req.query.fromDate + ' 00:00:00',
							req.query.maxAmount,
							req.query.minAmount,
							req.query.type,
							req.query.type]
			
			var countQuery = `SELECT count(*) as total
								from records h 
									left join operations op on h.operation_id = op.id
									inner join users u on h.user_id = u.id
								where u.username = ? 
								and h.operation_date <= ?
								and h.operation_date >= ?
								and h.amount <= ?
								and h.amount >= ?
								and (op.type = ? or 'any' = ?)`
			
			var query = `SELECT op.type as type,
								h.amount as amount,
								h.user_balance as balance,
								h.operation_response as response,
								h.operation_date as op_date
								from records h 
									left join operations op on h.operation_id = op.id
									inner join users u on h.user_id = u.id
								where u.username = ? 
								and h.operation_date <= ?
								and h.operation_date >= ?
								and h.amount <= ?
								and h.amount >= ?
								and (op.type = ? or 'any' = ?)
								limit 20
								offset ?`
								
			this.selectOneRow(this.db,countQuery,countQueryParams)
			.then(r => {totalPages = Math.floor((r.total/20) + 1); console.log(totalPages)})
			.then(r => this.selectAllRows(this.db,query,queryParams))
			.then(rows => {
				if (rows !== undefined){
					result.count = rows.length
					result.rows = rows
					result.totalPages = totalPages
				} else {
					result.count = 0
					result.rows = []
					result.totalPages = 0
					
				}
				resolve(this.getResponse(resultIndex,result))
			} )
			.catch(err => {
				console.log(err)
				resultIndex = 1	
				reject(this.getResponse(resultIndex,result))
			})
		})
		
	}

};