var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Tempaccount = new Schema({
    username: String,
    password: String,
    hname: String,
    rand:String,
    host:String,
    link:String,
});
module.exports = mongoose.model('Tempaccount', Tempaccount);

