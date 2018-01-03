'use strict';

const { Router } = require('express');
const bodyParser = require('body-parser').urlencoded({extended:false});
const httpErrors = require('http-errors');
const superagent = require('superagent');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const sms = require('../lib/sms');

const smsProfile = require('../model/sms-profile');
const log = require('../lib/logger');

const smsProfileRouter = module.exports = new Router();

smsProfileRouter.post('/sms-profile', bodyParser, (request, response, next) => {
  const twiml = new MessagingResponse();
  if(!request.body.Body || !request.body.From) {
    return next(new httpErrors(404, 'Please provide a text message and a proper phone number'));
  }

  const userInput = request.body.Body;
  const phoneNumber = request.body.From;

  const isANumber = str => {
    return /\d/.test(str);
  };

  if (isANumber(userInput)) { // assume member id
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
            twiml.message(`Congratulations, ${meetupMemberId}! You are all signed up \n from number ${phoneNumber}
              Here's a list of commands: _______`);
            response.writeHead(200, {'Content-Type': 'text/xml'});
            response.end(twiml.toString());
          })
          .catch(next);
      });

  } else if (userInput.toLowerCase() === 'update me') {
    const ONE_WEEK = 604800000;
    smsProfile.find({phoneNumber})
      .then(smsProfile => {
        if (smsProfile.length === 0) {
          twiml.message(`No profile found with that phone number`);
          response.writeHead(404, {'Content-Type': 'text/xml'});
          response.end(twiml.toString());
          return;
        }

        return smsProfile[0].meetups.forEach(each => {
          superagent.get(`https://api.meetup.com/${each}/events?key=${process.env.API_KEY}`)
            .then(response => {
              return response.body;
            })
            .then(eventsArray => {
              let aWeeksTime = Date.now() + ONE_WEEK;
              let filteredEvents = eventsArray.filter(event => {
                return event.time < aWeeksTime;
              });
              return filteredEvents.reduce((acc, each) => {
                return `${acc}${each.name}\n@${each.local_time}\non:${each.local_date}\n\n`;
              }, '');
            })
            .then(filteredEvents => {
              if (filteredEvents.length === 0) {
                sms.sendMessage(`There are no upcoming events this week for ${each}`, phoneNumber);
                return;  
              }
              sms.sendMessage(filteredEvents, phoneNumber);
              return;
            })
            .catch(next);
        });
      })
      .then(() => {
        response.end();
      })
      .catch(next);

  } else if (userInput.toLowerCase() === 'my groups') {
    smsProfile.find({phoneNumber})
      .then(smsProfile => {
        if (smsProfile.length === 0) {
          twiml.message(`No profile found with that phone number`);
          response.writeHead(404, {'Content-Type': 'text/xml'});
          response.end(twiml.toString());
          return;
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