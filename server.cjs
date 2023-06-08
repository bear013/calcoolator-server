const path = require('path');
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express()
const port = 8099
require('dotenv').config();

const calculator = require('./calculator.cjs')

const sqlite3 = require('sqlite3').verbose();

//const sqlite = require('sqlite');

const fs = require('node:fs')

app.use(express.json());

app.use(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,x-access-token');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

async function wait3s() {
  console.log(1);
  await delay(3000);
  console.log(2);
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
 
app.use(express.static(path.resolve(__dirname, '/client/public')));

//app.post('/auth/v1/list/', function (req, res) {	
//	var username = req.body.username;
//	var password = req.body.password;
//	
//	var loginSuccessful = false;
//	
//	let sql = `SELECT balance,status FROM users`;
//
//	console.log(sql)
//	
//	const dbParams = {
//		filename: './db/calculator.db',
//		driver: sqlite3.Database
//	}
//	
//	sqlite.open(dbParams)
//	.then( db => db.get(sql))
//	.then(row => console.log(row))
//	.then(console.log('OK login outside'))
//	.then(res.status(200).json({"resultCode":"0","result":"OK","token":"test","balance":200}))
//
//});

app.post('/auth/v2/login/', function (req, res) {	
	var username = req.body.username;
	var password = req.body.password;
	
	var loginSuccessful = false;
	
	let db = new sqlite3.Database('./db/calculator.db');
	
	let sql = `SELECT balance,status FROM users where username='${username}' and password='${password}'`;

	console.log(sql)

	var token = '';

	db.get(sql, [], (err, row) => {
		if (err) {
			throw err;
		}
		
		if (row !== undefined) {
			loginSuccessful = true;
			console.log(row.balance);
		}
	  
		if (loginSuccessful) {
			token = jwt.sign( { user_id: username }, process.env.TOKEN_KEY, { expiresIn: "2h", } );
			
			//db.run(`UPDATE users SET token = '${token}' where username='${username}' and password='${password}'`);
			
			res.status(200).json({"resultCode":"0","result":"OK","token":token,"balance":row.balance});
		} else {
			res.status(403).json({"resultCode":"-2","result":"CANNOT AUTHENTICATE","token":"","balance":0});
		}	  
	  
	}).close();

});

app.post('/auth/v1/login/', function (req, res) {	
	var username = req.body.username;
	var password = req.body.password;
	
	var loginSuccessful = false;
	
	let db = new sqlite3.Database('./db/calculator.db');
	
	let sql = `SELECT balance,status FROM users where username='${username}' and password='${password}'`;

	console.log(sql)

	db.all(sql, [], (err, rows) => {
		if (err) {
			throw err;
		}
			rows.forEach((row) => {
			loginSuccessful = true;
			console.log(row.balance);
		});
	  
		if (loginSuccessful) {
			const token = jwt.sign(
			  { user_id: username },
			  process.env.TOKEN_KEY,
			  {
				expiresIn: "2h",
			  }
			);
			
			db.run(`UPDATE users SET token = '${token}' where username='${username}' and password='${password}'`);
			
			res.status(200);
			res.json({"resultCode":"0","result":"OK","token":token,"balance":row.balance});
		} else {
			res.status(403);
			res.json({"resultCode":"-2","result":"CANNOT AUTHENTICATE","token":"","balance":0});
		}	  
	  
	});

	db.close();
	

});

function addition(firstOperand,secondOperand){
	return new Promise((resolve, reject) => {
		var opResult = ''
		var opResult = parseFloat(firstOperand) + parseFloat(secondOperand);
		resolve({success: true, opResult: opResult});		
    });	
}

function subtraction(firstOperand,secondOperand){
	return new Promise((resolve, reject) => {
		var opResult = ''
		var opResult = parseFloat(firstOperand) - parseFloat(secondOperand);
		resolve({success: true, opResult: opResult});		
    });
}

function multiplication(firstOperand,secondOperand){
	return new Promise((resolve, reject) => {
		var opResult = ''
		opResult = parseFloat(firstOperand) / parseFloat(secondOperand);
		resolve({success: true, opResult: opResult});		
    });
}

function division(firstOperand,secondOperand){
	return new Promise((resolve, reject) => {
		var opResult = ''
		if (parseFloat(secondOperand) == 0)
			reject({success: false, opResult: opResult})
		else
			opResult = parseFloat(firstOperand) / parseFloat(secondOperand);
			resolve({success: true, opResult: opResult});		
    });
}

function randomString(firstOperand, secondOperand) {
    return new Promise((resolve, reject) => {
		var opRes='';
		calculator.getRandomNumber(randResult => 
							{console.log(randResult); 
							opRes = randResult[0][0];
							resolve({success: true, opResult: opRes})},
							rejResult => resolve({success: false, opResult: opRes}));
    });
}

function squareRoot(firstOperand,secondOperand){	
	return new Promise((resolve, reject) => {
		var opResult = ''
		opResult = Math.sqrt(parseFloat(firstOperand))
		resolve({success: true, opResult: opResult});		
    });	
}



const operationMap = {'addition':addition,
						'subtraction':subtraction,
						'multiplication':multiplication,
						'division':division,
						'random_string':randomString,
						'square_root':squareRoot};

function selectOneRow(database, query, params) {
	console.log(query)
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
	console.log(statement)
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
	console.log(req.body);
	console.log(req.get('content-type'));
	  
	var token = req.get('x-access-token');
	console.log(token);
	  
	var validToken = false;
	
	const decodedUsername = jwt.verify(token,process.env.TOKEN_KEY);
	console.log(decodedUsername)
	
	let db = new sqlite3.Database('./db/calculator.db');

	let sql = `SELECT balance FROM users where users.username = ?`;

	var response = {}
	var responseCode = {}

	selectOneRow(db, sql, [decodedUsername.user_id])
	.then(row => {
		if (row !== undefined) {
		  console.log(row.balance);
		  var firstOperand = req.body.firstOperand;
		  var secondOperand = req.body.secondOperand;
		  console.log(req.params.operation);
		  
		  if (operationMap[req.params.operation] == undefined) {
			return res.status(401).json({"resultCode":"-10","result":"Operation not supported","value":""});  
		  } else {
			  checkBalanceQuery = `select users.balance - operations.cost as new_balance from users,operations where users.username = '${decodedUsername.user_id}' and operations.type='${req.params.operation}'`;
			  selectOneRow(db, checkBalanceQuery, [])
			  .then(newBalance => {
				  if (newBalance.new_balance >= 0) {
					  operationMap[req.params.operation](firstOperand,secondOperand)
					  .then(result => {console.log(result); if (result.success){
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
						  return res.status(401).json({"resultCode":"-11","result":"There was an error executing the operation","value":""});
					  }})
					  //var result = operationMap[req.params.operation](firstOperand,secondOperand);
						
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

	console.log(sql)
		
	} catch (err) {
	  res.status(500).json({"resultCode":"-15","result":"internal error"})
	}
})



app.get('/calculator/v1/history', function (req, res) {
	calculator.getHistory(req).
	then(result => {res.status(result.httpCode).json(result)})
	
	//res.status(500).json({"resultCode":"-15","result":"not implemented yet"})
	
})


app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '/client/public', 'index.html'));
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})