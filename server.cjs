const path = require('path');
const express = require('express');
//const jwt = require('jsonwebtoken');
const fs = require('fs')
const calculator = require('./calculator.cjs')
const auth = require('./auth.cjs')
require('dotenv').config();
const https = require('https')
const WebHostName = process.env.WEBHOSTNAME
const WebHostPort = process.env.WEBHOSTPORT
const port = process.env.WEBSERVICEPORT
const useHTTPS = process.env.USEHTTPS

const app = express()
app.use(express.json());

app.use(function (req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', `http://${WebHostName}:${WebHostPort}`);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,x-access-token');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
 
app.use(express.static(path.resolve(__dirname, '/client/public')));

app.post('/auth/v2/login/', function (req, res) {		
	auth.login(req)
	.then(result => {res.status(result.httpCode).json(result)})	
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

if (useHTTPS == "yes") {
	const parameters = {
		key: key,
		cert: cert
	}

	let key = fs.readFileSync(__dirname+'/host.key','utf-8')
	let cert = fs.readFileSync(__dirname+'/host.crt','utf-8')
	
	let server = https.createServer(parameters,app)
	server.listen(port,()=>{
	  console.log(`HTTPS App is up at ${port}`)
	})
} else {
	app.listen(port, () => {
	  console.log(`HTTP App is up at ${port}`)
	})	
	
}

