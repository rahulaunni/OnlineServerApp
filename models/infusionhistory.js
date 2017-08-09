var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var infusionhistory= new Schema({
_timetable:[{ type: Schema.ObjectId, ref: 'Timetable'}],
infdate: Date,
infstarttime:String,
inftvol:String,
infendtime:String,
sname:String,
uid:String,
inferr:[{errtype:String,errtime:String}]
});



module.exports = mongoose.model('Infusionhistory',infusionhistory);

