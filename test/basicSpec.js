var http = require('http');
var twilio = require('twilio');
var request = require('request');
var expect = require('chai').expect;
var server = require('../app.js');
var config = require('../config');

describe('the basic Twilio template project', function() {
    it('should have valid Twilio account info', function(done) {
        var client = twilio(config.accountSid, config.authToken);
        client.incomingPhoneNumbers.get({
            phoneNumber: config.twilioNumber
        }, function(err) {
            expect(err).to.not.be.ok;
            done();
        });
    });

    it('should emit valid twiml for voice', function(done) {
        var expectedTwiml = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<Response><Say voice="alice">hello, monkey!</Say></Response>'
        ].join('');

        request({
            method: 'POST',
            url: 'http://'+config.host+':'+config.port+'/twilio/voice'
        }, function(err, response, body) {
            expect(body).to.equal(expectedTwiml);
            done();
        });
    });

    it('should emit valid twiml for messaging', function(done) {
        var expectedTwiml = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<Response><Message>hello, monkey!</Message></Response>'
        ].join('');

        request({
            method: 'POST',
            url: 'http://'+config.host+':'+config.port+'/twilio/message'
        }, function(err, response, body) {
            expect(body).to.equal(expectedTwiml);
            done();
        });
    });

});

