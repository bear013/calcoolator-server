const jwt = require('jsonwebtoken');
const cal = require("./calculator-operations.js");
const database = require("./database.js");
//require('dotenv').config();

module.exports = {
	responseTemplates: [{"httpCode":200,"resultCode":"0","message":"OK"},
						{"httpCode":500,"resultCode":"-1","message":"Internal Error"},
						{"httpCode":401,"resultCode":"-2","message":"Unauthorized"},
						{"httpCode":403,"resultCode":"-3","message":"Unsupported Operation"},
						{"httpCode":403,"resultCode":"-4","message":"Insufficient Balance"}],

	operationMap:{'addition':cal.addition,
						'subtraction':cal.subtraction,
						'multiplication':cal.multiplication,
						'division':cal.division,
						'random_string':cal.randomString,
						'square_root':cal.squareRoot},

	getResponse: function (index,params){
		var r = this.responseTemplates[index];
		var toReturn = {"httpCode":r.httpCode,"resultCode":r.resultCode,"message":r.message,"data":params};
		return toReturn;
	},

	execOperation: function (req){
		return new Promise((resolve, reject) => {
			console.log("req.user:"+req.user)
			var user = req.user;
				
			let sql = `SELECT balance FROM users where users.username = ?`;

			var response = {}
			var responseCode = {}

			database.selectOneRow(database.db, sql, [user])
			.then(row => {
				if (row !== undefined) {
				  var oldBalance = row.balance;
				  var firstOperand = req.body.firstOperand;
				  var secondOperand = req.body.secondOperand;				  
				  if (this.operationMap[req.params.operation] == undefined) {
					  resolve(this.getResponse(3,{"value":"","balance":oldBalance})) 
				  } else {
					  checkBalanceQuery = `select users.balance - operations.cost as new_balance from users,operations where users.username = '${user}' and operations.type='${req.params.operation}'`;
					  database.selectOneRow(database.db, checkBalanceQuery, [])
					  .then(newBalance => {
						  if (newBalance.new_balance >= 0) {
							  this.operationMap[req.params.operation](firstOperand,secondOperand)
							  .then(result => {
								   database.execStatement(database.db,`update users set balance = ? where username= ?`,[newBalance.new_balance,user])
								   database.execStatement(database.db,`insert into records (operation_id,user_id,amount,user_balance,operation_response,operation_date,active) 
														select op.id as operation_id, 
														u.id as user_id,
														op.cost as amount,
														u.balance as balance,
														'OK' as operation_response,
														datetime('now') as operation_date,
														1 as active
														from operations op, users u
														where op.type = ?
														and u.username = ?`,[req.params.operation,user])
									resolve(this.getResponse(0,{"value":result.opResult,"balance":newBalance.new_balance}))	  
								})
								.catch(err => resolve(this.getResponse(2,{"value":"","balance":oldBalance})))
								
						  } else {
							  console.log("insufficient Balance")
							  resolve(this.getResponse(4,{"value":"","balance":oldBalance}))
						  }
						  
					  })
					  
				  }		
				} else {
					console.log("invalid Token")
					resolve(this.getResponse(1,{"value":"","balance":"0"}))		
				}
			})
			.catch(error => {
				console.log(error)
				resolve(this.getResponse(1,{"value":"","balance":"0"}))
			});		
		});
		
	},

	deleteHistoryRecord: `update records set active = 0 where id = ?`,

	removeHistory: function (req) {
		return new Promise((resolve, reject) => {
			
			var token = req.get('x-access-token');
			var decodedUsername = ''
			try {
			    decodedUsername = jwt.verify(token,process.env.TOKEN_KEY);
			} 
			catch (err) {		
				console.log(err)
				resolve(this.getResponse(2,{}))
			}
			
			params = [req.body.recordId]
			database.execStatement(database.db,this.deleteHistoryRecord,params)
			.then(r => resolve(this.getResponse(0,r)))
			.catch(err => reject(this.getResponse(1,err)))	
		});
		
	},

	getHistory: function (req) {
		return new Promise((resolve, reject) => {
			var token = req.get('x-access-token');
			
			var validToken = false;
			var decodedUsername = ''
			try {
			    decodedUsername = jwt.verify(token,process.env.TOKEN_KEY);
			} 
			catch (err) {		
				console.log(err)
				resolve(this.getResponse(2,{}))
			}
			var resultIndex = 0;
			var result = {}
			var totalPages = 0;
			
			var untilDate = req.query.untilDate != '' ?  req.query.untilDate: '2030-01-01'
			var fromDate = req.query.fromDate != '' ?  req.query.fromDate: '2023-01-01'
			var maxAmount = req.query.maxAmount != '' ?  req.query.maxAmount: 9999999
			var minAmount = req.query.minAmount != '' ?  req.query.minAmount: 0
			
			queryParams = [decodedUsername.user_id,
							untilDate + ' 23:59:59',
							fromDate + ' 00:00:00',
							maxAmount,
							minAmount,
							req.query.type,
							req.query.type,
							req.query.offset]
							
			countQueryParams = [decodedUsername.user_id,
							untilDate + ' 23:59:59',
							fromDate + ' 00:00:00',
							maxAmount,
							minAmount,
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
								and (op.type = ? or 'any' = ?)
								and active = 1`
			
			var query = `SELECT op.type as type,
								h.amount as amount,
								h.user_balance as balance,
								h.operation_response as response,
								h.operation_date as op_date, 
								h.id as record_id
								from records h 
									left join operations op on h.operation_id = op.id
									inner join users u on h.user_id = u.id
								where u.username = ? 
								and h.operation_date <= ?
								and h.operation_date >= ?
								and h.amount <= ?
								and h.amount >= ?
								and (op.type = ? or 'any' = ?)
								and active = 1 
								limit 5
								offset 5 * ?`
								
			database.selectOneRow(database.db,countQuery,countQueryParams)
			.then(r => {totalPages = Math.floor((r.total/5))})
			.then(r => database.selectAllRows(database.db,query,queryParams))
			.then(rows => {
				if (rows !== undefined){
					result.count = rows.length
					result.rows = rows
					result.totalPages = totalPages
					result.currentPage = req.query.offset
				} else {
					result.count = 0
					result.rows = []
					result.totalPages = 0
					result.currentPage = 0
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