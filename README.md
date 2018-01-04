# *Trendly*

## Code Fellows: Seattle 401 JavaScript - 401d19

### Authors:
 Cameron Moorehead, Catherine Looper, Dalton Carr, Matt LeBlanc

### Motivation

Trendly is an API that connects users via SMS to Meetup (`https://www.meetup.com/`). This app allows users to customize their Meetup notifications.

Trendly is a RESTful API built with a (Hypertext Transfer Protocol) HTTP server and basic and bearer authentication using Express. This server handles POST and GET requests/responses. This API uses MongoDB and Mongoose to write data to a db directory for persistence. This app is using Travis CI for continuous integration, and Heroku for deployment.

### Build

![Trendly FlowChart](./assets/Trendly-flowchart.png)

#### `Staging` : [![Build Status](https://travis-ci.org/Meetup-Trendly/trendly-server.svg?branch=staging)](https://travis-ci.org/Meetup-Trendly/trendly-server)

#### `Master` : [![Build Status](https://travis-ci.org/Meetup-Trendly/trendly-server.svg?branch=master)](https://travis-ci.org/Meetup-Trendly/trendly-server)

#### Server Module

The server module is creating an http server, defining server-on behavior and exporting an interface for starting and stopping the server. The server module exports an object containing start and stop methods.

The server module requires in express, mongoose, logger, logger-middleware, error-middleware, auth-router.js, profile-router.js and the photo-router.js file. The server.start and stop methods return a new Promise with resolve and reject parameters. The start method contains an app.listen function that listens for the server start. The server.stop method has an httpServer.close function that turns the server off by setting the isServerOn variable to false.

#### Route Module

##### `account-router.js`

`account-router.js` requires in the Router object from express, the jsonParser(body-parser), http-errors, the account.js model, and basic-auth-middleware.js. Inside the module, there is a function declared for `authRouter.post` with the route `/signup`. If a username, email, or password are not provided, then the user will receive a 400 error notifying them that those pieces of information are required. Otherwise, if all pieces of information are provided - then a new account is created with username, email and password and the method `createToken()` is called to send a response with the token. There is also an `accountRouter.get` method with a `/login` route.

##### `profile-router.js`

`profile-router.js` requires in the Router object from express, the jsonParser(body-parser), http-errors, the profile.js model, and bearer-auth-middleware.js. Inside the module, there is a function declared for `profileRouter.post` with the route `/profiles` and a `profileRouter.get` method with the route `/profiles/:id`. These routes handle posting a profile and retrieving a profile based on its id.

##### `trend-router.js`

`trend-router.js` requires in the Router object from express, httpErrors, bearerAuthMiddleware.js, the photo.js model, multer, and s3. Inside the module, there is a function declared for `trendRouter.post`, `trendRouter.get`, and `trendRouter.delete`.


#### Model Module

##### `account.js`

`account.js` requires in mongoose, crypto (which generates random strings), bcrypt (for hash passwords), http-errors, and jsonwebtoken. The account model includes the parameters: passwordHash, email, username, tokenSeed, and created. The account model has the methods: `accountSchema.methods.verifyPassword()` and `accountSchema.methods.createToken()` which are for authentication and token creation. There is also an `Account.create` method with the parameters: username, email, and password that actually creates the account.

##### `profile.js`

`profile.js` requires in mongoose. The profile model includes the parameters: bio, avatar, lastName, firstName, and account. The profile model is being exported from the file. This model belongs to the account model.

##### `categorie.js`

`categorie.js` requires in mongoose. The photo model includes the parameters: title, url, createdOn, and account. The categorie model is being exported from the file.

##### `profile.js`


#### Test Module

Contains a `lib/` directory with the files: `setup.js`,   `account-mock-factory.js`, and  `profile-mock-factory.js`. These files assist in the tests by setting up the environment variables and mock objects to test.

* `POST` - tests for status codes: 
  * `200` - successful post request
  * `400` - if an incomplete post request is sent
  * `401`/`404 ` - if unauthorized request
  * `409` - if keys are unique

* `GET` - tests for status codes:
  * `200` - successful post request
  * `400` - if an incomplete post request is sent
  * `401`/`404 ` - if unauthorized request
  * `409` - if keys are unique

* `DELETE` - tests for status codes:
  * `204` - successful delete request
  * `404` - if an incomplete delete request is sent
  * `401` - if unauthorized request


#### Middleware

#####  `basic-auth-middleware.js`

The basic auth middleware sets up the authentication for username/password verification.

##### `bearer-auth-middleware.js`

The bearer auth middleware handles the error checking for the authorization. It checks that the token is authorized.

##### `error-middleware.js`

The error-middleware module handles error messages for a variety of different use cases, including HTTP errors and MONGODB errors. 

* HTTP errors include the following logs: 

 ``` 
  logger.log('info','__ERROR_MIDDLEWARE__');
  logger.log('info',error);

  if(error.status){
    logger.log('info',Responding with a ${error.status} status and message: ${error.message});
    return response.sendStatus(error.status);
  }
  ```
* MONGODB errors include the following logs:

```
  if(message.includes('validation failed')) {
    logger.log('info','Responding with a 400 status code');
    return response.sendStatus(400);
  }

  if(message.includes('duplicate key')) {
    logger.log('info','Responding with a 409 status code');
    return response.sendStatus(409);
  }

  if(message.includes('objectid failed')) {
    logger.log('info','Responding with a 404 status code');
    return response.sendStatus(404);
  }

  if(message.includes('unauthorized')) {
    logger.log('info','Responding with a 401 status code');
    return response.sendStatus(401);
  }
```

* If there is an error that doesn't match the above, then:

```
  logger.log('info', 'Responding with a 500 status code');
  logger.log('info', error);
  return response.sendStatus(500);
```

##### `logger-middleware.js`

The logger-middleware module logs the request method processes and request urls and returns next to continue on in the promise chain.

### Limitations

To use this app - it is assumed that the user has familiarity with the tech and frameworks listed below. 

### Code Style

Standard JavaScript with ES6

### Tech/Framework used

* JavaScript / ES6
* Node.js
* Jest
* Eslint
* Faker
* Superagent
* MongoDB
* Mongoose
* Winston
* Express
* Dotenv
* Body-Parser
* http-errors
* bcrypt
* crypto
* jsonwebtoken
* fs-extra
* multer
* aws-sdk
* aws-sdk-mock
* Amazon Web Services
* TravisCI
* Heroku
* Meetup


### How to use?

* Step 1. Fork and Clone the Repository.
* Step 2. `npm install`.
* Step 3. start MongoDB by calling `npm run dbon`.
* Step 4. to test the API, open a second terminal window and run the command `npm run test`.
* Step 5. If you would like to start the server, you can run the command `npm run start`.

### Credits

* Code Fellows / Vinicio Vladimir Sanchez Trejo

### License

MIT © Trendly