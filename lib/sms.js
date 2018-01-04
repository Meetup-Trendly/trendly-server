'use strict';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);

const sms = module.exports = {};

sms.sendMessage = (message, phoneNumber) => {
  client.messages.create({
    to: phoneNumber,
    from: `+1${process.env.TWILIO_NUMBER}`,
    body: message,
  });
};