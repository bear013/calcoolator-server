let should = require('chai').should(),
  expect = require('chai').expect,
  supertest = require('supertest'),
  api = supertest('http://localhost:8099'),
  faker = require('faker')

let correctUsername = 'pepesilvia'
let correctPassword = 'carolhr'

let result

describe('Login', function () {

  it('should return HTTP 200 on success', function (done) {
    api.post('/auth/v2/login')
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
    api.post('/auth/v2/login')
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
    api.post('/auth/v2/login')
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
    api.post('/auth/v2/login')
      .set('Content-Type', 'application/json')
      .send({
        username: correctUsername,
        password: ''
      }).end(function (err, res) {
        expect(res.body.data.token).equal('')
        done()
      })
  })

})

