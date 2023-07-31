const jwt = require('jsonwebtoken');
const cal = require("../utils/calculator-operations.js");
//const database = require("../database.js");
const calcModel = require("./calculatorModel.js")
const utils = require('../utils/utils')

module.exports = {
	responseTemplates: [
		{"httpCode":200,"resultCode":"0","message":"OK"},
		{"httpCode":500,"resultCode":"-1","message":"Internal Error"},
		{"httpCode":401,"resultCode":"-2","message":"Unauthorized"},
		{"httpCode":403,"resultCode":"-3","message":"Unsupported Operation"},
		{"httpCode":403,"resultCode":"-4","message":"Insufficient Balance"},
		{"httpCode":404,"resultCode":"-5","message":"Invalid Transaction ID"}
	],

	getResponse: function (index,params){
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
					utils.logInfo("everything OK",result)
					executionResult = result;
					resultIndex = 0;
					return calcModel.getBalance(user)
				})
				.then(bal => resolve(this.getResponse(resultIndex,{"result":executionResult,"transactionId":transactionId,"balance":bal})))
				.catch(e => {
					utils.logInfo("error caught:",e)
					resultIndex = e
					return calcModel.refundTransaction(user,transactionId)
				})
				.then(() => calcModel.getBalance(user))
				.then(bal => resolve(this.getResponse(resultIndex,{"transactionId":transactionId,"balance":bal})))
		});
		
	},

	removeHistory: function (req) {
		return new Promise((resolve, reject) => {	
			var externalTransactionId = req.body.transactionId
			var user = req.user
			calcModel.removeTransactionFromHistory(user,externalTransactionId)
				.then(r => resolve(this.getResponse(0,{})))
				.catch(err => resolve(this.getResponse(5,{})))	
		});	
	},

	getHistory: function (req) {
		return new Promise((resolve, reject) => {
			utils.logInfo('getHistory')
			calcModel.getTransactionHistory(req.user,req.query)
			.then(r => resolve(this.getResponse(0,{r})))
			.catch(err => resolve(this.getResponse(1,{})))
		})
		
	}

};