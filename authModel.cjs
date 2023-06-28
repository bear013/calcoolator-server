require('dotenv').config();
//database = require('./database.cjs')
const model = require('model')
const jwt = require('jsonwebtoken');
const SecretJWTKey = process.env.TOKEN_KEY

module.exports = { 
    generateToken: function(username){
        var token = jwt.sign( { user_id: username }, 
                                SecretJWTKey, 
                                { expiresIn: "2h" } );
        return token;
    },

    checkToken: function(token){
        console.log('checkToken')
        return new Promise((resolve, reject) => {
            jwt.verify(token, SecretJWTKey , (err, user) => {
                if (err) {
                    console.log("checkToken FAIL")
                    reject()
                }
                var u = user.user_id
                console.log("checkToken decoded user:"+u)
                console.log("checkToken OK")
                resolve(u)
            });
        })
    },

    findUser: function(username){
        return new Promise((resolve, reject) => {
            console.log('findUser '+username)
            //let sql = `SELECT 1 as result FROM users where users.username = ?`;
			//database.selectOneRow(database.db, sql, [username])
			//.then(row => {
			//	if (row !== undefined) {
            //        resolve(1)
            //    } else {
            //        reject(0)
            //    }
            //})
        })
    }
    
}