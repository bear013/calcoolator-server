const User = require('./model/User')
const Operation = require('./model/Operation')
const Transaction = require('./model/Transaction')

User.sync({ alter: true })
  .then(user => user.create({username:"pepesilvia",
    password:"carolhr",
    active:true,
    email:"pepesilvia@mockup.com"}))
  .then (model => console.log(model))
  .then(Operation.sync({alter:true}))
  .then(operation => operation.create({type:'addition',cost:1}))
  .then (model => console.log(model))
  .catch(e => {console.log("ERROR"); console.log(e)})
  //.then(user => user.create({username:"pepesilvia2",
  //password:"carolhr",
  //active:true,
  //email:"pepesilvia@mockup.com"}))
  //.then(user => console.log(user))
  //.then(user => user.findAll())
  //.then(users => console.log(users))

