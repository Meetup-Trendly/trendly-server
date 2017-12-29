'use strict';

const faker = require('faker');
const accountMockFactory = require('./accountmock-factory');
const Profile = require('../../model/profile');

const profileMockFactory = module.exports = {};

profileMockFactory.create = () => {
  let resultMock = {};

  return accountMockFactory.create()
    .then(accountMock => {
      resultMock.accountMock = accountMock;

      return new Profile ({
        alias: faker.name.firstName(),
        phoneNumber: faker.phone.phoneNumber(),
        location: `${faker.address.latitude()}.${faker.address.longitude()}`,

        account: accountMock.account._id,
      }).save();
    })
    .then(profile => {
      resultMock.profile = profile;
      return resultMock;
    });
};

profileMockFactory.remove = () => {
  return Promise.all([
    accountMockFactory.remove(),
    Profile.remove({}),
  ]);
};