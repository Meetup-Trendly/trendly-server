'use strict';

require('dotenv').config();

const superagent = require('superagent');
const server = require('../lib/server');
const accountMock = require('./lib/accountmock-factory');
const Account = require('../model/account');

const __API_URL__ = `http://localhost:${process.env.PORT}`;

describe('ACCOUNTS', () => {
  beforeAll(server.start);
  afterAll(server.stop);
  afterEach(accountMock.remove);

  describe('POST /signup', () => {
    test(': creating account responds with a 200 and a token if no errors', () => {
      return superagent.post(`${__API_URL__}/signup`)
        .send({
          username: 'sno',
          password: 'beard',
          email: 'sno@balz.com',
        })
        .then(response => {
          expect(response.status).toEqual(200);
          expect(response.body.token).toBeTruthy();
        });
    });

    test(': sending an incomplete account results in a 400 status', () => {
      return superagent.post(`${__API_URL__}/signup`)
        .send({
          username: 'sno',
          email: 'sno@balz.com',
        })
        .then(Promise.reject)
        .catch(error => {
          expect(error.status).toEqual(400);
        });
    });

    test(': sending a duplicate key results in a 409 status', () => {
      return Account.create('sno', 'beard', 'sno@ballz.com')
        .then(() => {
          return superagent.post(`${__API_URL__}/signup`)
            .send({
              username: 'sno',
              password: 'beard',
              email: 'sno@ballz.com',
            })
            .then(Promise.reject)
            .catch(error => {
              expect(error.status).toEqual(409);
            });
        });
    });

    describe('GET /login', () => {
      test(': should respond with a 200 status code and a token if no errors', () => {
        return accountMock.create()
          .then(mock => {
            return superagent.get(`${__API_URL__}/login`)
              .auth(mock.request.username, mock.request.password);
          })
          .then(response => {
            expect(response.status).toEqual(200);
            expect(response.body.token).toBeTruthy();
          });
      });

      test(': should respond with a 401 due to a bad token', () => {
        return accountMock.create()
          .then(mock => {
            return superagent.get(`${__API_URL__}/login`)
              .auth(mock.request.username, 'password');
          })
          .then(Promise.reject)
          .catch(error => {
            expect(error.status).toEqual(401);
          });
      });

      test(': should respond with a 400 due to a bad request', () => {
        return accountMock.create()
          .then(mock => {
            return superagent.get(`${__API_URL__}/login`)
              .auth(mock.request.username);
          })
          .then(Promise.reject)
          .catch(error => {
            expect(error.status).toEqual(400);
          });
      });

      test(': should respond with a 404 if the account was not found', () => {
        return superagent.get(`${__API_URL__}/login`)
          .auth('username that doesn\'t exsist', 'password')
          .then(Promise.reject)
          .catch(error => {
            expect(error.status).toEqual(404);
          });
      });
    });
  });
});