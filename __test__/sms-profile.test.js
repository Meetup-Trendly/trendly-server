'use strict';

require('./lib/setup');

const superagent = require('superagent');
const server = require('../lib/server');
const smsProfile = require('../model/sms-profile');

const __API_URL__ = `http://localhost:${process.env.PORT}`;

describe('sms-profile.js', () => {

  beforeAll(server.start);
  afterAll(server.stop);
  afterEach(() => {
    return smsProfile.remove({});
  });

  describe('smsProfileRouter.post text sign up', () => {

    test('testing that a text from a phone number should create an sms profile and return a 200 status code', () => {
      const phone = {
        Body: '240616151', // wanderly_wagon
        From: '8675309',
      };

      return superagent.post(`${__API_URL__}/sms-profile`)
        .send(phone)
        .then(response => {
          expect(response.status).toEqual(200);
          expect(response.text).toContain(`Congratulations, ${phone.Body}! You are all signed up`);
        });
    });

    test('testing that a 409 error will throw if phone number or member id is duplicated', () => {
      const phone = {
        Body: '240616151', // wanderly_wagon
        From: '8675309',
      };

      return superagent.post(`${__API_URL__}/sms-profile`)
        .send(phone)
        .then(() => {
          return superagent.post(`${__API_URL__}/sms-profile`)
            .send(phone)
            .then(Promise.reject)
            .catch(response => {
              expect(response.status).toEqual(409);
            });
        });
    });

    test('testing that a 404 error will throw if phone number or member id are not provided', () => {
      const phone = {
        Body: '240616151', // wanderly_wagon
      };

      return superagent.post(`${__API_URL__}/sms-profile`)
        .send(phone)
        .then(Promise.reject)
        .catch(response => {
          expect(response.status).toEqual(404);
        });
    });
  });

  describe('smsProfileRouter.post get my groups command', () => {

    test('testing that the -my groups- command returns a list of Meetup groups and a 200 status code', () => {
      const phone = {
        Body: '240616151',
        From: '8675309',
      };

      const getGroups = {
        Body: 'My groups',
        From: '8675309',
      };

      return superagent.post(`${__API_URL__}/sms-profile`) 
        .send(phone)
        .then(() => {
          return superagent.post(`${__API_URL__}/sms-profile`)
            .send(getGroups)
            .then(response => {
              expect(response.status).toEqual(200);
              expect(response.text).toContain('Your groups');
            });
        });
    });

    test('testing that a 404 error will be thrown if there is no stored sms profile for the current phone number', () => {

      const getGroups = {
        Body: 'My groups',
        From: '8675309',
      };

      return superagent.post(`${__API_URL__}/sms-profile`)
        .send(getGroups)
        .then(Promise.reject)
        .catch(error => {
          expect(error.status).toEqual(404);
          expect(error.response.res.text).toContain('No profile found with that phone number');
        });
    });
  });
});