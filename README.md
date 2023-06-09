# calcoolator-server
Backend for calcoolator-client

## Installation
This requires npm and node 18 or later.
To launch, install packages first:

`npm install`

Then launch with npm start:

`npm start`

## Configuration
Edit the .env file to adjust for your expected request source, ie. your frontend. Otherwise CORS will prevent the requests from succeeding.

TOKEN_KEY="baklavafalafelshawarma" <-Your secret JWT key. Change it if you're running your own server!

WEBHOSTNAME="localhost" <- where requests are expected to be coming from.

WEBHOSTPORT="3000" <- port of request source

WEBSERVICEPORT="8099" <- port that this application will expose.

A basic sqlite3 pre-cooked database is provided in db/calculator.db, but if you need to rebuild it from scratch you can delete that file and execute:

`node create-database.cjs`

Webservice is exposed as HTTP so keep that in mind.

## Endpoints

### POST /auth/v2/login
This endpoint validates sign in information and returns a token for consuming the rest of the services.

Required headers: 'content-type': 'application/json'

Request example: {"username":'johnny',"password":'five'}

Response example: {"resultCode":"0","result":"OK","token":".......","balance":"9000"}


### POST /calculator/v1/operation/{operation}
This endpoint attempts to execute the required mathematical operation and returns the result, plus the new credit balance after deducting the operation's cost. The operation is only fulfilled if the user attempting it has enough credits to cover the cost.

Possible operations: 'addition','subtraction','multiplication','division','random_string','square_root'

Random String generation requires no operands (send empty strings)

Square Root requires only firstOperand (send secondOperand as empty string)

Required headers: 'content-type': 'application/json' , 'x-access-token' : 'your jwt token from /login'

Request example: {"firstOperand":123,"secondOperand":47}

Response example: {"resultCode":"0","result":"OK","value":170,"balance":8004}

### GET /calculator/v1/history
This endpoint lists all the operations previously attempted by the user identified with the token, returning partial matches for specified filters.
This endpoint supports paging and page selection.

Query parameters: minAmount,maxAmount,fromDate,untilDate,type,offset

### DELETE /calculator/v1/deleteRecord
This endpoint receives a single recordId and attempts to erase it.
The records are soft deleted, only marking them as "inactive".

Request example: {"recordId":23}

Response example: {"httpCode":200,"resultCode":"0","message":"OK"}
