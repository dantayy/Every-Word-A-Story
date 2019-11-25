// neccesary dependencies
const crypto = require('crypto');
const mongoose = require('mongoose');

// new mongoose promise system to use with this model/schema
mongoose.Promise = global.Promise;

// vars for the model and schema
let AccountModel = {};
const iterations = 10000;
const saltLength = 64;
const keyLength = 64;

// all paramaters needed for an account
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

// vars sent here can be accessed by any other file that pulls in this model
AccountSchema.statics.toAPI = doc => ({
  // _id is built into your mongo document and is guaranteed to be unique
  username: doc.username,
  _id: doc._id,
  color: doc.color,
  timeBetweenPosts: doc.timeBetweenPosts,
  lastPosted: doc.lastPosted,
});

// use the crypto dependency to check if the password passed is correct
const validatePassword = (doc, password, callback) => {
  const pass = doc.password;

  return crypto.pbkdf2(password, doc.salt, iterations, keyLength, 'RSA-SHA512', (err, hash) => {
    if (hash.toString('hex') !== pass) {
      return callback(false);
    }
    return callback(true);
  });
};

// find an account by username
AccountSchema.statics.findByUsername = (name, callback) => {
  const search = {
    username: name,
  };

  return AccountModel.findOne(search, callback);
};

// generate a hash for an account
AccountSchema.statics.generateHash = (password, callback) => {
  const salt = crypto.randomBytes(saltLength);

  crypto.pbkdf2(password, salt, iterations, keyLength, 'RSA-SHA512', (err, hash) =>
    callback(salt, hash.toString('hex'))
  );
};

// aithenticate an account
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

// create a new mongo model based on the schema we've constructed
AccountModel = mongoose.model('Account', AccountSchema);

// export the model and schema so both can be accessed/used elsewhere
module.exports.AccountModel = AccountModel;
module.exports.AccountSchema = AccountSchema;
