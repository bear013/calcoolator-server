const testConfig = require('./test.config.js')
const should = require('chai').should()
const expect = require('chai').expect
const supertest = require('supertest')
const api = supertest(testConfig.address)
const faker = require('faker')

let correctUsername = testConfig.username
let correctPassword = testConfig.password
let uri = testConfig.loginUri

describe('Login', function () {
  it('should return HTTP 200 on success', function (done) {
    api.post(uri)
      .set('Content-Type', 'application/json')
      .send({
        username: correctUsername,
        password: correctPassword
      }).end(function (err, res) {
        expect(res.statusCode).to.equal(200)
        done()
      })
  })

  it('should return HTTP 401 on failure', function (done) {
    api.post(uri)
      .set('Content-Type', 'application/json')
      .send({
        username: correctUsername,
        password: ''
      }).end(function (err, res) {
        expect(res.statusCode).to.equal(401)
        done()
      })
  })

  it('should return a token on success', function (done) {
    api.post(uri)
      .set('Content-Type', 'application/json')
      .send({
        username: correctUsername,
        password: correctPassword
      }).end(function (err, res) {
        expect(res.body.data.token).not.equal('')
        done()
      })
  })

  it('should NOT return a token on failure', function (done) {
    api.post(uri)
      .set('Content-Type', 'application/json')
      .send({
        username: correctUsername,
        password: ''
      }).end(function (err, res) {
        expect(res.body.data.token).to.equal('')
        done()
      })
  })

})

