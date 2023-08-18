const config = require('./config/config')
const express = require('express');
const calculator = require('./services/calculator.js')
const auth = require('./services/auth.js')
const AccessControlAllowOrigin = config.accessControlAllowOrigin
const httpsServer = require('./httpsServer')

const app = express()
app.use(express.json());

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', AccessControlAllowOrigin);
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

httpsServer.startServer(app)

