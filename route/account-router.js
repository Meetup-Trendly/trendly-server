'use strict';

const {Router} = require('express');
const jsonParser = require('body-parser').json();
const Account = require('../model/account');
const httpError = require('http-errors');
const basicAuthMiddleware = require('../lib/middleware/basic-auth-middleware');

const accountRouter = module.exports = new Router();

// ============================= GET =============================
accountRouter.get('/login', basicAuthMiddleware, (request, response, next) => {
  if (!request.account) {
    return next(new httpError(404, '__ERROR__ not found'));
  }

  return request.account.createToken()
    .then(newToken => response.json({token: newToken}))
    .catch(next);
});

// ============================= POST =============================
accountRouter.post('/signup', jsonParser, (request, response, next) => {
  if (!request.body.username || !request.body.password || !request.body.email) {
    return next(new httpError(400, '__ERROR__ Insufficient data: Requires username, password, and email'));
  }
  
  Account.create(request.body.username, request.body.password, request.body.email)
    .then(newUser => {
      return newUser.createToken();
    })
    .then(newToken => {
      return response.json({token: newToken});
    })
    .catch(next);
});
