'use strict';

const { Router } = require('express');
const jsonParser = require('body-parser').json();
const httpErrors = require('http-errors');
const superagent = require('superagent');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const smsProfile = require('../model/sms-profile');

const log = require('../lib/logger');

const smsProfileRouter = module.exports = new Router();

smsProfileRouter.post('/sms-profile', jsonParser, (request, response, next) => {
  if(!request.body.Body || !request.body.From) {
    return next(new httpErrors(404, 'Please provide a text message and a proper phone number'));
  }
  const userInput = request.body.Body;
  const phoneNumber = request.body.From;
  const twiml = new MessagingResponse();

  const isANumber = str => {
    return /\d/.test(str);
  };

  if (isANumber(userInput)) {
    // assume member id
    const meetupMemberId = userInput;
    const API_URL = `https://api.meetup.com/groups?member_id=${meetupMemberId}&key=${process.env.API_KEY}`;
    return superagent.get(API_URL)
      .then(response => {
        return response.body;
      })
      .then(meetupObject => {
        const results = meetupObject.results;
        const groups = [];

        results.forEach(result => {
          groups.push(result.group_urlname);
        });

        return new smsProfile ({
          meetupMemberId,
          phoneNumber,
          meetups: groups,
        }).save()
          .then(() => {
            twiml.message(`Congratulations, ${meetupMemberId}! You are all signed up \n
              Here's a list of commands: _______`);
            response.writeHead(200, {'Content-Type': 'text/xml'});
            response.end(twiml.toString());
          })
          .catch(next);
      });
  } else if (userInput.toLowerCase() === 'update me') {
    // send update to user
  } else if (userInput.toLowerCase() === 'my groups') {
    smsProfile.find({phoneNumber})
      .then(smsProfile => {
        if (smsProfile.length === 0) {
          console.log('sms profile', smsProfile);
          twiml.message(`No profile found with that phone number`);
          response.writeHead(404, {'Content-Type': 'text/xml'});
          response.end(twiml.toString());
          return;
          
          // return next(new httpErrors(404, 'No profile found with that phone number'));
        }
        twiml.message(`Your groups: ${smsProfile[0].meetups}`);
        response.writeHead(200, {'Content-Type': 'text/xml'});
        response.end(twiml.toString());
      })
      .catch(next);
  } else {
    // category to be subscribed to
    log('info', `User Input: ${userInput}`);
    return;
  }
});
