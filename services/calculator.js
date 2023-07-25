const jwt = require('jsonwebtoken');
const cal = require("../utils/calculator-operations.js");
const database = require("../database.js");
const calcModel = require("./calculatorModel.js")
const utils = require('../utils/utils')

module.exports = {
	responseTemplates: [
		{"httpCode":200,"resultCode":"0","message":"OK"},
		{"httpCode":500,"resultCode":"-1","message":"Internal Error"},
		{"httpCode":401,"resultCode":"-2","message":"Unauthorized"},
		{"httpCode":403,"resultCode":"-3","message":"Unsupported Operation"},
		{"httpCode":403,"resultCode":"-4","message":"Insufficient Balance"}
	],

	getResponse: function (index,params){
		utils.logInfo(index,params)
		var r = this.responseTemplates[index];
		var toReturn = {"httpCode":r.httpCode,"resultCode":r.resultCode,"message":r.message,"data":params};
		return toReturn;
	},

	getUserBalance: function (req){
		return new Promise((resolve,reject) => {
			utils.logInfo("getUserBalance start")
			var user = req.user;
			calcModel.getBalance(user)
			.then(balance => resolve(utils.getResponse(0,{"balance":balance})))
			.catch(e => {
				utils.logInfo(e);
				resolve(utils.getResponse(1,{"balance":"0"}))
			})
		})
	},

	execOperation: function (req){
		return new Promise((resolve, reject) => {
			console.log("req.user:"+req.user)
			var user = req.user;
			var operation = req.params.operation
			var firstOperand = req.body.firstOperand;
			var secondOperand = req.body.secondOperand;			
			var transactionId = '';	
			var executionResult = '';
			var resultIndex = 1;

			calcModel.validateOperation(operation)
				.then(() => calcModel.consumeOperation(user,operation))
				.then(trId => transactionId = trId)
				.then(() => calcModel.calculateResult(operation,firstOperand,secondOperand))
				.then(result => {
					executionResult = result;
					resultIndex = 0;
				})
				.catch(e => {
					resultIndex = e
					calcModel.refundTransaction(user,transactionId)
				})
				.finally(() => calcModel.getBalance(user))
				.then(bal => resolve(this.getResponse(resultIndex,{"transactionId":transactionId,"balance":bal})))
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