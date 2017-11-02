var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');


var Button = new Schema({
	buttonid:{type:String,unique:true},
	uid:String,
	sname:String,
	 _bed:{ type: Schema.ObjectId, ref: 'Bed'},

});

module.exports = mongoose.model('Button', Button);