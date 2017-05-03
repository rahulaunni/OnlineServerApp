var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');


var Device = new Schema({
	divid:{type:String,unique:true},
	uid:String,
	sname:String,
});

module.exports = mongoose.model('Device', Device);
