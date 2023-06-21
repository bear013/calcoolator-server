let should = require('chai').should(),
  expect = require('chai').expect,
  supertest = require('supertest'),
  api = supertest('http://localhost:3000'),
  faker = require('faker')

let tokenSymbol = faker.lorem.word()
let result

describe('Token', function () {
  before(function (done) {
    api.post('/api/tokens')
      .set('Accept', 'application/x-www-form-urlencoded')
      .send({
        name: faker.name.findName(),
        symbol: tokenSymbol,
        owner: faker.lorem.word(),
        userId: faker.random.uuid(),
        txHash: faker.lorem.word()
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function (err, res) {
        done()
      })
  })

  it('should return a 200 response', function (done) {
    api
      .get(`/api/tokens/${tokenSymbol}`)
      .set('Accept', 'application/json')
      .expect(200, done)
  })

  it('should return a 400 response', function (done) {
    api
      .get('/api/tokens/hello')
      .set('Accept', 'application/json')
      .expect(400, done)
  })
})

