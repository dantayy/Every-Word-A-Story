const crypto = require('crypto');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

let AccountModel = {};
const iterations = 10000;
const saltLength = 64;
const keyLength = 64;

const AccountSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        match: /^[A-Za-z0-9_\-.]{1,16}$/,
    },
    salt: {
        type: Buffer,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdDate: {
        type: Date,
        default: Date.now,
    },
    color: {
        type: String,
        required: true,
        default: 'black',
    },
    timeBetweenPosts: {
        type: Number,
        required: true,
    },
    lastPosted: {
        type: Date,
        required: true,
    },
});

AccountSchema.statics.toAPI = doc => ({
    // _id is built into your mongo document and is guaranteed to be unique
    username: doc.username,
    _id: doc._id,
    color: doc.color,
    timeBetweenPosts: doc.timeBetweenPosts,
    lastPosted: doc.lastPosted,
});

const validatePassword = (doc, password, callback) => {
    const pass = doc.password;

    return crypto.pbkdf2(password, doc.salt, iterations, keyLength, 'RSA-SHA512', (err, hash) => {
        if (hash.toString('hex') !== pass) {
            return callback(false);
        }
        return callback(true);
    });
};

AccountSchema.statics.findByUsername = (name, callback) => {
    const search = {
        username: name,
    };

    return AccountModel.findOne(search, callback);
};

AccountSchema.statics.generateHash = (password, callback) => {
    const salt = crypto.randomBytes(saltLength);

    crypto.pbkdf2(password, salt, iterations, keyLength, 'RSA-SHA512', (err, hash) =>
                  callback(salt, hash.toString('hex'))
                 );
};

AccountSchema.statics.authenticate = (username, password, callback) =>
AccountModel.findByUsername(username, (err, doc) => {
    if (err) {
        return callback(err);
    }

    if (!doc) {
        return callback();
    }

    return validatePassword(doc, password, (result) => {
        if (result === true) {
            return callback(null, doc);
        }

        return callback();
    });
});

AccountSchema.statics.updateLastPosted = (un, callback) => AccountModel.findByUsername(un, (err, doc) => {
    if (err) {
        return callback(err);
    }

    if (!doc) {
        return callback();
    }
    
    let account = doc;
    account.lastUpdated = Date.now();
    let savePromise = account.save();
    savePromise.then(() => {
        return callback();
    });
    savePromise.catch((err) => callback(err));
});

AccountModel = mongoose.model('Account', AccountSchema);

module.exports.AccountModel = AccountModel;
module.exports.AccountSchema = AccountSchema;
