var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');


var Patient = new Schema({
	name:String,
    age:Number,
    weight:Number,
    patientstatus:String,
    _bed:{ type: Schema.ObjectId, ref: 'Bed' },
    _medication:[{ type: Schema.ObjectId, ref: 'Medication'}],
    _tasks:[{ type: Schema.ObjectId, ref: 'Tasks'}],
    _station:String
});


module.exports = mongoose.model('Patient', Patient);

