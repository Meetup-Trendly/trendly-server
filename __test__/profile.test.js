'use strict';

require('dotenv').config();

const superagent = require('superagent');
const server = require('../lib/server');
const accountMockFactory = require('./lib/accountmock-factory');
const profileMockFactory = require('./lib/profilemock-factory');

const __API_URL__ = `http://localhost:${process.env.PORT}`;

describe('PROFILE router', () => {
  beforeAll(server.start);
  afterAll(server.stop);
  afterEach(profileMockFactory.remove);

  describe('POST /profiles', () => {
    test('Should return a 200 and a profile if there are no errors', () => {
      let accountMock = null;

      return accountMockFactory.create()
        .then(mock => {
          accountMock = mock;
          return superagent.post(`${__API_URL__}/profiles`)
            .set('Authorization', `Bearer ${accountMock.token}`)
            .send({
              phoneNumber: '8675309',
              meetupMemberId: '240616151', // wanderly_wagon
            });
        })
        .then(response => {
          expect(response.status).toEqual(200);
          expect(response.body.account).toEqual(accountMock.account._id.toString());
          expect(response.body.name).toEqual('wanderly_wagon');
          expect(response.body.phoneNumber).toEqual('8675309');
        });
    });

    test('Should return a 400 if a bad request is sent', () => {
      let accountMock = null;

      return accountMockFactory.create()
        .then(mock => {
          accountMock = mock;
          return superagent.post(`${__API_URL__}/profiles`)
            .set('Authorization', `Bearer ${accountMock.token}`)
            .send({
              name: {},
              phoneNumber: {},
            });
        })
        .then(Promise.reject)
        .catch(response => {
          expect(response.status).toEqual(400);
        }); 
    });

    test('Should return a 401 if unauthorized request', () => {
      return accountMockFactory.create()
        .then(() => {
          return superagent.post(`${__API_URL__}/profiles`)
            .set('Authorization', 'Bearer invalidtoken')
            .send({
              name: {},
              phoneNumber: {},
            });
        })
        .then(Promise.reject)
        .catch(response => {
          expect(response.status).toEqual(401);
        }); 
    });
  });

  describe('GET /profiles/:id', () => {
    test('GET /profiles/:id Should return a 200 and a profile if there are no errors', () => {
      let resultMock = null;

      return profileMockFactory.create()
        .then(mock => {
          resultMock = mock;
          return superagent.get(`${__API_URL__}/profiles/${resultMock.profile._id}`)
            .set('Authorization', `Bearer ${resultMock.accountMock.token}`);
        })
        .then(response => {
          expect(response.status).toEqual(200);
          expect(response.body.account).toEqual(resultMock.accountMock.account._id.toString());
          expect(response.body.name).toEqual(resultMock.profile.name);
          expect(response.body.phoneNumber).toEqual(resultMock.profile.phoneNumber);
        });
    });

    test('GET /profiles/:id Should return a 400 if authentication is invalid', () => {
      let resultMock = null;

      return profileMockFactory.create()
        .then(mock => {
          resultMock = mock;
          return superagent.get(`${__API_URL__}/profiles/${resultMock.profile._id}`);
        })
        .then(Promise.reject)
        .catch(response => {
          expect(response.status).toEqual(400);
        });
    });

    test('GET /profiles/:id Should return a 404 if authentication is invalid', () => {
      let resultMock = null;

      return profileMockFactory.create()
        .then(mock => {
          resultMock = mock;
          return superagent.get(`${__API_URL__}/profiles/invalidId`)
            .set('Authorization', `Bearer ${resultMock.accountMock.token}`);
        })
        .then(Promise.reject)
        .catch(response => {
          expect(response.status).toEqual(404);
        });
    });
  });
});