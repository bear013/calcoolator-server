require('dotenv').config();
const User = require('../model/User')
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
                utils.logInfo("checkToken decoded user:"+u)
                utils.logInfo("checkToken OK")
                resolve(u)
            });
        })
    },

    findUser: function(username){
        return new Promise((resolve, reject) => {
            utils.logInfo('findUser '+username)
            User.findOne({where: {username: username}})
            .then(user => {
                            if (user != null) {
                                resolve(user.id);
                            }
                            else {
                                reject(0);
                            }
                          })
            .catch(error => {reject(0)})
        })
    },

    login: function(username,password){
        return new Promise((resolve, reject) => {
            //utils.logInfo('login',username,password)
            User.findOne({where: {username: username, password:password}})
            .then(user => {
                            if (user != null) {
                                resolve(user.id);
                            }
                            else {
                                reject(0);
                            }
                          })
            .catch(error => {reject(0)})
        })
    }
    
}