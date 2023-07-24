const genrandom = require("./genrandom.js");

module.exports = {

	addition: function (firstOperand,secondOperand){
	return new Promise((resolve, reject) => {
		var opResult = parseFloat(firstOperand) + parseFloat(secondOperand);
		resolve(opResult);		
    });	
},

	subtraction: function (firstOperand,secondOperand){
	return new Promise((resolve, reject) => {
		var opResult = parseFloat(firstOperand) - parseFloat(secondOperand);
		resolve(opResult);		
    });
},

	multiplication: function (firstOperand,secondOperand){
	return new Promise((resolve, reject) => {
		var opResult = parseFloat(firstOperand) * parseFloat(secondOperand);
		resolve(opResult);		
    });
},

	division: function (firstOperand,secondOperand){
	return new Promise((resolve, reject) => {
		var opResult = ''
		if (parseFloat(secondOperand) == 0)
			reject("Cannot divide by 0")
		else
			opResult = parseFloat(firstOperand) / parseFloat(secondOperand);
			resolve(opResult);		
    });
},

	randomString: function (firstOperand, secondOperand) {
    return new Promise((resolve, reject) => {
		var opRes='';
		genrandom.getRandomNumber(randResult => {
				opRes = randResult[0][0];
				resolve(opRes)
			},
			rejResult => resolve("Random number generator not available:" + rejResult));
    });
},

	squareRoot: function (firstOperand,secondOperand){	
	return new Promise((resolve, reject) => {
		var opResult = ''
		opResult = Math.sqrt(parseFloat(firstOperand))
		resolve(opResult);		
    });	
}

}