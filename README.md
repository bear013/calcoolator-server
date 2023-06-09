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

Webservice is exposed as HTTP so keep that in mind.



