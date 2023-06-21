require('dotenv').config();
database = require('./database.cjs')
const jwt = require('jsonwebtoken');
const SecretJWTKey = process.env.TOKEN_KEY

module.exports = { 

    checkToken: function(token){
        console.log('checkToken')
        jwt.verify(token, SecretJWTKey , (err, user) => {
            if (err) {
                return false;
            }
            return user;
        });
    },

    findUser: function(username){
        return new Promise((resolve, reject) => {
            console.log('findUser '+username)
            let sql = `SELECT balance FROM users where users.username = ?`;

			database.selectOneRow(database.db, sql, [username])
			.then(row => {
				if (row !== undefined) {
                    resolve(row.balance)
                } else {
                    reject(0)
                }
            })
        })
    }
    
}