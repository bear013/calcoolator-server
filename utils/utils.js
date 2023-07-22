require('dotenv').config();

module.exports = { 

    responseTemplates: [{"httpCode":200,"resultCode":"0","message":"OK"},
                   {"httpCode":500,"resultCode":"-1","message":"Internal Error"},
                   {"httpCode":401,"resultCode":"-2","message":"Unauthorized"},
                   {"httpCode":403,"resultCode":"-3","message":"Forbidden"}],

    getResponse: function (index,params){
        var r = this.responseTemplates[index];
        var toReturn = {"httpCode":r.httpCode,"resultCode":r.resultCode,"message":r.message,"data":params};
        return toReturn;
    },

    logInfo: function (...data){
        var d = new Date();
        console.log(d.toString(),'|',...data);
    }
    
}