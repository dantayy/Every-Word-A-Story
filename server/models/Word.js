const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const _ = require('underscore');

let WordModel = {};

// mongoose.Types.ObjectID is a function that converts string ID to real mongo ID
const convertId = mongoose.Types.ObjectId;
const setName = (text) => _.escape(text).trim();

const WordSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
    set: setName,
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
  color: {
    type: String,
    required: true,
    default: 'black',
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

WordSchema.statics.toAPI = doc => ({
  text: doc.text,
  owner: doc.owner,
});

WordSchema.statics.findByOwner = (ownerId, callback) => {
  const search = {
    owner: convertId(ownerId),
  };

  return WordModel.find(search).select('text').exec(callback);
};

WordModel = mongoose.model('Word', WordSchema);

module.exports.WordModel = WordModel;
module.exports.WordSchema = WordSchema;
