const User = require('../model/User')
const Operation = require('../model/Operation')
const Transaction = require('../model/Transaction')

User.findAll()
.then(result => result.map(u => console.log(u.id,u.username,u.email)))
.then(a => Operation.findAll())
.then(result => result.map(o => console.log(o.id,o.type,o.cost)))
.then(a => Transaction.findAll())
.then(result => result.map(t => console.log(t.id,t.amount,t.TransactionTypeId,t.UserId,t.OperationId)))
.then(a => User.findOne({where: {username:'pepesilvia'}}))
.then(result => Transaction.sum('amount',{where: {UserId:result.id}}))
.then(result => console.log(result))
.catch(error => console.log(error))

  
  