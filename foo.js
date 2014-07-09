var request = require('request');
var config = require('./config');

var expectedTwiml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<Response><Say voice="alice">hello, monkey!</Say></Response>'
].join('');

request({
    method: 'POST',
    url: 'http://'+config.host+':'+config.port+'/twilio/voice'
}, function(err, response, body) {
    console.log(body);
});

