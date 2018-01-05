'use strict';

const jsonWebToken = require('jsonwebtoken');
const httpError = require('http-errors');

const Account = require('../../model/account');

const promisify = (fn) => {
  return (...args) => {
    return new Promise((resolve, reject) => {
      fn(...args, (error, data) => {
        if (error) {
          return reject(error);
        }
        return resolve(data);
      });
    });
  };
};

module.exports = (request, response, next) => {
  if (!request.headers.authorization) {
    return next(new httpError(400, '__ERROR__ authorization header required'));
  }

  const token = request.headers.authorization.split('Bearer ')[1];

  if (!token) {
    return next(new httpError(400, '__ERROR__ token required'));
  }

  return promisify(jsonWebToken.verify)(token, process.env.CLOUD_SALT)
    .then(decryptedData => {
      return Account.findOne({
        tokenSeed: decryptedData.tokenSeed,
      });
    })
    .then(accountFound => {
      if (!accountFound) {
        throw new httpError(404, '__ERROR__ not found');
      }
      request.account = accountFound;
      return next();
    })
    .catch(next);
};