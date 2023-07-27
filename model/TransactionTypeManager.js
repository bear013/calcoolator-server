const TransactionType = require('./TransactionType')

module.exports = {
    getOneTransactionType: function(type) {
        return new Promise((resolve,reject) => {
            TransactionType.findOne({where: {name:type}})
                .then(r => {
                    if (r != null)
                        resolve(r)
                    else
                        reject('TransactionType not found')
                })
        })
    }
}