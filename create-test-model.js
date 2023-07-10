const model = require('./User.cjs')

model.User.sync({ alter: true })
  .then(user => user.create({username:"pepesilvia",
    password:"carolhr",
    active:true,
    email:"pepesilvia@mockup.com"}))
  .then (model => console.log(model))
  .catch(e => {console.log("ERROR"); console.log(e)})
  //.then(user => user.create({username:"pepesilvia2",
  //password:"carolhr",
  //active:true,
  //email:"pepesilvia@mockup.com"}))
  //.then(user => console.log(user))
  //.then(user => user.findAll())
  //.then(users => console.log(users))

