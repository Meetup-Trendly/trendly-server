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
  logText(request);
  
  const twiml = new MessagingResponse();
  if(!request.body.Body || !request.body.From) {
    return next(new httpErrors(404, 'Please provide a text message and a proper phone number'));
  }

  const userInput = request.body.Body.toLowerCase().trim();
  const phoneNumber = request.body.From;
  log('info' , `userInput= ${userInput}`);
  log('info' , `phoneNumber= ${phoneNumber}`);

  const isANumber = str => {
    return /\d+$/.test(str);
  };

  if (isANumber(userInput)) { // assume member id
    smsProfile.findOne({phoneNumber})
      .then(foundProfile => {
        if (!foundProfile) {
          const meetupMemberId = userInput.match(/\d+$/)[0];
          const API_URL = `https://api.meetup.com/groups?member_id=${meetupMemberId}&key=${process.env.API_KEY}`;
          const API_GET_MEMBER_PROFILE = `https://api.meetup.com/members/${meetupMemberId}?key=${process.env.API_KEY}&?fields=groups?%22`;
          return superagent.get(API_URL)
            .then(response => {
              return response.body;
            })
            .then(meetupObject => {
              return superagent.get(API_GET_MEMBER_PROFILE)
                .then(memberAccount => {
                  meetupObject.name = memberAccount.body.name;
                  return meetupObject;
                })
                .then(newMeetupObject => {
                  const results = newMeetupObject.results;
                  const groups = [];
          
                  results.forEach(result => {
                    groups.push(result.group_urlname);
                  });
          
                  return new smsProfile ({
                    meetupMemberId,
                    meetupMemberName: newMeetupObject.name,
                    phoneNumber,
                    meetups: groups,
                  }).save()
                    .then(() => {
                      twiml.message(`
Congratulations, ${newMeetupObject.name}!
You are all signed up for meetup notifications with #${phoneNumber}!
You will receive a text notification 24 hours before any of your upcoming meetup events.
Here's a list of commands, text:
'my groups' - to see a list of your meetup groups
'update me' - to get upcoming events
'stop' - to opt out of text notifications`);
                      response.writeHead(200, {'Content-Type': 'text/xml'});
                      response.end(twiml.toString());
                    })
                    .catch(next);
                })
                .catch(next);
            });

        } else {
          twiml.message(`
Thanks, ${foundProfile.meetupMemberName}!
You are already signed up
Here's a list of commands:
'my groups' - to see a list of your meetup groups
'update me' - to get upcoming events
'stop' - to opt out of text notifications`);
          response.writeHead(200, {'Content-Type': 'text/xml'});
          response.end(twiml.toString());
        }
      });

  } else if (userInput === 'update me') {
    const ONE_WEEK = 604800000;
    smsProfile.find({phoneNumber})
      .then(smsProfile => {
        if (smsProfile.length === 0) {
          twiml.message(`
We are unable to send you an update, please first create an account by sending a text message reply with your meetup user ID:
example: 123456789
which can be found at https://www.meetup.com/account/`);
          response.writeHead(200, {'Content-Type': 'text/xml'});
          response.end(twiml.toString());
          return;
        }

        if (!smsProfile[0].meetups[0]) {
          twiml.message(`No Meetups listed with your account`);
          response.writeHead(200, {'Content-Type': 'text/xml'});
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
                return `${acc}${each.group.name}: ${each.name}\n${new Date(each.time).toString().match(/\D+ \d+ \d+/)[0]}\n@${each.local_time}\n\n`;
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

  } else if (userInput === 'my groups') {
    smsProfile.find({phoneNumber})
      .then(foundSMSProfile => {
        if (foundSMSProfile.length === 0) {
          twiml.message(`
We are unable to send your groups, please first create an account by sending a text message reply with your meetup user ID:
example: 123456789
which can be found at https://www.meetup.com/account/`);
          response.writeHead(200, {'Content-Type': 'text/xml'});
          response.end(twiml.toString());
          return;
        }
        if (foundSMSProfile[0].meetups.length === 0) {
          twiml.message(`You have no groups connected to your account`);
          response.writeHead(200, {'Content-Type': 'text/xml'});
          response.end(twiml.toString());
          return;
        }
        let message = foundSMSProfile[0].meetups.reduce((accumulator, eachMeetup) => {
          return `${accumulator}${eachMeetup}\n\n`;
        }, 'Your Groups:\n');
        twiml.message(message);
        response.writeHead(200, {'Content-Type': 'text/xml'});
        response.end(twiml.toString());
        return;
      })
      .catch(next);

  } else {
    smsProfile.findOne({phoneNumber})
      .then(foundProfile => {
        if (!foundProfile) {
          twiml.message(`
Welcome to meetup-trendly notifications!
If you'd like to sign up, 
please send a text message reply with your meetup user ID:
example: 123456789
which can be found at https://www.meetup.com/account/`);
          response.writeHead(200, {'Content-Type': 'text/xml'});
          response.end(twiml.toString());
          return;
        } else {
          twiml.message(`
List of Commands:
'my groups' - to see a list of your meetup groups
'update me' - to get upcoming events
'stop' - to opt out of text notifications`);
          response.writeHead(200, {'Content-Type': 'text/xml'});
          response.end(twiml.toString());
          return;
        }
      })
      .catch(next);
  }
});

function logText(request) {
  const text = request.body.Body;
  const number = request.body.From;
  log('verbose', `From: ${number} Text= ${text}`);
}