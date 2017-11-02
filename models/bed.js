var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');


var Bed = new Schema({
    bname: String,
    bedstatus:String,
    buttonid:String,
    _station:{ type: Schema.ObjectId, ref: 'Station' },
    _patient:{ type: Schema.ObjectId, ref: 'Patient' },
    _medications:[{ type: Schema.ObjectId, ref: 'Medication'}],
    _button:{ type: Schema.ObjectId, ref: 'Button'}
});


module.exports = mongoose.model('Bed', Bed);

