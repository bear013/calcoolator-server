require('dotenv').config();

module.exports = {
    dbLocation: './db/calculator.sqlite',
    tokenHeaderName: 'x-access-token',

    host: process.env.WEBHOSTNAME,
    webPort: process.env.WEBHOSTPORT,
    webservicePort: process.env.WEBSERVICEPORT,
    useHTTPS: process.env.USEHTTPS == "yes" ? true:false,
    tokenKey: process.env.TOKEN_KEY,
    httpsHostKey: __dirname+'/https/host.key',
    httpsHostCert: __dirname+'/https/host.crt',
    accessControlAllowOrigin: `http://${process.env.WEBHOSTNAME}:${process.env.WEBHOSTPORT}`

}