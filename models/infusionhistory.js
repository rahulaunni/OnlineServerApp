var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var infusionhistory= new Schema({
_timetable:[{ type: Schema.ObjectId, ref: 'Timetable'}],
date:String,
infdate: Date,
infstarttime:String,
inftvol:String,
infendtime:String,
sname:String,
uid:String,
plotrate:[Number],
plotinfvol:[Number],
inferr:[{errtype:String,errtime:String}]
});



module.exports = mongoose.model('Infusionhistory',infusionhistory);

