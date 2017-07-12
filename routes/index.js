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
var Tempaccount = require('../models/tempaccount');
var router = express.Router();
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var wifi = require('node-wifi');
var request=require('request');
const wifiPassword = require('wifi-password');
const wifiName = require('wifi-name');
var ip = require('ip');
var ObjectId = require('mongodb').ObjectID;
var nodemailer = require("nodemailer");

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
        //find timetable and sort in ascending order,there will be duplicates beacause search query is station and user id
        Timetable.find({'station':req.session.station,'userid':req.user.id,'infused':'not_infused'}).sort({time:1}).populate({path:'station',model:'Station'}).exec(function(err,tim){
        if (err) return console.error(err);
        //storing sorted bed ids into an array
        var arr_bed=[];
        for (var key in tim) {
            arr_bed[key]=tim[key]._bed;

        }
        //check for the duplicate bed id reference and eliminating it
        var arr_bed_new=[];
        var n=arr_bed.length;
        var count=0;
        for(var c=0;c<n;c++)
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
        //find the beds using array of bed ids after eliminating duplicates and populating all reference model for rendering home page 
        Bed.find({'_id': {$in:arr_bed_new}}).populate({path:'_patient',model:'Patient',populate:{path:'_medication',model:'Medication',populate:{path:'_timetable',model:'Timetable',options:{ sort: { 'time': 1 }}}}}).exec(function(err,bedd){
        //saving soreted patient ids for find next infusion time
        var arr_pat=[];
        for (var key in bedd) {
            arr_pat[key]=bedd[key]._patient._id;

        }
        //code to sort medicines with in a bed
        for(var lp1=0;lp1<bedd.length;lp1++)
        {
            for(var lp2=0;lp2<bedd[lp1]._patient._medication.length;lp2++)
            {
               for(var i =0;i<bedd[lp1]._patient._medication.length;i++)
               {
                for(var j =0;j<bedd[lp1]._patient._medication.length;j++)
                {
                    if(bedd[lp1]._patient._medication[i]._timetable[0].time<bedd[lp1]._patient._medication[j]._timetable[0].time)            
                        {
                            var temp=bedd[lp1]._patient._medication[i];
                            bedd[lp1]._patient._medication[i]=bedd[lp1]._patient._medication[j];
                            bedd[lp1]._patient._medication[j]=temp;
                        }
                    }
               }

            }

        }
        //reordering the returened array of object to sorted order
        var bed=[];
        for (var key in arr_bed_new)
        {
            for (var key2 in bedd)
            {
                if(arr_bed_new[key].toString()==bedd[key2]._id.toString())
                {
                    bed.push(bedd[key2]);

                }
            }

        }
        //find and sorting timetable by passing patient id array as search query to get next infusion time
        Timetable.find({'patient':{$in:arr_pat},'infused':'not_infused'}).sort({time:1}).exec(function(err,timee){
            if (err) return console.error(err);
            //for removing the repeated or duplicate patient referenece from the sorted time           
            var arr_time_new=[];
            var n=timee.length;
            var count=0;
            for(var c=0;c<n;c++)  
                { 
                    for(var d=0;d<count;d++) 
                    { 
                        if(timee[c].patient.toString()==arr_time_new[d].patient.toString()) 
                            break; 
                    } 
                    if(d==count) 
                    { 
                        arr_time_new[count] = timee[c]; 
                        count++; 
                    } 
                }
          //modifying __v property of bed so that it can pass to jade 
          for(var key in bed){
            bed[key].__v = arr_time_new[key].time;
          }  
         res.render('home', {user: req.user,beds:bed});
            });
    });
    });

});


