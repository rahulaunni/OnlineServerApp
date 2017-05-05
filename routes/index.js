var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var Station = require('../models/stations');
var Bed = require('../models/bed');
var Patient = require('../models/patient');
var Medication = require('../models/medication');
var Timetable = require('../models/timetable');
var Device = require('../models/device');
var Ivset = require('../models/ivset');
var router = express.Router();
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var wifi = require('node-wifi');
var request=require('request');
const wifiPassword = require('wifi-password');
const wifiName = require('wifi-name');
var ip = require('ip');
function checkAuthentication(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect("/login");
    }
}

router.get('/', checkAuthentication, function(req, res) {

    res.render('index', {
        user: req.user
    });
});
router.get('/home', checkAuthentication, function(req, res) {

        Timetable.find({'station':req.session.station,'userid':req.user.id}).sort({time:1}).populate({path:'station',model:'Station'}).exec(function(err,tim){
        if (err) return console.error(err);
        var arr_bed=[];
        for (var key in tim) {
            arr_bed[key]=tim[key]._bed;

        }

        var arr_bed_new=[];
        var n=arr_bed.length;
        var count=0;
        for(var c=0;c<n;c++) //For removing duplicate bed ids 
            { 
                for(var d=0;d<count;d++) 
                { 
                    if(arr_bed[c].toString()==arr_bed_new[d].toString()) 
                        break; 
                } 
                if(d==count) 
                { 
                    arr_bed_new[count] = arr_bed[c]; 
                    count++; 
                } 
            } 
        Bed.find({'_id': {$in:arr_bed_new}}).populate({path:'_patient',model:'Patient',populate:{path:'_medication',model:'Medication',populate:{path:'_timetable',model:'Timetable'}}}).exec(function(err,bedd){
        // reordering to sorted order
        var bed=[];
        for (var key in arr_bed_new)
        {
            for (var key2 in bedd)
            {
                if(arr_bed_new[key].toString()==bedd[key2]._id.toString())
                {
                    bed.push(bedd[key2])

                }
            }

        }
        Timetable.find({'bed':{$in:arr_bed_new},'infused':'not_infused'}).sort({time:1}).exec(function(err,timee){
                    if (err) return console.error(err);
                    var arr_time_new=[];
                    var n=timee.length;
                    var count=0;
                    for(var c=0;c<n;c++) //For removing duplicate bed ids 
                        { 
                            for(var d=0;d<count;d++) 
                            { 
                                if(timee[c].bed.toString()==arr_time_new[d].bed.toString()) 
                                    break; 
                            } 
                            if(d==count) 
                            { 
                                arr_time_new[count] = timee[c]; 
                                count++; 
                            } 
                        }

                  for(var key in bed){
                    bed[key].__v = arr_time_new[key].time;
                    console.log(key);
                  }  
                 res.render('home', {user: req.user,beds:bed,time:arr_time_new});
                    });
            });
            });

        });



router.get('/register', function(req, res) {
    res.render('register', {});
});
router.get('/addstation', checkAuthentication, function(req, res) {
    //console.log(req.query.add_flag);
    if (req.query.add_flag == 'more') {
        res.render('addstation', {
            user: req.user,
            add_flag: 'more'
        });
    } else {
        Station.count({
            uid: req.user.id
        }, function(err, count) {

            if (count == 0) {
                res.render('addstation', {
                    user: req.user,
                    add_flag: 'newuser'
                });
            } else {
                //  console.log(req.body.stations);

                Station.find({'uid':req.user.id}).exec(function(err, stat) {
                    if (err) return console.error(err);
                    res.render('addstation', {
                        user: req.user,
                        add_flag: 'select',
                        stations: stat
                    });
                })

            }
        });

    }


});
router.get('/addpatient', checkAuthentication, function(req, res) {

    Bed.find({'_station':req.session.station}).populate('_station').exec(function(err, bed) {
        if (err) return console.error(err);
        // console.log(bed);    
        res.render('addpatient', {
            user: req.user,
            beds: bed
        });
    })

});
router.get('/addbed', checkAuthentication, function(req, res) {
    res.render('addbed', {
        user: req.user
    });
});
//to get wifi password
router.get('/adddevice', checkAuthentication, function(req, res) {
        res.render('adddevice', {
            user: req.user
        });
    });
