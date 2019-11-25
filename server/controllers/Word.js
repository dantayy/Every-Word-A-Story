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
  models.Account.AccountModel.findByUsername(req.session.account.username, (err, doc) => {
    // check to see if no word was submitted or if timeout hasn't ended yet
    if (!req.body.text) {
      return res.status(400).json({
        error: 'All fields are required',
      });
    } else if (Date.now() - doc.timeBetweenPosts < Date.parse(doc.lastPosted)) {
      return res.status(400).json({
        error: 'Your post timeout isn\'t over yet, please wait',
      });
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
      models.Account.AccountModel.updateOne({ username: req.session.account.username },
        { lastPosted: Date.now() }, (error) => {
          if (error) {
          // instead send back a response if there is an error
            return console.dir(error);
          }

          return console.dir('updated');
        // send back a response that it was successful
        });

      res.status(201).json({
        redirect: '/maker',
      });
    });

    // catch errors
    wordPromise.catch((error) => {
      console.log(error);

      if (error.code === 11000) {
        return res.status(400).json({
          error: 'Word already exists',
        });
      }

      return res.status(400).json({
        error: 'An error occurred',
      });
    });
    return wordPromise;
  });
};


// get words made by a user specified by an id param passed in the request body
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
