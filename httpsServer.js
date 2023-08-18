const config = require('./config/config')
const utils = require('./utils/utils')

module.exports = {
    startServer: (app) => {
        const port = config.webservicePort
        if (config.useHTTPS) {
            const parameters = {
                key:fs.readFileSync(config.hostKey,'utf-8'),
                cert:fs.readFileSync(config.hostCert,'utf-8')
            }
            
            let server = https.createServer(parameters,app)
            server.listen(port,()=>{
            utils.logInfo(`HTTPS App is up at ${port}`)
            })
        } else {
            app.listen(port, () => {
            utils.logInfo(`HTTP App is up at ${port}`)
            })	        
        }

    }
}