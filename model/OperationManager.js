const Operation = require('./Operation')

module.exports = {
    getOneOperation: function(type) {
        return new Promise((resolve,reject) => {
            Operation.findOne({where: {type:type}})
                .then(r => {
                    if (r != null)
                        resolve(r)
                    else
                        reject('Operation not found')
                })
        })
    }
}