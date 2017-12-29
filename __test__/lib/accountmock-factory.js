'use strict';

const faker = require('faker');
const Account = require('../../model/account');

const accountMock = module.exports = {};

accountMock.create = () => {
  let mock = {};

  mock.request = {
    username: faker.internet.userName(),
    password: faker.lorem.words(10),
    email: faker.internet.email(),
  };

  return Account.create(mock.request.username, mock.request.password, mock.request.email)
    .then(newAccount => {
      mock.account = newAccount;
      return newAccount.createToken();
    })
    .then(newToken => {
      mock.token = newToken;
      return Account.findById(mock.account._id);
    })
    .then(accountFound => {
      mock.account = accountFound;
      return mock;
    });
};

accountMock.remove = () => {
  return Account.remove({});
};