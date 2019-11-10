const models = require('../models');

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

const makeWord = (req, res) => {
    if (!req.body.text) {
        return res.status(400).json({ error: 'RAWR! All fields are required' });
    }

    const wordData = {
        text: req.body.text,
        owner: req.session.account._id,
        color: req.session.account.color,
    };

    const newWord = new Word.WordModel(wordData);

    const wordPromise = newWord.save();

    wordPromise.then(() => res.json({ redirect: '/maker' }));

    wordPromise.catch((err) => {
        console.log(err);

        if (err.code === 11000) {
            return res.status(400).json({ error: 'Word already exists' });
        }

        return res.status(400).json({ error: 'An error occurred' });
    });

    return wordPromise;
};

const getWords = (req, res) => Word.WordModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
        console.log(err);
        return res.status(400).json({ error: 'An error occurred' });
    }

    return res.json({ words: docs });
});

const getAllWords = (req, res) => Word.WordModel.find({}, (err, docs) => {
    if (err) {
        console.log(err);
        return res.status(400).json({ error: 'An error occurred' });
    }

    return res.json({ words: docs });
});

module.exports.makerPage = makerPage;
module.exports.getWords = getWords;
module.exports.getAllWords = getAllWords;
module.exports.make = makeWord;
