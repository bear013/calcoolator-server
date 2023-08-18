const config = require('../config/config')

/* const request = {method:'POST',headers:{'content-type': 'application/json', 'x-access-token' : '...'},body:'{....}'}*/

function executeRequest(endpoint,request){
    return new Promise((resolve,reject) => {
        fetch(`http://${config.host}:${config.webservicePort}${endpoint}`,
        {
            method: request.method,
            headers: request.headers,
            body: request.body
        })
        .then(response => console.log(response))     
        .catch(error => {
            console.log(error);
        })
    })
}

var request = {method:'POST',headers:{'content-type': 'application/json', 'x-access-token' : '...'},body:'{}'}

executeRequest('/example',request).then(
    r => console.log(r.response.status,r.response.body)
)
