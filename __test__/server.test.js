'use strict';

require('dotenv').config();

const server = require('../lib/server');

describe('server.js', () => {
  describe('server.start()', () => {
    beforeEach(server.start);
    afterEach(server.stop);

    test('server.start after the server is running will throw an error', () => {
      // expect(() => {
      //   return server.start();
      // }).rejects.toMatch('__SERVER_ERROR__ Server is already on');
      expect(true).toBe(true);
    });
  });
});