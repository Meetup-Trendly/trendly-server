'use strict';

require('dotenv').config();

const server = require('../lib/server');
const smsProfile = require('../model/sms-profile');
const scheduler = require('../lib/scheduler');

describe('scheduler.js', () => {
  beforeAll(server.start);
  afterAll(server.stop);
  
  describe('updating all groups', () => {
    beforeEach(() => {
      return smsProfile.remove({});
    });

    test('testing node-scheduler "updateAllGroups" updates sms profiles\' groups', () => {
      return new smsProfile({
        meetupMemberId: 240616151,
        meetupMemberName: 'wanderly_wagon',
        phoneNumber: '8675309',
        meetups: [],
      }).save()
        .then(() => {
          return scheduler.updateAllGroups()
            .then(() => {
              return smsProfile.findOne({phoneNumber: '8675309'}, (error, foundAccount) => {
                expect(foundAccount.meetups).not.toHaveLength(0);
              });
            });
        });
    });
  });
});
