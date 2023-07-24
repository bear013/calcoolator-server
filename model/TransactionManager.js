const OperationManager = require('./OperationManager')
const TransactionTypeManager = require('./TransactionTypeManager')
const UserManager = require('./UserManager')
const Transaction = require('./Transaction')

module.exports = {

    getUserBalance: function(user){
        return new Promise((resolve,reject) => {
            UserManager.findUser(user)
            .then(result => Transaction.sum('amount',{where: {UserId:result.id}}))
            .then(balance => resolve(balance))
            .catch(e => {
                reject('Error while fetching Balance: ' + e)
            })
        })
    },

    addBalance: function(user,amount){
        return new Promise((resolve,reject) => {
            Promise.all([
                TransactionTypeManager.getOneTransactionType("addBalance"),
                UserManager.findUser(user)
            ]).then(results => 
                Transaction.create({
                    operation_response: 'OK',
                    amount: results[0].sign * amount,
                    TransactionTypeId: results[0].id,
                    UserId: results[1].id
                }))
            .then(result => resolve(result.transactionExternalId))
            .catch(error => reject("addBalance fail:" + error))            
        })
    },

    consumeOperation: function(user,operation){
        return new Promise((resolve,reject) => {
            Promise.all([
                TransactionTypeManager.getOneTransactionType("reduceBalance"),
                OperationManager.getOneOperation(operation),
                UserManager.findUser(user),
                this.getUserBalance(user)
            ]).then(results => {
                if (results[3] < results[1].cost) {
                    reject('Insufficient Balance to consume Operation')
                } else {
                Transaction.create({
                    operation_response: 'OK',
                    amount: results[0].sign * results[1].cost,
                    TransactionTypeId: results[0].id,
                    OperationId: results[1].id,
                    UserId: results[2].id
                    })
                }
            })
            .then(result => resolve(result.transactionExternalId))
            .catch(error => reject("consumeOperation fail:" + error))            
        })
    }   
}