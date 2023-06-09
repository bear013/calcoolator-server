const jwt = require('jsonwebtoken');
const database = require("./database.cjs");
require('dotenv').config();

module.exports = {
	responseTemplates: [{"httpCode":200,"resultCode":"0","message":"OK"},
						{"httpCode":500,"resultCode":"-1","message":"Internal Error"},
						{"httpCode":401,"resultCode":"-2","message":"Unauthorized"}],

	getResponse: function (index,params){
		var r = this.responseTemplates[index];
		var toReturn = {"httpCode":r.httpCode,"resultCode":r.resultCode,"message":r.message,"data":params};
		return toReturn;
	},

	login: function (req){
		return new Promise((resolve, reject) => {
			var username = req.body.username;
			var password = req.body.password;
			
			var loginSuccessful = false;
			
			//let db = new sqlite3.Database('./db/calculator.db');
			
			let sql = `SELECT balance,status FROM users where username=? and password=?`;

			var token = '';
			
			database.selectOneRow(database.db, sql, [username,password]).then(row => {
				if (row !== undefined){
					loginSuccessful = true;
					var d = new Date();
					console.log(`${d} - user ${username} just logged in`)
					token = jwt.sign( { user_id: username }, process.env.TOKEN_KEY, { expiresIn: "2h", } );
					if (row.status == 1){
						resolve(this.getResponse(0,{"token":token,"balance":row.balance}))
					} else {
						resolve(this.getResponse(2,{"token":"","balance":"0"}))
					}				
				}
			}).catch(err => {
				console.log(err);
				resolve(this.getResponse(1,{"token":"","balance":"0"}))
			})
		})
	}

}