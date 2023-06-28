const model = require('./model.cjs')

model.User.create({username:"pepesilvia",
  password:"carolhr",
  active:true,
  email:"pepesilvia@mockup.com"}).then(model.User.findAll().then(users => console.log(users)))

