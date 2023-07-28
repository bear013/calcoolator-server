const User = require('./User')
const utils = require('../utils/utils')

module.exports = {
    findUser: function(username){
        return new Promise((resolve, reject) => {
            utils.logInfo('findUser',username)
            User.findOne({where: {username: username}})
            .then(user => {
                            if (user != null) {
                                resolve(user);
                            }
                            else {
                                reject("user not found");
                            }
                          })
            .catch(error => reject("error while fetching user:" + error))
        })
    }
}