router.get('/register', function(req, res) {
   
    res.render('register', {});
});
router.get('/forgot', function(req, res) {
   
    res.render('forgot', {});
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

    Bed.find({'_station':req.session.station,'bedstatus':'unoccupied'}).populate('_station').exec(function(err, bed) {
        if (err) return console.error(err);
        // console.log(bed);    
        res.render('addpatient', {
            user: req.user,
            beds: bed
        });
    })

});
router.get('/editpatient',checkAuthentication,function(req,res){
    Bed.find({'_id':req.query.bed}).populate({path:'_patient',model:'Patient',populate:{path:'_medication',model:'Medication',populate:{path:'_timetable',model:'Timetable',options:{ sort: { 'time': 1 }}}}}).exec(function(err,bed){
        if (err)return console,log(err);
            Bed.find({'_station':req.session.station,'bedstatus':'unoccupied'}).exec(function(err,bedlist){
                Bed.find({'_id':req.query.bed}).exec(function(err,bedd){
                    var thisbed=bedd[0]; 
                    bedlist.splice(0, 0,thisbed);
                        res.render('editpatient',{
                            user: req.user,
                            beds:bed,
                            bedlists:bedlist
                    });


                });
           
        });

    });

});
router.get('/listpatient',checkAuthentication,function(req,res){
    Patient.find({'_station':req.session.station}).exec(function(err,patient){
        if (err)return console,log(err);
        res.render('listpatient',{
            user: req.user,
            patients:patient
        });

    });

});
router.get('/addbed', checkAuthentication, function(req, res) {
    res.render('addbed', {
        user: req.user
    });
});
router.get('/listbed',checkAuthentication,function(req,res){
    Bed.find({'_station':req.session.station}).exec(function(err,bed){
        if (err)return console,log(err);
        res.render('listbed',{
            user: req.user,
            beds:bed
        });

    });

});
router.get('/addivset', checkAuthentication, function(req, res) {
    res.render('addivset', {
        user: req.user
    });
});
router.get('/listivset',checkAuthentication,function(req,res){
    Ivset.find({'sname':req.session.station}).exec(function(err,ivset){
        if (err)return console,log(err);
        res.render('listivset',{
            user: req.user,
            ivsets:ivset
        });

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
    console.log(req.body.bedname);
    var bedarr=[];
    for (var key in req.body.bedname) {
        bedarr[key]=req.body.bedname[key];
    }
    for(var i=0;i<bedarr.length;i++){
    var bed_to_add = new Bed({
        bname: bedarr[i],
        bedstatus:'unoccupied',
        _station: req.session.station
    });
    bed_to_add.save(function(err, bed_to_add) {
        if (err) return console.error(err);
    });
    }
    console.log(i);
    res.redirect('/');

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
        patientstatus:'active',
        weight: req.body.patient.weight,
        _bed: req.body.bed,
        _station:req.session.station
        });
       patient.save(function(err, patient_to_add) {
        if (err) return console.error(err);
            
            // get medications
            Bed.findOne({ _id: req.body.bed}, function (err, doc){
              doc._patient = patient;
              doc.bedstatus = 'occupied';
              doc.save();
            });         
            var med=[{}];
            for (var key in req.body.medications) {
                var medin={};
                medin._bed=mongoose.Types.ObjectId(req.body.bed),
                medin._station=req.session.station,
                medin.name=req.body.medications[key].name,
                medin.rate=req.body.medications[key].rate,
                medin.tvol=req.body.medications[key].tvol,

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
                                 timin.patient=patient._id.toString();
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
router.post('/updatepatient',checkAuthentication, function(req,res){
    //get the array of medication ids and time ids to be deleted passing values from editpatient.js 
    var delete_medication=[];
    for (var key in req.body.delete_medications) {
        delete_medication[key]=ObjectId(req.body.delete_medications[key]);
    }
    var delete_timedata=[];
    for (var key in req.body.delete_timedata) {
        delete_timedata[key]=ObjectId(req.body.delete_timedata[key]);
    }
    var patid = ObjectId(req.body.patient.pid);
    var bedid = ObjectId(req.body.delbed);
    var newbedid = ObjectId(req.body.bed);

    Patient.collection.update({'_id':patid},{$set:{name:req.body.patient.name,age:req.body.patient.age,weight:req.body.patient.weight,_bed:req.body.bed}});
    if(req.body.delbed == req.body.bed)
    {
       console.log("no bed change");
    }
    else{
           Bed.collection.update({'_id':bedid},{$unset:{_patient:""}});
           Bed.collection.update({'_id':bedid},{$set:{bedstatus:"unoccupied"}});
           Bed.collection.update({'_id':newbedid},{$set:{_patient:patid,bedstatus:"occupied"}});
           Timetable.collection.updateMany({'bed':req.body.delbed},{$set:{bed:req.body.bed,_bed:req.body.bed}});
           Medication.collection.updateMany({'_bed':bedid},{$set:{_bed:req.body.bed}});
                            


       } 
    //saving the updated medication data
    for(var lp3=0;lp3<req.body.medications.length;lp3++)
    {
     if(req.body.medications[lp3].medid != "new")
     {    
         var medid = ObjectId(req.body.medications[lp3].medid);
        Medication.collection.update({_id:medid},{$set:{rate:req.body.medications[lp3].rate,tvol:req.body.medications[lp3].tvol}},{upsert:false});
    
     }
    } 

//delmedids returns the medicine ids for deletion----if user deleted a medicine
   var medids=[];
   for(var key in req.body.medications)
   {
    medids[key]=req.body.medications[key].medid;
   }

   var delmedids=[];
   for(var lp1=0;lp1<delete_medication.length;lp1++)
   {
    for(var lp2=0;lp2<medids.length;lp2++)
    {
        if(delete_medication[lp1]==medids[lp2])
        {
            break;
        }
        if(lp2==(medids.length-1))
        {
            delmedids.push(delete_medication[lp1]);
        }

    }
  
   }
var doop=(typeof(medids[0])).toString();
console.log(delmedids);
if(doop != 'undefined')
{
//deltimeids array has all the timeids of existing medicine to be deleted from database---user removes a time
    var timeidss=[];
    for(var lp4=0;lp4<req.body.medications.length;lp4++)
    {
        for(var lp5=0;lp5<req.body.medications[lp4].timeid.length;lp5++)
        {

            timeidss.push(req.body.medications[lp4].timeid[lp5]);
        }
    }
    //formating passed timeids
    var timeids=[];
    for(var lp8=0;lp8<timeidss.length;lp8++)
    {
        var result = timeidss[lp8].slice(1, -1);
        timeids.push(result);
    }
    //comparing all passed ids with existing ids and find the timeids for deletion
    var deltimeids=[];
    for(var lp6=0;lp6<delete_timedata.length;lp6++)
    {
    for(var lp7=0;lp7<timeids.length;lp7++)
    {
        if(delete_timedata[lp6]==timeids[lp7])
        {
            break;
        }
        if(lp7==(timeids.length-1))
        {
            deltimeids.push(delete_timedata[lp6]);
        }

    }
  
   } 
console.log(deltimeids);

//tim returns new time to be added to existing medicine
  var newtime,newtimedata,tim=[{}],existmedid;
   for(var lp10 in req.body.medications)
   {
        if(req.body.medications[lp10].medid.toString() != "new")
        {
            for(var lp11 in req.body.medications[lp10].timeid)
            {
              newtime = req.body.medications[lp10].timeid[lp11].slice(1, -1);
              existmedid=ObjectId(newtime);
              newtimedata= req.body.medications[lp10].time[lp11];
              for(var lp12 in delete_medication)
              {
                if(newtime==delete_medication[lp12])
                {
                    var timin={};
                    console.log("New time");
                    timin._bed=req.body.bed;
                    timin.bed=req.body.bed;
                    timin.patient=patid.toString();
                    timin._medication=existmedid;
                    timin.station=req.session.station;
                    timin.infused="not_infused";
                    timin.userid=req.user.id;
                    timin.time=newtimedata;
                    tim.push(timin);
                    break;
                        }
                if(lp12==(delete_medication.length-1))
                {
                    console.log("old time");
                }
              }
           

            }

        }

   } 
   //to eliminate first element which is an empty object
   tim.shift();
   console.log(tim);
//new med details in med array
   var med=[{}];
   var arrin1=[];
   for(var key in req.body.medications)
     {
      if(req.body.medications[key].medid.toString() == "new")
      {   
          var medin={};
          medin._bed=mongoose.Types.ObjectId(req.body.bed),
          medin._station=req.session.station,
          medin.name=req.body.medications[key].name,
          medin.rate=req.body.medications[key].rate,
          medin.tvol=req.body.medications[key].tvol,
          med.push(medin);
          arrin1.push(req.body.medications[key].time);
      }
     }  
     med.shift();
     console.log(med);
     console.log(arrin1);

     var medidd=[];
      for(var lp9=0;lp9<req.body.medications.length;lp9++)
      {
      if(req.body.medications[lp9].medid != "new")
      {    
          medidd.push(ObjectId(req.body.medications[lp9].medid));
     
      }

     }

//adding a new medicine
if(med.length >0){
Medication.collection.insert(med, onInsert);

    function onInsert(err,docs) {
    if (err) {console.log(err);

    } else {         
            for (var key in med){
            Patient.collection.update({_id:patid},{$push:{_medication:med[key]._id}},{upsert:false});
            }
            timm=[{}];
            var cn=0;
            docs.ops.forEach(function callback(currentValue, index, array) {

                 var arrin=arrin1[index];
                 for(var j=0;j<arrin.length;j++){
                     var timin={};
                     timin._bed=req.body.bed;
                     timin.bed=req.body.bed;
                     timin.patient=patid.toString();
                     timin._medication=currentValue._id;
                     timin.station=req.session.station;
                     timin.infused="not_infused";
                     timin.userid=req.user.id;
                     timin.time=arrin[j];
                     timm[cn]=timin;
                     cn++;
                     }
                                        
            });
            
            Timetable.collection.insert(timm, onInsert);
    
                    function onInsert(err,times) {
                        if (err) {
                        } else {
                        for (var key in med) 
                        {
                            for (var key2 in timm)
                                if(med[key]._id===timm[key2]._medication)
                        Medication.collection.update({_id:med[key]._id},{$push:{_timetable:timm[key2]._id}},{upsert:false});
                        }
                        }
                    }

        }
    }
 }    
    var bulktime = Timetable.collection.initializeOrderedBulkOp();
    //remove all timetables when a medicine is deleted
    if(delmedids.length > 0)
    delmedids.forEach(function(currentValue,index,array){
    bulktime.find({'_medication': currentValue}).remove();
    });
    //remove  timetables from already existing medicine
    if(deltimeids.length >0)
    deltimeids.forEach(function(currentValue,index,array){
    bulktime.find({'_id': currentValue}).remove();
    });
    //inserting timetable to already existing medicine
    if(tim.length > 0)
    tim.forEach(function(currentValue,index,array){
    bulktime.insert(currentValue);
    });
    if(delmedids.length > 0 || deltimeids.length > 0 || tim.length>0)
    bulktime.execute(function(err, result) {
            if(err) {

            } else{
                var bulkmed=Medication.collection.initializeOrderedBulkOp();
                //remove medication on delete medicine
                if(delmedids.length > 0)
                delmedids.forEach(function(currentValue,index,array){
                bulkmed.find({'_id': currentValue}).remove();
                });
                //remove timetable reference in medication when user deletes a time
                if(medidd.length > 0)
                medidd.forEach(function(currentValue,index,array){
                bulkmed.find({'_id': currentValue}).update({$pull:{_timetable:{$in:deltimeids}}});
                });
                //add refernece of new time to already existing ids
                if(tim.length > 0)
                tim.forEach(function(currentValue,index,array){
                bulkmed.find({'_id':currentValue._medication}).update({$push:{_timetable:currentValue._id}});
                });
                if(delmedids.length > 0 || deltimeids.length > 0 || tim.length>0)
                bulkmed.execute(function(err, result2) {
                    if(err){
                    }
                    else{
                        var bulkpat=Patient.collection.initializeOrderedBulkOp();
                        bulkpat.find({'_id':patid}).update({$pull:{_medication:{$in:delmedids}}});
                        bulkpat.execute(function(err, result2) {
                            if(err){
                            }
                            else{
                                console.log("ok");
                            }
                        });
                    }
                });

            }         
        });

}
res.redirect('/');

});




router.post('/addivset', checkAuthentication, function(req, res) {
    console.log(req.body);
    Ivset.collection.update({ivdpf:req.body.ivdpf},{$set:{ivname:req.body.ivname,ivdpf:req.body.ivdpf,uid:req.user.id,sname:req.session.station}},{upsert:true})
    res.redirect('/');
});

router.post('/register', function(req, res) {
//check whether the user is already registered    
    Account.find({'username':req.body.username}).exec(function(err, tempp) {
    if(tempp.length !==0){
        res.render('errusralreadyexist');
    }
//if new user    
    else
    {
    //setting up node mailer to send verification mail
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'dripocare@gmail.com', // our mail id and password
        pass: '3v3lab5.co'
      }
    });
    //making the verification link
    var rand=Math.floor((Math.random() * 100) + ((54*1245)*5678)); //creating a random id for verification
    var host=req.get('host');
    //passing unique id and username as query
    var link="http://"+req.get('host')+"/verify?id="+rand+"&uid="+req.body.username; 
    //e-mail part
    var mailOptions = {
      from: 'dripocare@gmail.com',
      to: req.body.username,
      subject: 'Verification Link For Dripo.care',
    html : "Hello "+req.body.username+",<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>" 
    };
    //sending e-mail to registered mail id
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);

      }
    });
    //storing user details + unique id in a temp collection
        Tempaccount.collection.update({username:req.body.username},{$set:{username:req.body.username,hname:req.body.hname,password:req.body.password,rand:rand.toString(),host:host.toString(),link:link.toString()}},{upsert:true})
        res.render('reglinksend',{mailid:req.body.username,msg1:"A link has been send to",msg2:"Verify the link and complete the registration"});
       }
});
router.get('/verify',function(req,res){
    //search whether the user is available in temp collection
    Tempaccount.find({'username':req.query.uid}).exec(function(err,tmp){
        //for the link exipration that is temp account is deleted on first link visit
        if(tmp.length==0)
        {
            res.render('regcmpltmsg',{msg:"Link has been Expired"});
        }
        else
        {
            //comparing the link with the link stored in database
            console.log(req.protocol+":/"+req.get('host'));
            if((req.protocol+"://"+req.get('host'))==("http://"+tmp[0].host))
            {                    
                console.log(tmp[0].rand);
                console.log(req.query.id);
                console.log("Domain is matched. Information is from Authentic email");
                //comparing the unique-id
                if(req.query.id==tmp[0].rand)
                {
                    console.log("email is verified");
                    Tempaccount.find({'rand':req.query.id}).exec(function(err, temp) {
                        console.log(temp);
                        //Registering the user by creating an permanent account
                        Account.register(new Account({
                            username: temp[0].username,
                            hname: temp[0].hname}),temp[0].password, function(err, account) {
                            if (err) {
                                console.log(err);
                                res.end(err);
                            }
                            else
                            //after successful permanent account creation; deleting the temp account
                            Tempaccount.collection.remove({'rand':req.query.id.toString()});
                            res.render('regcmpltmsg',{msg:'Registration completed Successfuly'});
                            passport.authenticate('local')(req, res, function() {
                                res.redirect('/login');
                            });
                        });


                    });
                }
                else
                {
                    console.log("email is not verified");
                    res.end("<h1>Bad Request</h1>");
                }
            }
            else
            {
                res.end("<h1>Request is from unknown source");
            }
            }
        });
    
    });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/addstation?add_flag=null');
});

