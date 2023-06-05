const path = require('path');
const express = require('express');
const app = express()
const port = 8099

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

app.post('/calculator/operations/:operation', function (req, res) {
	try {
	  console.log(req.body);
	  console.log(req.get('content-type'));
	  var firstOperand = req.body.firstOperand;
	  var secondOperand = req.body.secondOperand;
	  console.log('before');
	  if (req.params.operation == 'addition') {
	    console.log('addition');
	    var opResult = parseFloat(firstOperand) + parseFloat(secondOperand);
		res.json({"result":"OK","value":opResult});
	  }
	  else if (req.params.operation == 'subtraction') {
	    console.log('subtraction');
	    var opResult = parseFloat(firstOperand) - parseFloat(secondOperand);
		res.json({"result":"OK","value":opResult});
	  }
	  else if (req.params.operation == 'multiplication') {
	    console.log('multiplication');
	    var opResult = parseFloat(firstOperand) * parseFloat(secondOperand);
		res.json({"result":"OK","value":opResult});
	  }
	  else if (req.params.operation == 'division') {
	    console.log('division');
	    var opResult = parseFloat(firstOperand) / parseFloat(secondOperand);
		res.json({"result":"OK","value":opResult});
	  }
	  //if (req.params.operation == 'squareroot') {
	  //  console.log('squareroot');
	  //  var opResult = parseFloat(firstOperand) + parseFloat(secondOperand);
		//res.json({"result":"OK","value":opResult});
	  //}
	  //if (req.params.operation == 'randomstring') {
	  //  console.log('randomstring');
	  //  var opResult = parseFloat(firstOperand) + parseFloat(secondOperand);
		//res.json({"result":"OK","value":opResult});
	  //}

	  else {
	    res.json({"result":"Operation not supported","value":opResult});
	  }
		
	} catch (err) {
	  res.json({"result":"-15","message":"internal error"})
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