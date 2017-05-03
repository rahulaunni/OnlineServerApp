var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');


var Station = new Schema({
	uid:String,
	sname:String,
});

module.exports = mongoose.model('Station', Station);

