const genrandom = require("./genrandom.cjs");

module.exports = {

	addition: function (firstOperand,secondOperand){
	return new Promise((resolve, reject) => {
		var opResult = ''
		var opResult = parseFloat(firstOperand) + parseFloat(secondOperand);
		resolve({success: true, opResult: opResult});		
    });	
},

	subtraction: function (firstOperand,secondOperand){
	return new Promise((resolve, reject) => {
		var opResult = ''
		var opResult = parseFloat(firstOperand) - parseFloat(secondOperand);
		resolve({success: true, opResult: opResult});		
    });
},

	multiplication: function (firstOperand,secondOperand){
	return new Promise((resolve, reject) => {
		var opResult = ''
		opResult = parseFloat(firstOperand) * parseFloat(secondOperand);
		resolve({success: true, opResult: opResult});		
    });
},

	division: function (firstOperand,secondOperand){
	return new Promise((resolve, reject) => {
		var opResult = ''
		if (parseFloat(secondOperand) == 0)
			reject({success: false, opResult: opResult})
		else
			opResult = parseFloat(firstOperand) / parseFloat(secondOperand);
			resolve({success: true, opResult: opResult});		
    });
},

	randomString: function (firstOperand, secondOperand) {
    return new Promise((resolve, reject) => {
		var opRes='';
		genrandom.getRandomNumber(randResult => 
							{opRes = randResult[0][0];
							resolve({success: true, opResult: opRes})},
							rejResult => resolve({success: false, opResult: opRes}));
    });
},

	squareRoot: function (firstOperand,secondOperand){	
	return new Promise((resolve, reject) => {
		var opResult = ''
		opResult = Math.sqrt(parseFloat(firstOperand))
		resolve({success: true, opResult: opResult});		
    });	
}

}