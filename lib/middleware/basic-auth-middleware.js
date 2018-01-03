'use strict';

const httpError = require('http-errors');
const Account = require('../../model/account');

module.exports = (request, response, next) => {
  if (!request.headers.authorization) {
    return next(httpError(400, '__ERROR__ Authorization header required'));
  }

  let base64AuthHeader = request.headers.authorization.split('Basic ')[1];

  if (!base64AuthHeader) {
    return next(httpError(400, '__ERROR__ Basic authorization required'));
  }

  let stringAuthHeader = new Buffer(base64AuthHeader, 'base64').toString();

  let [username, password] = stringAuthHeader.split(':');

  if (!username || !password) {
    return next(httpError(400, '__ERROR__ Username and Password required'));
  }

  return Account.findOne({username})
    .then(accountFound => {
      if (!accountFound) {
        throw new httpError(404, '__ERROR__ not found');
      }

      return accountFound.verifyPassword(password);
    })
    .then(verifiedAccount => {
      request.account = verifiedAccount;
      return next();
    })
    .catch(next);
};