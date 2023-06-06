const path = require('path');
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express()
const port = 8099
require('dotenv').config();

const sqlite3 = require('sqlite3').verbose();

const sqlite = require('sqlite');

const fs = require('node:fs')

app.use(express.json());

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
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

app.post('/auth/v1/list/', function (req, res) {	
	var username = req.body.username;
	var password = req.body.password;
	
	var loginSuccessful = false;
	
	//let db = new sqlite.Database('./db/calculator.db');
	

	
	let sql = `SELECT balance,status FROM users`;

	console.log(sql)
	
	const dbParams = {
		filename: './db/calculator.db',
		driver: sqlite3.Database
	}
	
	sqlite.open(dbParams)
	.then( db => db.get(sql))
	.then(row => console.log(row))
	.then(console.log('OK login outside'))
	.then(res.status(200).json({"resultCode":"0","result":"OK","token":"test","balance":200}))
	
	
	//all(sql).then(rows => console.log(rows))
		
	//rows.forEach((row) => {
	//	loginSuccessful = true;
	//	console.log(row);
	//});
	
	//if (loginSuccessful)
	//	console.log('OK login outside')
		
	//res.status(200);
	//res.json({"resultCode":"0","result":"OK","token":"test","balance":200});	

	// close the database connection
	//db.close();
	

});

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
			
			res.status(200).json({"resultCode":"0","result":"OK","token":token,"balance":200});
		} else {
			res.status(403).json({"resultCode":"-2","result":"CANNOT AUTHENTICATE","token":"","balance":0});
		}	  
	  
	}).close();

	// close the database connection
	//db.close();
	

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
			res.json({"resultCode":"0","result":"OK","token":token,"balance":200});
		} else {
			res.status(403);
			res.json({"resultCode":"-2","result":"CANNOT AUTHENTICATE","token":"","balance":0});
		}	  
	  
	});

	// close the database connection
	db.close();
	

});

//app.post('/calculator/operationsnew/:operation', function (req, res) {
//		
//	Auth.checkToken()
//		.then(Calc.validateInput)
//		.then(Calc.executeOperation)
//		.catch (e) {
//			res.json({"resultCode":"-10","result","value":opResult})
//		}
//});

function addition(firstOperand,secondOperand){
	var opResult = parseFloat(firstOperand) + parseFloat(secondOperand);
	return {success: true, opResult: opResult};
}

function subtraction(firstOperand,secondOperand){
	var opResult = parseFloat(firstOperand) - parseFloat(secondOperand);
	return {success: true, opResult: opResult};
}

function multiplication(firstOperand,secondOperand){
	var opResult = parseFloat(firstOperand) * parseFloat(secondOperand);
	return {success: true, opResult: opResult};
}

function division(firstOperand,secondOperand){
	var opResult = parseFloat(firstOperand) / parseFloat(secondOperand);
	return {success: true, opResult: opResult};
}

const operationMap = {'addition':addition,'subtraction':subtraction,'multiplication':multiplication,'division':division};

app.post('/calculator/operations/:operation', function (req, res) {
	try {		
	  console.log(req.body);
	  console.log(req.get('content-type'));
	  
	  var token = req.get('x-access-token');
	  console.log(token);
	  
	var validToken = false;
	
	const decodedUsername = jwt.verify(token,process.env.TOKEN_KEY);
	console.log(decodedUsername)
	
	let db = new sqlite3.Database('./db/calculator.db');
	
	let sql = `SELECT balance FROM users where username='${decodedUsername.user_id}'`;

	console.log(sql)

	db.get(sql, [], (err, row) => {
		if (err) {
			throw err;
		}
		
		if (row !== undefined) {
		  console.log(row.balance);
		  var firstOperand = req.body.firstOperand;
		  var secondOperand = req.body.secondOperand;
		  console.log(req.params.operation);
		  
		  if (operationMap[req.params.operation] == undefined) {
			res.status(401).json({"resultCode":"-10","result":"Operation not supported","value":""});  
		  } else {
			  var result = operationMap[req.params.operation](firstOperand,secondOperand);
			  if (result.success){
				  res.json({"resultCode":"0","result":"OK","value":result.opResult});		  
			  } else {
				  res.status(401).json({"resultCode":"-11","result":"There was an error executing the operation","value":""});
			  }
		  }		
		} else {
			res.status(403).json({"resultCode":"-2","result":"INVALID TOKEN","token":"","balance":0});
			
		}  
	  
	});

	// close the database connection
	db.close();	  
	  

		
	} catch (err) {
	  res.status(500);
	  res.json({"resultCode":"-15","result":"internal error"})
	}
})

//app.get('/calculator/history/getOperations/:username/:operationType/:page', function (req, res) {
//	try {
//	  console.log(req.body);
//	  res.json({"operations":[{"name":"addition","amount":"10"},{"user_balance":"990","operation_response":"Successful","date":"2023-05-31 12:03:01"},
//	  {"name":"subtraction","amount":"5"},{"user_balance":"985","operation_response":"Successful","date":"2023-05-31 12:03:01"},]})
//	} catch (err) {
//	  res.json({"result":"-15","message":"getProduct error"})
//	}
//})

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '/client/public', 'index.html'));
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})