router.post('/deletebed', checkAuthentication, function(req, res) {
    var bedid=ObjectId(req.query.bed);
    Bed.update({_id:req.query.bed},{$unset:{_patient:""}},function(err,bed){
    });
    Bed.update({_id:req.query.bed},{$set:{bedstatus:"unoccupied"}},function(err,bed){
    });
    Patient.collection.update({'_bed':bedid},{$set:{patientstatus:"inactive"},$unset:{_bed:""}});
    Medication.collection.updateMany({'_bed':bedid},{$unset:{_bed:""}});
    Timetable.collection.remove({bed:req.query.bed});
    res.redirect('/');    
});
//forgot password
router.post('/forgot', function(req, res) {
    //check whether there is a user
    Account.find({'username':req.body.username}).exec(function(err, temp) {
    if(temp.length===0){
        res.render('errnouserfound');
    }
    else{
    console.log(temp);
    //setting up node mailer
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'dripocare@gmail.com', // our mail id and password
        pass: '3v3lab5.co'
      }
    });
    var rand=Math.floor((Math.random() * 100) + ((54*1245)*5678*897656)); //creating a random id for verification
    var host=req.get('host');
    var loginn="http://"+req.get('host')+"/login";
    var link="http://"+req.get('host')+"/reset?id="+rand+"&uid="+req.body.username+"&hid="+temp[0].hname; //making link
    var mailOptions = {
      from: 'dripocare@gmail.com',
      to: req.body.username,
      subject: 'Reset Password of Dripo.care',
    html : "Hello"+req.body.username+",<br> Please Click on the link to reset your password.<br><a href="+link+">Click here to verify</a>" 
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
        //add code to store temp account

      }
    });
        Tempaccount.collection.update({username:req.body.username},{$set:{username:req.body.username,rand:rand.toString(),host:host.toString(),link:link.toString()}},{upsert:true})
        res.render('reglinksend',{mailid:req.body.username,msg1:"A link to change your password has been send to",msg2:""});
    }
});
});
router.get('/reset',function(req,res){
    //search for temp account and for link exipiration
    Tempaccount.find({'username':req.query.uid}).exec(function(err,tmp){
         if(tmp.length===0)
        {
            res.render('regcmpltmsg',{msg:"Link has been Expired"});
        }

        else
        {
            console.log(req.protocol+":/"+req.get('host'));
            if((req.protocol+"://"+req.get('host'))==("http://"+tmp[0].host))
            {
                console.log("Domain is matched. Information is from Authentic email");
                console.log(req.query.id);
                if(req.query.id==tmp[0].rand)
                {
                    console.log("email is verified");           
                    res.render('passwordreset',{user:req.query.uid,hospital:req.query.hid});
                    Tempaccount.collection.remove({'rand':req.query.id.toString()});
                }
                else
                {
                    console.log("email is not verified");
                    res.end("<h1>Bad Request</h1>");
                }
            }
            else
            {
                res.end("<h1>Request is from unknown source");
            }
            }

        });
   
   
});

router.post('/passwordreset', function(req, res) {
    Account.findByUsername(req.body.username).then(function(sanitizedUser) {
            if (sanitizedUser) {
                sanitizedUser.setPassword(req.body.password, function() {
                    sanitizedUser.save();
                    res.render('regcmpltmsg',{msg:'Password Has Been Changed Successfuly'});
                });
            } else {
                res.render('errnouserfound');
            }
        }, function(err) {
            console.error(err);
        });


});

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//This request has change from ProjectServerApp
router.get('/listdevice',checkAuthentication,function(req,res){
    Device.find({'sname':req.session.station}).exec(function(err,device){
        if (err)return console,log(err);
        res.render('listdevice',{
            user: req.user,
            devices:device
        });

    });

});
router.get('/adddevice', checkAuthentication, function(req, res) {
        res.render('adddeviceonl', {
            user: req.user
        });
});
router.post('/adddevice', checkAuthentication, function(req, res) {
    Device.collection.update({divid:req.body.divid},{$set:{divid:req.body.divid,uid:req.user.id,sname:req.session.station}},{upsert:true})
    res.redirect('/');
});


module.exports = router;
