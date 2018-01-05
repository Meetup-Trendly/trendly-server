'use strict';

require('dotenv').config();

const server = require('../lib/server');
const smsProfile = require('../model/sms-profile');

describe('scheduler.js', () => {
  beforeAll(server.start);
  afterAll(server.stop);

  describe('updating all groups', () => {
    beforeAll(() => {
      return smsProfile.remove({});
    });
    test('testing that smsProfile is being saved to the database', () => {
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
  });
});
