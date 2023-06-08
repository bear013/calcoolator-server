const sqlite3 = require('sqlite3').verbose();

const jwt = require('jsonwebtoken');
const random = require("./random.cjs");
require('dotenv').config();

module.exports = {

	addition: function (firstOperand,secondOperand){
	return new Promise((resolve, reject) => {
		var opResult = ''
		var opResult = parseFloat(firstOperand) + parseFloat(secondOperand);
		resolve({success: true, opResult: opResult});		
    });	
},

	subtraction: function (firstOperand,secondOperand){
	return new Promise((resolve, reject) => {
		var opResult = ''
		var opResult = parseFloat(firstOperand) - parseFloat(secondOperand);
		resolve({success: true, opResult: opResult});		
    });
},

	multiplication: function (firstOperand,secondOperand){
	return new Promise((resolve, reject) => {
		var opResult = ''
		opResult = parseFloat(firstOperand) * parseFloat(secondOperand);
		resolve({success: true, opResult: opResult});		
    });
},

	division: function (firstOperand,secondOperand){
	return new Promise((resolve, reject) => {
		var opResult = ''
		if (parseFloat(secondOperand) == 0)
			reject({success: false, opResult: opResult})
		else
			opResult = parseFloat(firstOperand) / parseFloat(secondOperand);
			resolve({success: true, opResult: opResult});		
    });
},

	randomString: function (firstOperand, secondOperand) {
    return new Promise((resolve, reject) => {
		var opRes='';
		calculator.getRandomNumber(randResult => 
							{console.log(randResult); 
							opRes = randResult[0][0];
							resolve({success: true, opResult: opRes})},
							rejResult => resolve({success: false, opResult: opRes}));
    });
},

	squareRoot: function (firstOperand,secondOperand){	
	return new Promise((resolve, reject) => {
		var opResult = ''
		opResult = Math.sqrt(parseFloat(firstOperand))
		resolve({success: true, opResult: opResult});		
    });	
},

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

	randomGenOptions:  {
		secure: true, // Make the request secure
		min: 0,     // Lower bound 0
		max: 1000000000,      // Upper bound 10
		col: 1,       // 1 column
		base: 10,     // Use Base 10
		rnd: "new" // Which set of random numbers to use
	},


		//function randomCallback(sequence){
		//	// Prints entire sequence
		//	console.log(sequence);
		//}
	//getRandomNumber: function (){
	//	return new Promise((resolve, reject) => {
	//		random.generateIntegers(resolve,this.randomGenOptions,reject);
	//	});
	//},
	
	getRandomNumber: function (resolve,reject){
		random.generateIntegers(resolve,this.randomGenOptions,reject);
	},

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
			
			//this.getRandomNumber().then(randResult => console.log(randResult))
			
			var token = req.get('x-access-token');
			console.log(token);
			
			var validToken = false;
			var decodedUsername = jwt.verify(token,process.env.TOKEN_KEY);
			console.log(decodedUsername)
			
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