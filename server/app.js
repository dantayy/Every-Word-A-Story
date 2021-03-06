// import libraries
const path = require('path');
const express = require('express');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressHandlebars = require('express-handlebars');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const url = require('url');
const csrf = require('csurf');

// port to serve this web app on
const port = process.env.PORT || process.env.NODE_PORT || 3000;

// var for the database path that holds all our models
const dbURL = process.env.MONGODB_URI || 'mongodb://localhost/EveryWordAStory';

// connect to mongo
mongoose.connect(dbURL, (err) => {
  if (err) {
    console.log('Couldn\'t connect to db');
    throw err;
  }
});

// set up connection to redis
let redisURL = {
  hostname: 'redis-13810.c10.us-east-1-2.ec2.cloud.redislabs.com', // hostname from the RedisLabs
  port: 13810, // your port from the RedisLabs
};
let redisPASS = '191MlBHQGWR1oSxp0JrebJ22FyWf9Wtk'; // password from RedisLABS
if (process.env.REDISCLOUD_URL) {
  redisURL = url.parse(process.env.REDISCLOUD_URL);
  redisPASS = redisURL.auth.split(':')[1];
}

// pull in our routes
const router = require('./router.js');

// set up our app the express way
const app = express();
app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted/`)));
app.disable('x-powered-by');
app.use(compression());
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(session({
  key: 'sessionid',
  store: new RedisStore({
    host: redisURL.hostname,
    port: redisURL.port,
    pass: redisPASS,
  }),
  secret: 'Domo Arigato',
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
  },
}));
app.engine('handlebars', expressHandlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/../views`);
app.use(cookieParser());
// csrf must come after the cookieparser and session uses and before router call
app.use(csrf());
app.use((err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);

  console.log('Missing CSRF token');
  return false;
});

// connect our router to our app
router(app);

// start listening to the specified port
app.listen(port, (err) => {
  if (err) {
    throw err;
  }
  console.log(`Listening on port ${port}`);
});
