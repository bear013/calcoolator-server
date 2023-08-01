const utils = require('../utils/utils')
const OperationManager = require('./OperationManager')
const TransactionTypeManager = require('./TransactionTypeManager')
const UserManager = require('./UserManager')
const Transaction = require('./Transaction')
const { Op } = require('sequelize')

module.exports = {

    errorCodes:{"INTERNAL_ERROR":2,"INSUFFICIENT_BALANCE":4},
    
    getUserBalance: function(user){
        return new Promise((resolve,reject) => {
            UserManager.findUser(user)
            .then(result => Transaction.sum('amount',{where: {UserId:result.id}}))
            .then(balance => resolve(balance))
            .catch(e => {
                utils.logInfo('Error while fetching Balance: ' + e)
                reject(this.errorCodes.INTERNAL_ERROR)
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
            .catch(error => {
                utils.logInfo("addBalance fail:" + error)
                reject(this.errorCodes.INTERNAL_ERROR)
            })            
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
                    reject(this.errorCodes.INSUFFICIENT_BALANCE)
                } else {
                return Transaction.create({
                    operation_response: 'OK',
                    amount: results[0].sign * results[1].cost,
                    TransactionTypeId: results[0].id,
                    OperationId: results[1].id,
                    UserId: results[2].id
                    })
                }
            })
            .then(result => resolve(result.transactionExternalId))
            .catch(error => {
                utils.logInfo("consumeOperation fail:" + error)
                reject(this.errorCodes.INTERNAL_ERROR)
            })            
        })
    },
    
    revertTransaction: function(user,trExternalId){
        return new Promise((resolve,reject) => {
            Transaction.destroy({ where: {transactionExternalId: trExternalId,UserId:user}})
            .then(result => {
                utils.logInfo("revertTransaction:",result)
                resolve(0)
            })
            .catch(error => reject(-1))
        })

    },

    deactivateTransaction: function(userId,externalTransactionId){
        return new Promise((resolve,reject) => {
            Transaction.update({active: 0},{where:{UserId:userId,transactionExternalId:externalTransactionId}})
            .then(r => {
                utils.logInfo(r)
                resolve(r)
            })
            .catch(e => {
                utils.logInfo(e)
                reject(e)
            })
        })

    },

    getAllTransactionsForUser: function(userId,queryParams){
        return new Promise((resolve,reject) => {
            utils.logInfo('getAllTransactionsForUser:',userId)
            var limit = queryParams.LIMIT
            var offset = parseInt(queryParams.PAGE - 1) * parseInt(queryParams.LIMIT)
            var orderBy = [[queryParams.ORDERBY,queryParams.ORDERING]]
            var whereConditions = {
                UserId: userId,
                active : 1,
                operation_date: { [Op.between] : [queryParams.fromDate, queryParams.untilDate] },
                amount: { [Op.between] : [queryParams.minAmount, queryParams.maxAmount] }
            }
            Transaction.findAndCountAll({
                attributes: ['operation_response','operation_date','amount','transactionExternalId'],
                where: whereConditions,
                limit: limit,
                offset: offset,
                order: orderBy
            })
            .then(r => resolve(r))
            .catch(e => {
                utils.logInfo(e)
                reject(e)
            })
        })
    }

}