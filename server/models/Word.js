// neccesary dependencies
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const _ = require('underscore');

// vars for the model and schema
let WordModel = {};
// mongoose.Types.ObjectID is a function that converts string ID to real mongo ID
const convertId = mongoose.Types.ObjectId;
const setName = (text) => _.escape(text).trim();

// all paramaters needed for a word
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

// vars sent here can be accessed by any other file that pulls in this model
WordSchema.statics.toAPI = doc => ({
  text: doc.text,
  owner: doc.owner,
});

// find all words made by owner with the passed id
WordSchema.statics.findByOwner = (ownerId, callback) => {
  const search = {
    owner: convertId(ownerId),
  };

  return WordModel.find(search).select('text').exec(callback);
};

// create a new mongo model based on the schema we've constructed
WordModel = mongoose.model('Word', WordSchema);

// export the model and schema so both can be accessed/used elsewhere
module.exports.WordModel = WordModel;
module.exports.WordSchema = WordSchema;
