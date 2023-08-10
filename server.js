require('dotenv').config();
const path = require('path');
const express = require('express');
const fs = require('fs')
const calculator = require('./services/calculator.js')
const auth = require('./services/auth.js')
const https = require('https')
const WebHostName = process.env.WEBHOSTNAME
const WebHostPort = process.env.WEBHOSTPORT
const port = process.env.WEBSERVICEPORT
const useHTTPS = (process.env.USEHTTPS == 'yes')
const utils = require('./utils/utils')

const app = express()
app.use(express.json());

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', `http://${WebHostName}:${WebHostPort}`);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,x-access-token');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use('/calculator/v2/',
	auth.checkUserTokenPresent,
	auth.validateUserToken,
	auth.validateUser);
 
app.post('/auth/v2/login/', function (req, res) {	
	auth.login(req)
	.then(result => {res.status(result.httpCode).json(result)})	
});

app.get('/calculator/v2/balance', function (req, res) {
	calculator.getUserBalance(req)
	.then(result => {res.status(result.httpCode).json(result)})
})

app.post('/calculator/v2/operations/:operation', function (req, res) {
	calculator.execOperation(req)
	.then(result => {res.status(result.httpCode).json(result)})
})

app.get('/calculator/v2/history', function (req, res) {
	calculator.getHistory(req)
	.then(result => {res.status(result.httpCode).json(result)})
})

app.delete('/calculator/v2/deleteRecord', function (req, res) {
	calculator.removeHistory(req)
	.then(result => {res.status(result.httpCode).json(result)})
})

if (useHTTPS) {
	const parameters = {
		key: key,
		cert: cert
	}

	let key = fs.readFileSync(__dirname+'/https/host.key','utf-8')
	let cert = fs.readFileSync(__dirname+'/https/host.crt','utf-8')
	
	let server = https.createServer(parameters,app)
	server.listen(port,()=>{
	  utils.logInfo(`HTTPS App is up at ${port}`)
	})
} else {
	app.listen(port, () => {
	  utils.logInfo(`HTTP App is up at ${port}`)
	})	
	
}

