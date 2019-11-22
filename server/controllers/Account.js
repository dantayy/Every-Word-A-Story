// require the models folder to access all models
const models = require('../models');
// small package to create random color
const randomColor = require('randomcolor');

// variables for dealing with user timeout periods (all in ms)
const defaultTimeout = 60000;
const minTimeout = 10000;
const timeoutDecrease = 10000;

// grab the Account model for use in here
const Account = models.Account;

// renders the default login page
const loginPage = (req, res) => {
  res.render('login', { csrfToken: req.csrfToken() });
};

// renders account management page
const managementPage = (req, res) => {
  res.render('account', {
    csrfToken: req.csrfToken(),
    username: req.session.account.username,
    timeBetweenPosts: (req.session.account.timeBetweenPosts / 1000),
    timeoutDecrease: (timeoutDecrease / 1000),
    minTimeout: (minTimeout / 1000),
  });
};

// function to handle logging out
const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

// function to handle logging in
const login = (request, response) => {
  // vars to mess with the passed req/res objs
  const req = request;
  const res = response;

  // cast to strings to cover up some security flaws
  const username = `${req.body.username}`;
  const password = `${req.body.pass}`;

  // stop if no username or pw are submitted
  if (!username || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // authenticate the info entered
  return Account.AccountModel.authenticate(username, password, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password' });
    }
    // set up session and move to maker page after successful authentication
    const session = req.session;
    session.account = Account.AccountModel.toAPI(account);
    return res.json({ redirect: '/maker' });
  });
};

// function to handle signing up
const signup = (request, response) => {
  // vars to mess with the passed req/res objs
  const req = request;
  const res = response;

  // cast to strings to cover up some security flaws
  req.body.username = `${req.body.username}`;
  req.body.pass = `${req.body.pass}`;
  req.body.pass2 = `${req.body.pass2}`;

  // stop if no username or pw are submitted
  if (!req.body.username || !req.body.pass || !req.body.pass2) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // stop if passwords don't match
  if (req.body.pass !== req.body.pass2) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  // second param is a callback function that generateHash will supply the salt/hash params for
  return Account.AccountModel.generateHash(req.body.pass, (salt, hash) => {
    // build a new account with data provided
    const accountData = {
      username: req.body.username,
      salt,
      password: hash,
      color: randomColor({
        luminosity: 'bright',
      }),
      timeBetweenPosts: defaultTimeout,
      lastPosted: Date.now() - defaultTimeout,
    };
    const newAccount = new Account.AccountModel(accountData);
    const savePromise = newAccount.save();
    // set up session and move to maker page after successful creation
    savePromise.then(() => {
      const session = req.session;
      session.account = Account.AccountModel.toAPI(newAccount);
      return res.json({ redirect: '/maker' });
    });
    // catch errors
    savePromise.catch((err) => {
      console.log(err);
      if (err.code === 11000) {
        return res.status(400).json({ error: 'Username already in use.' });
      }
      return res.status(400).json({ error: 'An error occurred' });
    });
  });
};

// handles changing password
const changePassword = (request, response) => {
  // vars to mess with the passed req/res objs
  const req = request;
  const res = response;

  // cast to strings to cover up some security flaws
  const currentPass = `${req.body.currentPass}`;
  const newPass = `${req.body.newPass}`;
  const newPass2 = `${req.body.newPass2}`;

  // stop if passwords don't match
  if (newPass !== newPass2) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  // authenticate the current password entered
  return Account.AccountModel.authenticate(req.session.account.username, currentPass,
    (err, account) => {
      if (err || !account) {
        return res.status(400).json({ error: 'Wrong password' });
      }

      // 2nd param's a callback function that generateHash will supply the salt/hash params for
      return Account.AccountModel.generateHash(newPass, (salt, hash) => {
        // find the document to update and change its password
        const username = req.session.account.username;
        return Account.AccountModel.findByUsername(username, (error, doc) => {
          if (error) {
            return res.status(500).json({
              error: 'An error occured while looking up your account',
            });
          }
          const acct = doc;
          acct.salt = salt;
          acct.password = hash;
          const savePromise = acct.save();
          savePromise.then(() => {
            const session = req.session;
            session.account = Account.AccountModel.toAPI(acct);
            return res.status(204);
          });
          savePromise.catch(() => res.status(500).json({
            error: 'An error occured while updating your password',
          }));
          return savePromise;
        });
      });
    });
};

// handles changing user's timeout period
const changeTimeout = (req, res) => {
  // find the document to update and change its post timeout
  const username = req.session.account.username;
  return Account.AccountModel.findByUsername(username, (err, doc) => {
    if (err) {
      return res.status(500).json({
        error: 'An error occured while looking up your account',
      });
    }
    const account = doc;
    // check to see if user's timeout period is already at its lowest
    if (account.timeBetweenPosts <= minTimeout) {
      return res.status(500).json({
        error: 'Your timeout period is the lowest it can be!' });
    }
    account.timeBetweenPosts -= timeoutDecrease;
    // make sure the timeBetweenPosts var doesn't go under 1 minute by accident
    account.timeBetweenPosts = Math.max(account.timeBetweenPosts, minTimeout);
    const savePromise = account.save();
    savePromise.then(() => {
      const session = req.session;
      session.account = Account.AccountModel.toAPI(account);
      return res.status(204);
    });
    savePromise.catch(() => res.status(500).json({
      error: 'An error occured while updating your timeout period' }));
    return savePromise;
  });
};

// get a csrf token
const getToken = (req, res) => {
  const csrfJSON = {
    csrfToken: req.csrfToken(),
  };

  res.json(csrfJSON);
};

// export relevant functions
module.exports.loginPage = loginPage;
module.exports.managementPage = managementPage;
module.exports.login = login;
module.exports.logout = logout;
module.exports.signup = signup;
module.exports.changePassword = changePassword;
module.exports.changeTimeout = changeTimeout;
module.exports.getToken = getToken;
