const cal = require('../calculator.cjs');

describe("Calculator Tests", () => {
	test("Addition of 2 numbers", () => {
		cal.addition("1","2")
		.then(result => expect(result.opResult).toBe(3));
	});
	
	test("Subtraction of 2 numbers", () => {
		cal.subtraction("1","2")
		.then(result => expect(result.opResult).toBe(-1));
	});

	test("Multiplication of 2 numbers", () => {
		cal.multiplication("100","280")
		.then(result => expect(result.opResult).toBe(28000));
	});

	test("Division of 2 numbers", () => {
		cal.division("1","5")
		.then(result => expect(result.opResult).toBe(0.2));
	});	
	
	test("Sqrt of 2 numbers", () => {
		cal.squareRoot("4","")
		.then(result => expect(result.opResult).toBe(2));
	});	
	
})