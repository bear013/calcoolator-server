require('dotenv').config();
const UserManager = require('../model/UserManager')
const jwt = require('jsonwebtoken');
const SecretJWTKey = process.env.TOKEN_KEY
const utils = require('../utils/utils')

module.exports = { 
    generateToken: function(username){
        var token = jwt.sign( { user_id: username }, 
                                SecretJWTKey, 
                                { expiresIn: "2h" } );
        return token;
    },

    checkToken: function(token){
        utils.logInfo('checkToken')
        return new Promise((resolve, reject) => {
            jwt.verify(token, SecretJWTKey , (err, user) => {
                if (err) {
                    utils.logInfo("checkToken FAIL")
                    reject()
                }
                var u = user.user_id
                utils.logInfo("checkToken decoded user OK:"+u)
                resolve(u)
            });
        })
    },

    findUserId: function(username){
        return new Promise((resolve, reject) => {
            utils.logInfo('findUserId',username)
            UserManager.findUser(username)
            .then(user => resolve(user.id))
            .catch(error => reject(error))
        })
    },

    login: function(username,password){
        return new Promise((resolve, reject) => {
            UserManager.findUser(username)
            .then(user => resolve(user.password == password))
            .catch(error => reject(error))
        })
    }    
    
}