var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var timetable= new Schema({
_bed:{ type: Schema.ObjectId, ref: 'Bed'},
_medication:{ type: Schema.ObjectId, ref: 'medication'},
station:String,
userid:String,
infused:String,
time:Number,
bed:String,
patient:String
});

module.exports = mongoose.model('Timetable',timetable);

