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

  describe('smsProfileRouter.post', () => {

    test('testing that a text from a phone number should create an sms profile', () => {
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
});