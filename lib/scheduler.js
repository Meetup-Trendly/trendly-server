'use strict';

const schedule = require('node-schedule');
const smsProfile = require('../model/sms-profile');
const superagent = require('superagent');
const sms = require('../lib/sms');
const log = require('./logger');

let runEventsNextDay = (time = '00 00 12 * * *') => {
  let i = schedule.scheduleJob(time, function(){ // eslint-disable-line
    eventsNextDay();
  });
};


let runUpdateAllGroups = (time = '00 00 9 * * *') => {
  let j = schedule.scheduleJob(time, function(){ // eslint-disable-line
    updateAllGroups();
  });
};
  
const eventsNextDay = () => {
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
                return `${acc}Hey You have an upcoming event for${each.name}\n${each.group.name}\n${new Date(each.time).toString().match(/\D+ \d+ \d+/)[0]}\n@${each.local_time}\n\n`;
              }, '');
            })
            .then(filteredEventsString => {
              if (filteredEventsString.length === 0) {
                return;
              }
              sms.sendMessage(filteredEventsString, eachProfile.phoneNumber);
              return;
            })
            .catch(console.log);
        });
      });
    })
    .catch(console.log);
};

const updateAllGroups = () => {
  return new Promise((resolve, reject) => {
    return smsProfile.find({})
      .then(allProfiles => {

        allProfiles.forEach(eachProfile => {
          superagent.get(`https://api.meetup.com/groups?member_id=${eachProfile.meetupMemberId}&key=${process.env.API_KEY}`)
            .then(response => {
              return response.body;
            })
            .then(meetupObject => {
              const results = meetupObject.results;
              let groups = [];
              let isTheSame = true;
              
              results.forEach((eachResult, index) => {
                
                groups.push(eachResult);
                try {
                  if (eachProfile.meetups[index].group_urlname !== eachResult.group_urlname) {
                    isTheSame = false;
                  }
                } catch(e) {
                  isTheSame = false;
                }
              });
              
              if (isTheSame) {
                return;
              } else {
                smsProfile.findByIdAndUpdate(eachProfile._id, {meetups: groups}, () => {
                  resolve(`Account: ${eachProfile._id} Updated`);
                  log('verbose', `Account: ${eachProfile._id} Updated`);
                });
              }
            })
            .catch(console.log);
        });
      });
  });
};

module.exports = { runUpdateAllGroups, runEventsNextDay ,updateAllGroups, eventsNextDay };