const UserManager = require('../model/UserManager')
const TransactionManager = require('../model/TransactionManager')
const utils = require('../utils/utils')
const cal = require('../utils/calculator-operations')


module.exports = { 

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
            if (!this.operationMap.includes(operation)) {
                reject('Non-Existant Operation') 
            } else {
                resolve(this.operationMap[operation])
            }
        })
    }, 

    consumeOperation: function(user,operation){
        return new Promise((resolve,reject) => {
            TransactionManager.consumeOperation(user,operation)
                .then(transactionId => resolve(transactionId))
                .catch(error => reject("consumeOperation fail:" + error))            
        })
    },  
    
    addBalance: function(user,amount){
        return new Promise((resolve,reject) => {
            TransactionManager.addBalance(user,amount)
                .then(transactionId => resolve(transactionId))
                .catch(error => reject("addBalance fail:" + error))            
        })
    },    

    calculateResult: function(operation,firstOperand,secondOperand) {
        return new Promise((resolve,reject) => {
            this.operationMap[operation](firstOperand,secondOperand)
                .then(result => resolve(result))
                .catch(error => reject(error))
        })
    },

    refundTransaction: function(user,transactionId) {
        return new Promise((resolve,reject) => {
            resolve(-1)
        })        
    }
    
};