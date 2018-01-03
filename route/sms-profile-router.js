'use strict';

const { Router } = require('express');
const bodyParser = require('body-parser').urlencoded({extended:false});
const httpErrors = require('http-errors');
const superagent = require('superagent');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const twiml = new MessagingResponse();

const smsProfile = require('../model/sms-profile');
const log = require('../lib/logger');

const smsProfileRouter = module.exports = new Router();

smsProfileRouter.post('/sms-profile', bodyParser, (request, response, next) => {
  if(!request.body.Body || !request.body.From) {
    return next(new httpErrors(404, 'Please provide a text message and a proper phone number'));
  }

  const userInput = request.body.Body;
  const phoneNumber = request.body.From;

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
            twiml.message(`Congratulations, ${meetupMemberId}! You are all signed up \n from number ${phoneNumber}
              Here's a list of commands: _______`);
            response.writeHead(200, {'Content-Type': 'text/xml'});
            response.end(twiml.toString());
          })
          .catch(next);
      });
  } else if (userInput.toLowerCase() === 'update me') {
    // send update to user
    console.log('IN THE UPDATE');
    smsProfile.find({phoneNumber})
      .then(smsProfile => {
        if (smsProfile.length === 0) {
          twiml.message(`No profile found with that phone number`);
          response.writeHead(404, {'Content-Type': 'text/xml'});
          response.end(twiml.toString());
          return;
        }
        let groups = [];
        smsProfile[0].meetups.forEach(each => {
          Promise.all([
            superagent.get(`https://api.meetup.com/seattlejs/events?key=${process.env.API_KEY}`)
              .then(response => {
                return response.body;
              })
              .then(eventObject => { //array
                // console.log('-------------------------------------', eventObject);
                let inAWeek = Date.now() + 604800000;
                let filteredEvents = eventObject.filter(event => {
                  return event.time < inAWeek;
                });
                // console.log(filteredEvents);
                groups.push(filteredEvents);
              }),
          ]);
        });
        return groups;
      })
      .then(groupsArray => {
        if (groupsArray.length === 0) {
          console.log('NO GROUPS');
          twiml.message('There are no upcoming events this week!');
          response.writeHead(200, {'Content-Type': 'text/xml'});
          response.end(twiml.toString());
          return;  
        }
        console.log('GROUPSPS',groupsArray);
        twiml.message(groupsArray);
        response.writeHead(200, {'Content-Type': 'text/xml'});
        response.end(twiml.toString());
        return;
      });

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
