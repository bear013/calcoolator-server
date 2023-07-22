const User = require('../model/User')
const Transaction = require('../model/Transaction')
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
            User.findOne({where: {username:user}})
            .then(result => Transaction.sum('amount',{where: {UserId:result.id}}))
            .then(balance => resolve(balance))
            .catch(e => {
                utils.logInfo('Error while fetching Balance: ' + e)
                reject(-1)
            })
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
            resolve('abcdef')
        })
    },    
};