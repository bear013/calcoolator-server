
const database = require("./database.js");
const authModel = require('./authModel.js');
const utils = require('./utils.js')

module.exports = {
login: function (req){
           return new Promise((resolve, reject) => {
                   var username = req.body.username;
                   var password = req.body.password;

                   var loginSuccessful = false;

                   let sql = `SELECT balance,status FROM users where username=? and password=?`;

                   database.selectOneRow(database.db, sql, [username,password]).then(row => {
                           if (row !== undefined) {
                                loginSuccessful = true;
                                var d = new Date();
                                console.log(`${d} - user ${username} just logged in`)
                                if (row.status == 1){
                                    var token = authModel.generateToken(username)
                                    resolve(utils.getResponse(0,{"token":token,"balance":row.balance}))
                                } else {
                                    resolve(utils.getResponse(2,{"token":"","balance":"0"}))
                                }				
                           } else {
                                resolve(utils.getResponse(2,{"token":"","balance":"0"}))
                           }
                           }).catch(err => {
                               console.log(err);
                               resolve(utils.getResponse(1,{"token":"","balance":"0"}))
                               })
           })
       },

checkUserTokenPresent: function (req,res, next){
    if (req.get('x-access-token')){
        next();
    } else {
        response = utils.getResponse(2,{})
        res.status(response.httpCode).json(response)
    }
},

validateUserToken: function (req, res, next) {
    console.log("validateUserToken start")
    const token = req.get('x-access-token');
    authModel.checkToken(token).then(user => {
        console.log(user)
        console.log("validateUserToken OK:"+user)
        req.user = user;
        next();
    }).catch( e => {
        console.log("validateUserToken FAIL")
        response = utils.getResponse(3,{})
        res.status(response.httpCode).json(response)
    })
},

validateUser: function (req,res,next){
    authModel.findUser(req.user).then( result => {
        next();
    }
    ).catch(e => {
        console.log(e)
        console.log('validateUser failed - user not found')
        response = utils.getResponse(2,{})
        res.status(response.httpCode).json(response)
    })
}


}
