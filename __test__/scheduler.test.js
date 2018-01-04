'use strict';


require('dotenv').config();

const server = require('../lib/server');
const smsProfile = require('../model/sms-profile');
const scheduler = require('../lib/scheduler');

describe('scheduler.js', () => {
  beforeAll(server.start);
  afterAll(server.stop);

  describe('eventsNextDay', () => {
    test('first', () => {
      return new smsProfile({
        meetupMemberId: 240616151,
        meetupMemberName: 'wanderly_wagon',
        phoneNumber: '8675309',
        meetups: [],
      }).save()
        .then(() => {
          smsProfile.findOne({phoneNumber: '8675309'})
            .then(foundSMSProfile => {
              expect(foundSMSProfile.meetups).toHaveLength(0);
            });
        });
    });
    describe('updating all groups', () => {
      test('second', () => {
        Promise.all([
          new Promise(resolve => {
            resolve(scheduler.updateAllGroups());
          }),
        ])
          .then(() => {
            return smsProfile.findOne({phoneNumber: '8675309'})
              .then(foundSMSProfile => {
                console.log(foundSMSProfile);
                expect(foundSMSProfile.meetups).toEqual([]);
                expect(true).toBeFalsy();
              });
          });
      });
    });
  });
});