router.get('/addivset', checkAuthentication, function(req, res) {
    res.render('addivset', {
        user: req.user
    });
});
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});
router.get('/login', function(req, res) {
    res.render('login', {
        user: req.user
    });
});



router.post('/addbed', checkAuthentication, function(req, res) {

    var bed_to_add = new Bed({
        bname: req.body.bname,
        _station: req.session.station
    });
    bed_to_add.save(function(err, bed_to_add) {
        if (err) return console.error(err);
        res.redirect('/');
    });
});
router.post('/addstation', checkAuthentication, function(req, res) {
    var station_to_add = new Station({
        sname: req.body.sname,
        uid: req.user.id,
        beds: []
    });
    station_to_add.save(function(err, station_to_add) {
        if (err) return console.error(err);
        req.session.station = station_to_add.id;
        res.redirect('/');
    });
});
router.post('/selectstation', checkAuthentication, function(req, res) {
    Station.findOne({
        '_id': req.body.statn
    }, function(err, stat) {
        if (err) return console.error(err);
        req.session.station = stat.id;
        console.log(req.session.station);
        res.redirect('/');
    });

});


router.post('/addpatient', checkAuthentication, function(req, res) {
console.log(req.body);


// ADDING PATIENT
		var patient= new Patient({
        name: req.body.patient.name,
        age: req.body.patient.age,
        weight: req.body.patient.weight,
        _bed: req.body.bed,
		});
       patient.save(function(err, patient_to_add) {
        if (err) return console.error(err);
			
			// get medications
            Bed.findOne({ _id: req.body.bed}, function (err, doc){
              doc._patient = patient;
              doc.save();
            });			
            var med=[{}];
			for (var key in req.body.medications) {
				var medin={}
				medin._bed=req.body.bed,
				medin._station=req.session.station,
				medin.name=req.body.medications[key].name,
				medin.rate=req.body.medications[key].rate
				
				med[key]=medin;
				}
				
			Medication.collection.insert(med, onInsert);

				function onInsert(err,docs) {
				if (err) {
       
				} else {
                        // console.log('med value');
                        // console.log(med[0]._id);
                        for (var key in med){
                        Patient.collection.update({_id:patient._id},{$push:{_medication:med[key]._id}},{upsert:false})
						// add timings of medicine to timings collection
                        }
						tim=[{}];
						var cn=0;
						docs.ops.forEach(function callback(currentValue, index, array) {
							
							 var arrin=req.body.medications[index].time;
							 for(var j=0;j<arrin.length;j++){
								 var timin={};
							 	 timin._bed=req.body.bed;
                                 timin.bed=req.body.bed;
								 timin._medication=currentValue._id;
                                 timin.station=req.session.station;
								 timin.infused="not_infused";
                                 timin.userid=req.user.id;
								 timin.time=arrin[j];
								 tim[cn]=timin;
								 cn++;
								 }
													
						});
						
						Timetable.collection.insert(tim, onInsert);
				
								function onInsert(err,times) {
									if (err) {
									} else {
                                    for (var key in med) 
                                    {
                                        for (var key2 in tim)
                                            if(med[key]._id===tim[key2]._medication)
                                    Medication.collection.update({_id:med[key]._id},{$push:{_timetable:tim[key2]._id}},{upsert:false})
                                    }
									res.redirect('/');
									}
								}

					}
				}
		

    });

});
router.post('/adddevice', checkAuthentication, function(req, res) {
    console.log(req.body);
    Device.collection.update({divid:req.body.divid},{$set:{divid:req.body.divid,uid:req.user.id,sname:req.session.station}},{upsert:true})
    res.redirect('/');
});
router.post('/addivset', checkAuthentication, function(req, res) {
    console.log(req.body);
    Ivset.collection.update({ivdpf:req.body.ivdpf},{$set:{ivname:req.body.ivname,ivdpf:req.body.ivdpf,uid:req.user.id,sname:req.session.station}},{upsert:true})
    res.redirect('/');
});

router.post('/register', function(req, res) {
    Account.register(new Account({
        username: req.body.username,
        hname: req.body.hname
    }), req.body.password, function(err, account) {
        if (err) {
            return res.render('register', {
                account: account
            });
        }

        passport.authenticate('local')(req, res, function() {
            res.redirect('/login');
        });
    });
});
router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/addstation?add_flag=null');
});



module.exports = router;
