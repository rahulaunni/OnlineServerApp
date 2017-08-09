var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var medication= new Schema({
_bed:{ type: Schema.ObjectId, ref: 'Bed'},
_station:{ type: Schema.ObjectId, ref: 'Station'},
_timetable:[{ type: Schema.ObjectId, ref: 'Timetable'}],
_infusionhistory:[{ type: Schema.ObjectId, ref: 'Infusionhistory'}],
name:String,
rate:Number,
tvol:Number,
});



module.exports = mongoose.model('Medication',medication);

