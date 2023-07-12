const random = require("./random.js");

module.exports = {
	randomGenOptions:  {
		secure: true, // Make the request secure
		min: 0,     // Lower bound 0
		max: 1000000000,      // Upper bound 10
		col: 1,       // 1 column
		base: 10,     // Use Base 10
		rnd: "new" // Which set of random numbers to use
	},

	getRandomNumber: function (resolve,reject){
		random.generateIntegers(resolve,this.randomGenOptions,reject);
	}
}