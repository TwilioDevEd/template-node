var http = require('http');
var express = require('express');
var config = require('./config');

// Create an Express web app
var app = express();

// Configure routes and middleware for the application
require('./routes')(app);

// Create and start an HTTP server to run our application
var server = http.createServer(app);
server.listen(config.port, function() {
    console.log('Express server running on port ' + config.port);
});

// export the HTTP server as the public module interface
module.exports = server;
