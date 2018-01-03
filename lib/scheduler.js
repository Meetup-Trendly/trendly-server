'use strict';

const schedule = require('node-schedule');
const smsProfile = require('../model/sms-profile');
const superagent = require('superagent');
const sms = require('../lib/sms');

let j = schedule.scheduleJob('0-59 * * * * *', function(){
  console.log('The answer to life, the universe, and everything!');

  smsProfile.find({})
    .then(allProfiles => {
      const ONE_DAY = 86400000;
      allProfiles.forEach(eachProfile => {
        eachProfile.meetups.forEach(eachMeetupGroup => {
          superagent.get(`https://api.meetup.com/${eachMeetupGroup}/events?key=${process.env.API_KEY}`)
            .then(response => {
              return response.body;
            })
            .then(eventsArray => {
              let aDaysTime = Date.now() + ONE_DAY;
              let filteredEvents = eventsArray.filter(event => {
                return event.time < aDaysTime;
              });
              return filteredEvents.reduce((acc, each) => {
                return `${acc}${each.group.name}: ${each.name}\n${new Date(each.time).toString().match(/\D+ \d+ \d+/)[0]}\n@${each.local_time}\n\n`;
              }, '');
            })
            .then(filteredEvents => {
              console.log(filteredEvents);
              if (filteredEvents.length === 0) {
                return;  
              }
              console.log(filteredEvents, eachProfile.phoneNumber);
              // sms.sendMessage(filteredEvents, eachProfile.phoneNumber);
              return;
            })
            .catch(console.log);
        });
      });
    })
    .catch(console.log);
});
  