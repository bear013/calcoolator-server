const path = require('path');
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express()

const calculator = require('./calculator.cjs')
require('dotenv').config();

const WebHostName = process.env.WEBHOSTNAME
const WebHostPort = process.env.WEBHOSTPORT
const port = process.env.WEBSERVICEPORT

const sqlite3 = require('sqlite3').verbose();

const fs = require('node:fs')

app.use(express.json());

app.use(function (req, res, next) {

    //res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
	res.setHeader('Access-Control-Allow-Origin', `http://${WebHostName}:${WebHostPort}`);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,x-access-token');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
 
app.use(express.static(path.resolve(__dirname, '/client/public')));

app.post('/auth/v2/login/', function (req, res) {	
	var username = req.body.username;
	var password = req.body.password;
	
	var loginSuccessful = false;
	
	let db = new sqlite3.Database('./db/calculator.db');
	
	let sql = `SELECT balance,status FROM users where username='${username}' and password='${password}'`;

	var token = '';

	db.get(sql, [], (err, row) => {
		if (err) {
			throw err;
		}
		
		if (row !== undefined) {
			loginSuccessful = true;
			var d = new Date();
			console.log(`${d} - user ${username} just logged in`)
		}
	  
		if (loginSuccessful) {
			token = jwt.sign( { user_id: username }, process.env.TOKEN_KEY, { expiresIn: "2h", } );
			
			res.status(200).json({"resultCode":"0","result":"OK","token":token,"balance":row.balance});
		} else {
			res.status(403).json({"resultCode":"-2","result":"CANNOT AUTHENTICATE","token":"","balance":0});
		}	  
	  
	}).close();

});

const operationMap = {'addition':calculator.addition,
						'subtraction':calculator.subtraction,
						'multiplication':calculator.multiplication,
						'division':calculator.division,
						'random_string':calculator.randomString,
						'square_root':calculator.squareRoot};

function selectOneRow(database, query, params) {
    return new Promise((resolve, reject) => {
        database.get(query, params, (err, row) => {
            if (err) {
                reject(err); 
            } else {
				resolve(row);
            }
        });
    });
}

function execStatement(database, statement, params) {
    return new Promise((resolve, reject) => {
        database.run(statement,params, (err) => {
            if (err) {
                reject(err); 
            } else {
				resolve("OK");
            }
        });
    });
}

app.post('/calculator/v1/operations/:operation', function (req, res) {
	try {		
	var token = req.get('x-access-token');
	  
	var validToken = false;
	
	const decodedUsername = jwt.verify(token,process.env.TOKEN_KEY);
	
	let db = new sqlite3.Database('./db/calculator.db');

	let sql = `SELECT balance FROM users where users.username = ?`;

	var response = {}
	var responseCode = {}

	selectOneRow(db, sql, [decodedUsername.user_id])
	.then(row => {
		if (row !== undefined) {
		  var oldBalance = row.balance;
		  var firstOperand = req.body.firstOperand;
		  var secondOperand = req.body.secondOperand;
		  
		  if (operationMap[req.params.operation] == undefined) {
			return res.status(401).json({"resultCode":"-10","result":"Operation not supported","value":""});  
		  } else {
			  checkBalanceQuery = `select users.balance - operations.cost as new_balance from users,operations where users.username = '${decodedUsername.user_id}' and operations.type='${req.params.operation}'`;
			  selectOneRow(db, checkBalanceQuery, [])
			  .then(newBalance => {
				  if (newBalance.new_balance >= 0) {
					  operationMap[req.params.operation](firstOperand,secondOperand)
					  .then(result => {if (result.success){
						  execStatement(db,`update users set balance = ?`,newBalance.new_balance)
						  execStatement(db,`insert into records (operation_id,user_id,amount,user_balance,operation_response,operation_date,active) 
															select op.id as operation_id, 
															u.id as user_id,
															op.cost as amount,
															u.balance as balance,
															'OK' as operation_response,
															datetime('now') as operation_date,
															1 as active
															from operations op, users u
															where op.type = ?
															and u.username = ?`,[req.params.operation,decodedUsername.user_id])
							
						  return res.status(200).json({"resultCode":"0","result":"OK","value":result.opResult,"balance":newBalance.new_balance});		  
						} else {
						  return res.status(401).json({"resultCode":"-11","result":"There was an error executing the operation","value":"","balance":oldBalance});
					  }})
						
				  } else {
					  return res.status(401).json({"resultCode":"-20","result":"The current balance is insufficient to execute the operation","value":"","newBalance":row.balance});
				  }
				  
			  })
			  
		  }		
		} else {
			return res.status(403).json({"resultCode":"-2","result":"INVALID TOKEN","token":"","balance":0});			
		}
	})
	.catch(error => {
		console.log(error)
		return res.status(500).json({"resultCode":"-15","result":"internal error"})
	});
		
	} catch (err) {
	  res.status(500).json({"resultCode":"-15","result":"internal error"})
	}
})



app.get('/calculator/v1/history', function (req, res) {
	calculator.getHistory(req)
	.then(result => {res.status(result.httpCode).json(result)})
})

app.delete('/calculator/v1/deleteRecord', function (req, res) {
	calculator.removeHistory(req)
	.then(result => {res.status(result.httpCode).json(result)})
})

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '/client/public', 'index.html'));
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})