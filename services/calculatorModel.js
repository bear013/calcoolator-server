const UserManager = require('../model/UserManager')
const TransactionManager = require('../model/TransactionManager')
const utils = require('../utils/utils')
const cal = require('../utils/calculator-operations')


module.exports = { 

    errorCodes:{"UNSUPPORTED_OPERATION":3},

	operationMap:{
        'addition':cal.addition,
        'subtraction':cal.subtraction,
        'multiplication':cal.multiplication,
        'division':cal.division,
        'random_string':cal.randomString,
        'square_root':cal.squareRoot
    },

    getBalance: function(user){
        return new Promise((resolve,reject) => {
            TransactionManager.getUserBalance(user)
                .then(balance => resolve(balance))
                .catch(error => reject(error))
        })
    },

    validateOperation: function(operation){
        return new Promise((resolve,reject) => {
            if (!(operation in this.operationMap)) {
                reject(this.errorCodes.UNSUPPORTED_OPERATION) 
            } else {
                resolve(this.operationMap[operation])
            }
        })
    }, 

    consumeOperation: function(user,operation){
        return new Promise((resolve,reject) => {
            TransactionManager.consumeOperation(user,operation)
                .then(transactionId => resolve(transactionId))
                .catch(error => reject(error))            
        })
    },  
    
    addBalance: function(user,amount){
        return new Promise((resolve,reject) => {
            TransactionManager.addBalance(user,amount)
                .then(transactionId => resolve(transactionId))
                .catch(error => reject(error))            
        })
    },    

    calculateResult: function(operation,firstOperand,secondOperand) {
        return new Promise((resolve,reject) => {
            if (true) reject(1)
            else
            this.operationMap[operation](firstOperand,secondOperand)
                .then(result => resolve(result))
                .catch(error => reject(error))
        })
    },

    refundTransaction: function(user,transactionId) {
        return new Promise((resolve,reject) => {
            UserManager.findUser(user)
            .then(userId => TransactionManager.revertTransaction(userId,transactionId))            
            .then(result => {
                utils.logInfo("refund transaction:",result)
                resolve(result)
            })
            .catch(error => reject(error))
        })        
    }
    
};