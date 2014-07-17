var path = require('path');
var express = require('express');
var morgan = require('morgan');
var parseBody = require('body-parser').urlencoded({ extended: true });
var twilio = require('twilio');
var config = require('../config');

// create a Twilio REST API client to re-use for API access
var client = twilio(config.accountSid, config.authToken);

// Configure appplication routes
module.exports = function(app) {

    // Use EJS templates to render HTML
    app.set('view engine', 'ejs');

    // Mount Express middleware for serving static content from the "public" 
    // directory
    app.use(express.static(path.join(process.cwd(), 'public')));

    // Use morgan for HTTP request logging
    app.use(morgan());

    // Parse request body for all twilio webhooks
    app.use('/twilio/*', parseBody);

    // In production, validate that inbound requests have in fact originated
    // from Twilio. In our node.js helper library, we provide Express middleware 
    // for this purpose. This validation will only be performed in production
    if (config.nodeEnv === 'production') {
        // For all webhook routes prefixed by "/twilio", apply validation 
        // middleware
        app.use('/twilio/*', twilio.webhook(config.authToken, {
            host: config.host,
            protocol: 'https' // Assumes you're being safe and using SSL
        }));
    }

    // This URL contains instructions for the call that is connected with a lead
    // that is using the web form.  These instructions are used either for a
    // direct call to our Twilio number (the mobile use case) or 
    app.post('/twilio/leadcall', function(request, response) {
        // Our response to this request will be an XML document in the "TwiML"
        // format. Our node.js library provides a helper for generating one
        // of these documents
        var twiml = new twilio.TwimlResponse();
        twiml.say('Thanks for your interest in 555 Main Street! Conencting You To An Agent Now.', {
            voice: 'alice'
        }).dial(config.agentNumber);

        // Render the twiml instructions as XML
        response.type('text/xml');
        response.send(twiml.toString());
    });

    // Render home page, embedding the Twilio number on the page (for mobile)
    app.get('/', function(request, response) {
        response.render('index', {
            twilioNumber: config.twilioNumber
        });
    });

    // Handle a POST from our web form and connect a call via REST API
    app.post('/call', parseBody, function(request, response) {
        // Grab input from form
        var name = request.body.name;
        var phoneNumber = request.body.number;

        // TODO: Validate phone number

        // Connect an outbound call to the number submitted
        client.makeCall({
            to: phoneNumber,
            from: config.twilioNumber,
            url: 'https://' + config.host + '/twilio/leadcall'
        }, function(err, twilioResponse) {
            if (!err) {
                response.send({
                    message: 'Phone call incoming!'
                });
            } else {
                response.send(500, err);
            }
        });
    });

};