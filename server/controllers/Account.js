// require the models folder to access all models
const models = require('../models');
// small package to create random color
const randomColor = require('randomcolor');

// default account post timeout period in ms
const timeout = 10000;

// grab the Account model for use in here
const Account = models.Account;

// renders the default login page
const loginPage = (req, res) => {
  res.render('login', { csrfToken: req.csrfToken() });
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
      timeBetweenPosts: timeout,
      lastPosted: Date.now() - timeout,
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

// get a csrf token
const getToken = (req, res) => {
  const csrfJSON = {
    csrfToken: req.csrfToken(),
  };

  res.json(csrfJSON);
};

// export relevant functions
module.exports.loginPage = loginPage;
module.exports.login = login;
module.exports.logout = logout;
module.exports.signup = signup;
module.exports.getToken = getToken;
