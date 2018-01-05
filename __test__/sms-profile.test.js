'use strict';

require('dotenv').config();

const superagent = require('superagent');
const server = require('../lib/server');
const smsProfile = require('../model/sms-profile');

const __API_URL__ = `http://localhost:${process.env.PORT}`;

describe('POST /sms-profile', () => {
  beforeAll(server.start);
  afterAll(server.stop);
  beforeEach(() => {
    return smsProfile.remove({});
  });
  afterEach(() => {
    return smsProfile.remove({});
  });

  describe('text memberID to sign up', () => {
    test('testing that a text from a phone number should create an sms profile and return a 200 status code', () => {
      // -- application/x-www-form-urlencoded --
      const phone = 'Body=240616151&From=8675309'; // wanderly_wagon 

      return superagent.post(`${__API_URL__}/sms-profile`)
        .send(phone)
        .then(response => {
          expect(response.status).toEqual(200);
          expect(response.text).toContain(`Congratulations, wanderly_wagon!`);
        });
    });

    test('testing that response will be sent to the user if a duplicate phone number is sent', () => {
      const phone = 'Body=240616151&From=8675309'; // wanderly_wagon 

      return new smsProfile({
        meetupMemberId: 240616151,
        phoneNumber: 8675309,
        meetups: ['seattlejs'],
      }).save()
        .then(() => {
          return superagent.post(`${__API_URL__}/sms-profile`)
            .send(phone)
            .then(response => {
              expect(response.status).toEqual(200);
              expect(response.text).toContain('You are already signed up');
            });
        });
    });

    test('expect a 404 status code if message is not sent from a phone number', () => {
      const phone = 'Body=240616151'; // wanderly_wagon 

      return superagent.post(`${__API_URL__}/sms-profile`)
        .send(phone)
        .then(Promise.reject)
        .catch(response => {
          expect(response.status).toEqual(404);
        });
    });
  });

  describe('text -my groups- command to get a list of your meetup groups', () => {
    test('testing that the -my groups- command returns a list of Meetup groups and a 200 status code', () => {
      const getGroups = 'Body=My groups&From=8675309';

      return new smsProfile({
        meetupMemberId: 240616151,
        phoneNumber: 8675309,
        meetups: ['seattlejs'],
      }).save()
        .then(() => {
          return superagent.post(`${__API_URL__}/sms-profile`)
            .send(getGroups)
            .then(response => {
              expect(response.status).toEqual(200);
              expect(response.text).toContain('Your Groups');
            });
        });
    });

    test('testing that a response will be sent to the user if there is no stored sms profile for the current phone number', () => {
      const getGroups = 'Body=My groups&From=8675309';

      return superagent.post(`${__API_URL__}/sms-profile`)
        .send(getGroups)
        .then(response => {
          expect(response.status).toEqual(200);
          expect(response.text).toContain('We are unable to send your groups');
        });
    });
  });

  test('testing that the -my groups- command replies to the user if they have no groups connected to the account', () => {
    const getGroups = 'Body=My groups&From=8675309';

    return new smsProfile({
      meetupMemberId: 240616151,
      phoneNumber: 8675309,
      meetups: [],
    }).save()
      .then(() => {
        return superagent.post(`${__API_URL__}/sms-profile`)
          .send(getGroups)
          .then(response => {
            expect(response.status).toEqual(200);
            expect(response.text).toContain('You have no groups connected to your account');
          });
      });
  });

  describe('text -update me- command to get a list of meetups within a week\'s time', () => {
    test('testing that the -update me- command returns a list of meetups that occur within a week and a 200 status code', () => {
      const updateMe = 'Body=Update me&From=8675309';
     
      return new smsProfile({
        meetupMemberId: 240616151,
        phoneNumber: '8675309',
        meetups: ['seattlejs', 'seattlejshackers'],
      }).save()
        .then(() => {
          return superagent.post(`${__API_URL__}/sms-profile`)
            .send(updateMe)
            .then(response => {
              expect(response.status).toEqual(200);
            });
        });
    });

    test('-update me- sends a response to the user if no profile is found with the number', () => {
      const updateMe = 'Body=Update me&From=8675309';

      return superagent.post(`${__API_URL__}/sms-profile`)
        .send(updateMe)
        .then(reponse => {
          expect(reponse.status).toEqual(200);
          expect(reponse.text).toContain('We are unable to send you an update');
        });
    });

    test('-update me- sends a response to the user if no meetups are found with their number', () => {
      const updateMe = 'Body=Update me&From=8675309';

      return new smsProfile({
        meetupMemberId: 240616155, // this user has no groups
        phoneNumber: '8675309',
      }).save()
        .then(() => {
          return superagent.post(`${__API_URL__}/sms-profile`)
            .send(updateMe)
            .then(response => {
              expect(response.status).toEqual(200);
              expect(response.text).toContain('No Meetups listed with your account');
            });
        });
    });
  });

  describe('non-sms commands', () => {
    test('any non-sms command sent from the user without being signed up will return a response of how to sign up', () => {
      const updateMe = 'Body=hi&From=8675309';
      return superagent.post(`${__API_URL__}/sms-profile`)
        .send(updateMe)
        .then(response => {
          expect(response.status).toEqual(200);
          expect(response.text).toContain('If you\'d like to sign up');
        });
    });

    test('any non-sms command sent from the user while being signed up will return a list of commands to the user', () => {
      const updateMe = 'Body=hi&From=8675309';

      return new smsProfile({
        meetupMemberId: 240616155, // this user has no groups
        phoneNumber: '8675309',
      }).save()
        .then(() => {
          return superagent.post(`${__API_URL__}/sms-profile`)
            .send(updateMe)
            .then(response => {
              expect(response.status).toEqual(200);
              expect(response.text).toContain('List of Commands:');
            });
        });
    });
  });
});
