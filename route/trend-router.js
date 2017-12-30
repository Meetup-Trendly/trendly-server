'use strict';

const {Router} = require('express');
const jsonParser = require('body-parser').json();
const httpErrors = require('http-errors');
const Trend = require('../model/trend');

const bearerAuthMiddleware = require('../lib/bearer-auth-middleware');

const trendRouter = module.exports = new Router();

trendRouter.get('/trends/:id', bearerAuthMiddleware, (request, response, next) => {
  if(!request.account)
    return next(new httpErrors(404, '__ERROR__ Not Found'));

    

  return Trend.findById(request.params.id)
    .then(profile => response.json(profile))
    .catch(next);
});

// trendRouter.post('/profiles', bearerAuthMiddleware, jsonParser, (request, response, next) => {
//   if(!request.account && !request.phoneNumber && !request.location)
//     return next(new httpErrors(404, '__ERROR__ no account, location, or phonenumber given'));

//   return new Profile ({
//     ...request.body,
//     account: request.account._id,
//   }).save()
//     .then(profile => response.json(profile))
//     .catch(next);
// });
