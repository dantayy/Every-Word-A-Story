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

        return res.render('app', { csrfToken: req.csrfToken(), words: docs });
    });
};

// make a new word based on the text parsed and account signed in
const makeWord = (req, res) => {
    // check to see if no word was submitted or if timeout hasn't ended yet
    if (!req.body.text) {
        return res.status(400).json({ error: 'All fields are required' });
    } else if (Date.now() - req.session.account.timeBetweenPosts < req.session.account.lastPosted) {
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
        models.Account.AccountModel.updateLastPosted(req.session.account._id, Date.now());
        res.json({ redirect: '/maker' });
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
const getWords = (req, res) => Word.WordModel.findByOwner(req.session.account._id, (err, docs) => {
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
