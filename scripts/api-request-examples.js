const config = require('../config/config')

/* const request = {method:'POST',headers:{'content-type': 'application/json', 'x-access-token' : '...'},body:'{....}'}*/

console.log(`http://${config.host}:${config.webservicePort}`)


function executeRequest(endpoint,request){
    return new Promise((resolve,reject) => {
        fetch(`http://${config.host}:${config.webservicePort}${endpoint}`,
        {
            method: request.method,
            headers: request.headers,
            body: request.body
        })
        .then(response => resolve(response))     
        .catch(error => {
            //console.log(error);
            reject(error)
        })
    })
}

var loginRequest = {method:'POST',headers:{'content-type': 'application/json'},body:'{"username":"pepesilvia","password":"carolhr"}'}

executeRequest('/auth/v2/login/',loginRequest)
.then(r => console.log(r.status,r.text().then(t => console.log(t))))
.catch(e => console.log(e))
