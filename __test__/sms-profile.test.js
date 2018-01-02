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
          console.log('this is a test', response.text);
          expect(response.status).toEqual(200);
          expect(response.text).toContain(`Congratulations, ${phone.Body}! You are all signed up`);
        });
    });
  });
});