const {sequelize} = require('./model/db')
const User = require('./model/User')
const Operation = require('./model/Operation')
const Transaction = require('./model/Transaction')
const TransactionType = require('./model/TransactionType')

var createdUser;
var transactionType;
var transaction;

sequelize.sync({ alter: true })
  .then(nothing => TransactionType
  .bulkCreate([
    {name:"addBalance",sign:1},
    {name:"reduceBalance",sign:-1},
    {name:"balanceUnchanged",sign:0}]))
  .then(nothing => Operation
  .bulkCreate([
    {type:'addition',cost:1},
    {type:'subtraction',cost:2},
    {type:'multiplication',cost:3},
    {type:'division',cost:5},
    {type:'square_root',cost:8},
    {type:'random_string',cost:13}]))
  .then(nothing => TransactionType.findOne({where: {name:"addBalance"}}))
  .then(type => {transactionType = type; console.log(transactionType.id);})
  .then(nothing => User.findOrCreate({
    where: { username: 'pepesilvia' },
    defaults: {username:"pepesilvia",
      password:"carolhr",
      active:true,
      email:"pepesilvia@mockup.com"}
   }))
  .then(user => {createdUser = user[0]; console.log(createdUser.id);})
  .then(nothing => Transaction.create({active:true,
                                      operation_response:'OK',amount:1000,TransactionTypeId: transactionType.id,UserId:createdUser.id}))
  .catch(e => {console.log("ERROR"); console.log(e)})


