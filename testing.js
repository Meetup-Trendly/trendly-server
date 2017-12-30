const superagent = require('superagent');

require('dotenv').config();
let id = 240616154;


superagent.get(`https://api.meetup.com/members/${id}?key=${process.env.API_KEY}&?fields=groups?%22`)
  .then(response => {
    console.log(response.body);

  });