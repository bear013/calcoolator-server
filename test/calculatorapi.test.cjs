const testConfig = require('./test.config.cjs')
const should = require('chai').should()
const expect = require('chai').expect
const supertest = require('supertest')
const api = supertest(testConfig.address)
const faker = require('faker')

let correctUsername = testConfig.username
let correctPassword = testConfig.password
let loginUri = testConfig.loginUri
let calculatorUri = testConfig.calculatorUri



describe('Calculator', function () {
  var token  
  before(function (done) { 
    api.post(loginUri)
      .set('Content-Type', 'application/json')
      .send({
        username: correctUsername,
        password: correctPassword
      }).end(function (err, res) {
        expect(res.statusCode).to.equal(200)
        token = res.body.data.token
        done()
      })  
});

  it('should return HTTP 200 on addition success', function (done) {
    api.post(calculatorUri+'addition')
      .set('Content-Type', 'application/json')
      .set('x-access-token', token)
      .send({
        firstOperand: 20,
        secondOperand: 30
      })
      .end(function (err, res) {
        expect(res.statusCode).to.equal(200)
        done()
      })
  })

  /*it('should return the correct value on addition success', function (done) {
    api.post(calculatorUri)
      .set('Content-Type', 'application/json')
      .set('x-access-token', token)
      .send({
        firstOperand: 20,
        secondOperand: 30
      }).end(function (err, res) {
        expect(res.statusCode).to.equal(400)
        done()
      })
  })*/


})

