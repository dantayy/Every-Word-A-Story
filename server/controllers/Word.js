// require the models folder to access all models
const models = require('../models');

// grab the Word model for use in here
const Word = models.Word;

// renders the default app page with all words loaded
const makerPage = (req, res) => {
  Word.WordModel.find({}, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.render('app', {
      csrfToken: req.csrfToken(),
      words: docs,
      username: req.session.account.username,
    });
  });
};

// make a new word based on the text parsed and account signed in
const makeWord = (req, res) => {
  console.log(`Math: ${Date.now() - req.session.account.timeBetweenPosts}`);
  console.log(`Last posted var: ${Date.parse(req.session.account.lastPosted)}`);
  // check to see if no word was submitted or if timeout hasn't ended yet
  if (!req.body.text) {
    return res.status(400).json({ error: 'All fields are required' });
  } else if (Date.now() - req.session.account.timeBetweenPosts <
               Date.parse(req.session.account.lastPosted)) {
    return res.status(400).json({ error: 'Your post timeout isn\'t over yet, please wait' });
  }

  // build a new word with data provided
  const wordData = {
    text: req.body.text,
    owner: req.session.account._id,
    color: req.session.account.color,
  };
  const newWord = new Word.WordModel(wordData);
  const wordPromise = newWord.save();
  // update the account's lastPosted property and reload the page after successful submission
  wordPromise.then(() => {
    // find the document to update and change its lastUpdated value
    const username = req.session.account.username;
    models.Account.AccountModel.findByUsername(username, (err, doc) => {
      if (err) {
        return res.status(500).json({
          error: 'An error occured while looking up your account',
        });
      }
      const account = doc;
      account.lastPosted = Date.now();
      const savePromise = account.save();
      savePromise.then(() => {
        const session = req.session;
        session.account = models.Account.AccountModel.toAPI(account);
      });
      savePromise.catch(() => res.status(500).json({
        error: 'An error occured while updating your timeout period' }));
      return savePromise;
    });
    res.status(201).json({ redirect: '/maker' });
  });
  // catch errors
  wordPromise.catch((err) => {
    console.log(err);

    if (err.code === 11000) {
      return res.status(400).json({ error: 'Word already exists' });
    }

    return res.status(400).json({ error: 'An error occurred' });
  });
  return wordPromise;
};

// get words made by the user currently signed in
const getWords = (req, res) => Word.WordModel.findByOwner(req.body.id, (err, docs) => {
  console.log(req.body.id);
  if (err) {
    console.log(err);
    return res.status(400).json({ error: 'An error occurred' });
  }

  return res.json({ words: docs });
});


// get words made by all users
const getAllWords = (req, res) => Word.WordModel.find({}, (err, docs) => {
  if (err) {
    console.log(err);
    return res.status(400).json({ error: 'An error occurred' });
  }

  return res.json({ words: docs });
});

// export relevant functions for the router
module.exports.makerPage = makerPage;
module.exports.getWords = getWords;
module.exports.getAllWords = getAllWords;
module.exports.make = makeWord;
