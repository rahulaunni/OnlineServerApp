var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');


var Ivset = new Schema({
	ivname:String,
	ivdpf:String,
	uid:String,
	sname:String
});

module.exports = mongoose.model('Ivset', Ivset);