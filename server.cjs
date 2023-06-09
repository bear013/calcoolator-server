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


app.post('/calculator/v2/operations/:operation', function (req, res) {
	calculator.execOperation(req)
	.then(result => {res.status(result.httpCode).json(result)})
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