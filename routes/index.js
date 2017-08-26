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
var wifiPassword = require('wifi-password');
var wifiName = require('wifi-name');
var ip = require('ip');
var ObjectId = require('mongodb').ObjectID;
var nodemailer = require("nodemailer");
//checking for the authentication and if not login redirects to /login page
function checkAuthentication(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect("/login");
    }
}
//loading the index page which has the leftbar menu and middlebar, index page has all the scripts loaded in it and act as a skelton for entire app
router.get('/', checkAuthentication, function(req, res) {
    res.render('index', {
        user: req.user
    });
});
//before rendering the page we have to sort the bed to list according to the time of its next infusion, the operations are to get that orders data
router.get('/home', checkAuthentication, function(req, res) {
        //find timetable and sort in ascending order,there will be duplicates because multiple timetable collection has same bed reference
        Timetable.find({'station':req.session.station,'userid':req.user.id,'infused':{ $in:['not_infused','infusing','alerted']}}).sort({time:1}).populate({path:'station',model:'Station'}).exec(function(err,tim){
        if (err) return console.error(err);
        var date=new Date();
        var hour=date.getHours();
        //re-arrange the sorted time object based on the current time split it into two array before and after current time and combine it later
        var currenttime;
        //this part is to find the starting index of current time if any  eg: [1 2  3 4 5 ] if current hour is 4 index will be 3   
        for(var loop1=0;loop1<tim.length;loop1++)
        {
            if(tim[loop1].time ==hour)
            {
                currenttime=loop1;
                break;
            }
            else if(tim[loop1].time > hour)
            {
                currenttime=loop1;
                break;
            }
            else{
                currenttime=0;

            }
        }
        //spliting the time object into before current time that is from 0 to currenttime eg: [1 2 3]
        var prevtime=[];
        for(var loop2=0;loop2<currenttime;loop2++)
        {
            prevtime.push(tim[loop2]);
        }
        var upcomingtime=[];
        //spliting the time object into on/after the time that is from currenttime to end eg:[4 5]
        for(var loop3=currenttime;loop3<tim.length;loop3++)
        {
            upcomingtime.push(tim[loop3]);
        }
        //combing the splited array in correct order based on time eg: [4 5 1 2 3]
        var sorted_wrt_current_time=upcomingtime.concat(prevtime);
        //storing sorted bed ids into an array
        var arr_bed=[];
        for (var key in sorted_wrt_current_time) {
            arr_bed[key]=sorted_wrt_current_time[key]._bed;

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
        // console.log(JSON.stringify(bedd[0]));
        //saving sorted patient ids for find next infusion time
        var arr_pat=[];
        for (var key in bedd) {
            arr_pat[key]=bedd[key]._patient._id;

        }
        //code to sort medicines with in a bed
        var k=0,l=0,min1=0,min2=0;
        for(var lp1=0;lp1<bedd.length;lp1++)
        {
            for(var lp2=0;lp2<bedd[lp1]._patient._medication.length;lp2++)
            {
               for(var i =bedd[lp1]._patient._medication.length-1;i>=0;i--)
               {
                    for(k=0;k<bedd[lp1]._patient._medication[i]._timetable.length;k++)
                    {
                        if(bedd[lp1]._patient._medication[i]._timetable[k].infused =="not_infused"||bedd[lp1]._patient._medication[i]._timetable[k].infused =="alerted" )
                        {
                            min1=k;
                            break;
                        }

                        else{
                            min1="empty";
                        }
                                           
                         }
                       //  console.log(min1);
                        if (min1=="empty") {

                            continue;
                        }
                for(var j =i-1;j>=0;j--)
                 {


                     for(l=0;l<bedd[lp1]._patient._medication[j]._timetable.length;l++)
                    {
                        if(bedd[lp1]._patient._medication[j]._timetable[l].infused =="not_infused"||bedd[lp1]._patient._medication[j]._timetable[l].infused =="alerted" )
                            {
                                min2=l;
                                break;

                            } 
                            else{
                                min2="empty";
                            }
                        }
                           

                                    if (min2=="empty") {
                                    //    console.log(i);
                                     //   console.log(j);
                           var temp=bedd[lp1]._patient._medication[i];
                           bedd[lp1]._patient._medication[i]=bedd[lp1]._patient._medication[j];
                            bedd[lp1]._patient._medication[j]=temp;
                          i--;
                           continue;
                        }
                              //  console.log("min2="+min2);
                           // console.log("min1="+min1);
                    if(bedd[lp1]._patient._medication[i]._timetable[min1].time<bedd[lp1]._patient._medication[j]._timetable[min2].time)            
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
            //to fetch the details of bed which all the timetables are infused
            Timetable.find({'station':req.session.station,'userid':req.user.id,'infused':'infused'}).sort({time:1}).populate({path:'station',model:'Station'}).exec(function(err,inftim){
            if (err) return console.error(err);
            //storing sorted bed ids into an array
            var arr_infbed=[];
            for (var key in inftim) {
                arr_infbed[key]=inftim[key]._bed;

            }
            //check for the duplicate bed id reference and eliminating it
            var arr_infbed_new=[];
            var n=arr_infbed.length;
            var count=0;
            for(var c=0;c<n;c++)
                { 
                    for(var d=0;d<count;d++) 
                    { 
                        if(arr_infbed[c].toString()==arr_infbed_new[d].toString()) 
                            break; 
                    } 
                    if(d==count) 
                    { 
                        arr_infbed_new[count] = arr_infbed[c]; 
                        count++; 
                    } 
                }
            
            Bed.find({'_id': {$in:arr_infbed_new}}).populate({path:'_patient',model:'Patient',populate:{path:'_medication',model:'Medication',populate:{path:'_timetable',model:'Timetable',options:{ sort: { 'time': 1 }}}}}).exec(function(err,infbedd){
            //saving soreted patient ids for find next infusion time
            var arr_infpat=[];
            for (var key in infbedd) {
                arr_infpat[key]=infbedd[key]._patient._id;

            }
            // sorting the medicnes according to the time for all infused condition
             for(var lp1=0;lp1<infbedd.length;lp1++)
            {
                        var infflag=true;

                for(var lp2=0;lp2<infbedd[lp1]._patient._medication.length;lp2++)
                {
                   for(var i =infbedd[lp1]._patient._medication.length-1;i>=0;i--)
                   {
                        for(k=0;k<infbedd[lp1]._patient._medication[i]._timetable.length;k++)
                        {
                            if(infbedd[lp1]._patient._medication[i]._timetable[k].infused =="not_infused"||infbedd[lp1]._patient._medication[i]._timetable[k].infused =="infusing" )
                            {
                              infflag=false;
                            }
                        }
                    }
                }
                                            

            
                            if (infflag===true) {
                                bed.push(infbedd[lp1]);

                            }
                        }
     
         res.render('home', {user: req.user,beds:bed});

         });
            });
    });
});

});

//route to render register page
router.get('/register', function(req, res) {   
    res.render('register', {});
});

//route to render forgot password page
router.get('/forgot', function(req, res) {
   
    res.render('forgot', {});
});

//route to render add/select station page
router.get('/addstation', checkAuthentication, function(req, res) {
    //rendering the add station page based on the condition if new user render add new station ; for existing user render select station
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

                Station.find({'uid':req.user.id}).exec(function(err, stat) {
                    if (err) return console.error(err);
                    res.render('addstation', {
                        user: req.user,
                        add_flag: 'select',
                        stations: stat
                    });
                });

            }
        });

    }


});

//route to render addpatient page
router.get('/addpatient', checkAuthentication, function(req, res) {
    //to give option to select bed while adding bed
    Bed.find({'_station':req.session.station,'bedstatus':'unoccupied'}).populate('_station').exec(function(err, bed) {
        if (err) return console.error(err);
        // console.log(bed);    
        res.render('addpatient', {
            user: req.user,
            beds: bed
        });
    });

});

//route to render editpatient page
router.get('/editpatient',checkAuthentication,function(req,res){
    //pass the current details to the page for rending
    Bed.find({'_id':req.query.bed}).populate({path:'_patient',model:'Patient',populate:{path:'_medication',model:'Medication',populate:{path:'_timetable',model:'Timetable',options:{ sort: { 'time': 1 }}}}}).exec(function(err,bed){
        if (err)return console,log(err);
            //pass all the unoccupied bed if user wants to change the bed
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

//route to render list of patient page
router.get('/listpatient',checkAuthentication,function(req,res){
    //search all the patient associated with the station and send for page rendering
    Patient.find({'_station':req.session.station,'patientstatus':'active'}).exec(function(err,activepatient){
        if (err)return console,log(err);
        Patient.find({'_station':req.session.station,'patientstatus':'inactive'}).exec(function(err,inactivepatient){
        if (err)return console,log(err);
        res.render('listpatient',{
            user: req.user,
            activepatients:activepatient,
            inactivepatients:inactivepatient
        });

    });
});

});

//route to render patientdetails page
router.get('/viewpatient',checkAuthentication,function(req,res){
    //from the query grab the patient id and search it in DB and send to page, populate infusion history collection for infusion details
    var patid=ObjectId(req.query.patient);
    Patient.find({'_id':patid}).populate({path:'_medication',model:'Medication',populate:{path:'_infusionhistory',model:'Infusionhistory'}}).exec(function(err,patient){
        if (err)return console,log(err);
        res.render('viewpatient',{
            user: req.user,
            patients:patient
        });

});

});

//route to render add bed page
router.get('/addbed', checkAuthentication, function(req, res) {
    res.render('addbed', {
        user: req.user
    });
});

//route to render edit a bed page which enables user to change the bed name
router.get('/editbed',checkAuthentication,function(req,res){
    //from the query grab the bed id and find it, send it
    Bed.find({'_id':req.query.bed}).exec(function(err,bed){
        res.render('editbed',{
            beds:bed

        });
       

    });

});

//routr to render list of all bed linked to that station
router.get('/listbed',checkAuthentication,function(req,res){
    //search all the unoccupied bed associated with the station and send
    Bed.find({'_station':req.session.station,'bedstatus':'unoccupied'}).exec(function(err,bed){
        if (err)return console,log(err);
    //send all the occupied bed
    Bed.find({'_station':req.session.station,'bedstatus':'occupied'}).exec(function(err,obed){

        res.render('listbed',{
            user: req.user,
            beds:bed,
            obeds:obed
        });
    });

    });

});

//post route to delete the bed from DB
router.post('/deletebed',checkAuthentication,function(req,res){
    //route is called to delete an unocuupied bed
    console.log(req.query.bed);
    var bedid=ObjectId(req.query.bed);
    //grab the bed id from query and remove it from data base
    Bed.collection.remove({_id:bedid});
    res.redirect('/listbed');    
});

//route to render add IV-set page
router.get('/addivset', checkAuthentication, function(req, res) {
    res.render('addivset', {
        user: req.user
    });
});

//route for rendering edit IV set 
router.get('/editivset',checkAuthentication,function(req,res){
    //grab the ivset id in query and send details to page for rendering
    Ivset.find({'_id':req.query.ivset}).exec(function(err,ivset){
        res.render('editivset',{
            ivsets:ivset

        });
       

    });

});

//route to store the edited changes of IV set into DB
router.post('/editivset', checkAuthentication, function(req, res) {
    //query has the id of ivset
    var ivid = ObjectId(req.body.ivid);
    //update the changed field
    Ivset.collection.update({'_id':ivid},{$set:{ivname:req.body.ivname,ivdpf:req.body.ivdpf}});
    res.redirect('/');
});

//route to render all the IV set linked with the station
router.get('/listivset',checkAuthentication,function(req,res){
    Ivset.find({'sname':req.session.station}).exec(function(err,ivset){
        if (err)return console,log(err);
        res.render('listivset',{
            user: req.user,
            ivsets:ivset
        });

    });

});

// post route to delete the IV-set from DB
router.post('/deleteivset',checkAuthentication,function(req,res){
    var ivsetid=ObjectId(req.query.ivset);
    //grab the id from query and delete it from DB
    Ivset.collection.remove({_id:ivsetid});
    res.redirect('/listivset');    
});

//route for logout
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

//route to render the login page
router.get('/login', function(req, res) {
    res.render('login', {
        user: req.user
    });
});


//post route to create a Bed Collection in DB
router.post('/addbed', checkAuthentication, function(req, res) {
    //req.body.bedname is an array which has the  user defined names for bed, store it in an array for ease of operation
    console.log(req.body.bedname);
    var bedarr=[];
    for (var key in req.body.bedname)
    {
        bedarr[key]=req.body.bedname[key];
    }
    //grab each element in that array and create an object with properties defined for Bed Model in Bed.js
    for(var i=0;i<bedarr.length;i++)
    {
    var bed_to_add = new Bed({
        bname: bedarr[i],
        bedstatus:'unoccupied',
        _station: req.session.station
    });
    //save it in DB
    bed_to_add.save(function(err, bed_to_add) {
        if (err) return console.error(err);
    });
    }
    res.redirect('/addpatient');

});

//post route for edit bed to save the changes to corresponding Bed collection
router.post('/editbed', checkAuthentication, function(req, res) {
    //grab the bed id from req.body.bedid and change the bed name according to the new data available in req.body.#
    var bedid = ObjectId(req.body.bedid);
    Bed.collection.update({'_id':bedid},{$set:{bname:req.body.bedname}});
    res.redirect('/');
});

//post route for add-station . Create a station collection
router.post('/addstation', checkAuthentication, function(req, res) {
    //grab the details from req.body.# and save it as a new collection
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


//post route for adding patient. This will create a Patient, Medication and Timetable collections and all the referencing and cross refercing is defined here
router.post('/addpatient', checkAuthentication, function(req, res) {
    //create a new patient by using the data available in req.body.#
    var patient= new Patient({
    name: req.body.patient.name,
    age: req.body.patient.age,
    patientstatus:'active',
    admittedon:new Date(),
    weight: req.body.patient.weight,
    _bed: req.body.bed,
    _station:req.session.station
    });
    //save the new patient collection
    patient.save(function(err, patient_to_add) {
        if (err){return console.error(err);}
            // change the property of corresponding Bed where the patient is admitted
            //ref patient in the Bed and changed bed status to ''occupied
            Bed.findOne({ _id: req.body.bed}, function (err, doc){
              doc._patient = patient;
              doc.bedstatus = 'occupied';
              doc.save();
            }); 
            //req.body.medications is an array of object which has all the data like medicine name, rate, total volume etc
            //eg [{name:***,rate:**,tvol:***}....{}....{name:###,rate:###,tvol:###}] 
            //data is structered like this for the ease of operation, this is done in the addpatient.js script from the client side       
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
            //created an array of object med with all details and inserting it into the database  
            Medication.collection.insert(med, onInsert);
                function onInsert(err,docs)
                {
                if (err) {console.log(err);
                } 
                else 
                {
                    //giving ref of medication to the patient, that is medication id is ref as an array in patient collection
                    for (var key in med){
                    Patient.collection.update({_id:patient._id},{$push:{_medication:med[key]._id}},{upsert:false});
                    }

                    //docs.ops has the data available and req.body.medications[].time has all the time associated with that medicine
                    tim=[{}];
                    var cn=0;
                    docs.ops.forEach(function callback(currentValue, index, array) {
                        var arrin=req.body.medications[index].time;
                        //creating an array of object based on the time data
                        for(var j=0;j<arrin.length;j++)
                        {
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
                    //inserting the timetable and creating timetable collection corresponding to each time    
                    Timetable.collection.insert(tim, onInsert);
                            function onInsert(err,times) {
                                if (err)
                                {
                                    console.log(err);
                                } 
                                else 
                                {
                                //linking the timetable collections to the medication
                                for (var key in med) 
                                {
                                    for (var key2 in tim)
                                    if(med[key]._id===tim[key2]._medication)
                                    Medication.collection.update({_id:med[key]._id},{$push:{_timetable:tim[key2]._id}},{upsert:false});
                                }
                                res.redirect('/');
                                }
                            }

                    }
                }

    });

});


//post route for the update patient dependency:- editpatient.js 
router.post('/updatepatient',checkAuthentication, function(req,res){
    //from the request we get all the medicine ids and timeids which already exist and stores it in two array for ease of operation
    var delete_medication=[];
    for (var key in req.body.delete_medications) {
        delete_medication[key]=ObjectId(req.body.delete_medications[key]);
    }
    var delete_timedata=[];
    for (var key in req.body.delete_timedata) {
        delete_timedata[key]=ObjectId(req.body.delete_timedata[key]);
    }
    //grab the patient id ,prev bed id and present bed id(if there is bed change otherwise it will be same)
    var patid = ObjectId(req.body.patient.pid);
    var bedid = ObjectId(req.body.delbed);
    var newbedid = ObjectId(req.body.bed);
    //updating  the basic details of patient name ,age & weight
    Patient.collection.update({'_id':patid},{$set:{name:req.body.patient.name,age:req.body.patient.age,weight:req.body.patient.weight,_bed:req.body.bed}});
    //checking for a bed change
    if(req.body.delbed == req.body.bed)
    {
       console.log("no bed change");
    }
    //if bed change do the following operation unset current bed patient refernce, add ref to new bed, set new bed ref in corresponding medication and timetable collection
    else{
           Bed.collection.update({'_id':bedid},{$unset:{_patient:""}});
           Bed.collection.update({'_id':bedid},{$set:{bedstatus:"unoccupied"}});
           Bed.collection.update({'_id':newbedid},{$set:{_patient:patid,bedstatus:"occupied"}});
           Timetable.collection.updateMany({'bed':req.body.delbed},{$set:{bed:req.body.bed,_bed:req.body.bed}});
           Medication.collection.updateMany({'_bed':bedid},{$set:{_bed:req.body.bed}});
       } 
    //updating the basic details of medicine (medname rate tvol) which already exist
    //for the newly added medicine req.body.medication.medid ="new" so checking that enables this operation performed only in already existing medicines
    for(var lp3=0;lp3<req.body.medications.length;lp3++)
    {
     if(req.body.medications[lp3].medid != "new")
     {    
         var medid = ObjectId(req.body.medications[lp3].medid);
        Medication.collection.update({_id:medid},{$set:{rate:req.body.medications[lp3].rate,tvol:req.body.medications[lp3].tvol}},{upsert:false});
    
     }
    } 

//delmedids returns the medicine ids for deletion----if user deleted a medicine
//comparing the two array and finding the element not present in already existing array
//eg: already exist med ids: [#eee,#aaa,#ccc,#zzz] and new med ids: [#eee,#aaa,new]; med ids to remove: [#ccc,#zzz]
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
//do operations only if atleast one medids is send from client script
var doop=(typeof(medids[0])).toString();
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
    //formating passed timeids due to a extra quotes at begining and end slice the first and last character
    var timeids=[];
    for(var lp8=0;lp8<timeidss.length;lp8++)
    {
        var result = timeidss[lp8].slice(1, -1);
        timeids.push(result);
    }
    //comparing all passed ids with existing ids and find the timeids for deletion; similar to finding the medicine ids for deletion
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

//tim returns new time to be added to existing medicine
//finding the new time by checking the timeid for the new time medicine id is send instead of timeid
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
//this part is similar to the add medicine part
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
 //finally after adding the newly added medicines (if any?) the following are the bulk DB operations
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
                // if(delmedids.length > 0)
                // delmedids.forEach(function(currentValue,index,array){
                // bulkmed.find({'_id': currentValue}).remove();
                // });
                //change bed reference to delbed field
                if(delmedids.length > 0)
                delmedids.forEach(function(currentValue,index,array){
                bulkmed.find({'_id': currentValue}).update({$set:{_delbed:newbedid}});
                bulkmed.find({'_id': currentValue}).update({$unset:{_bed:" "}});
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

//route for posting add iv set
router.post('/addivset', checkAuthentication, function(req, res) {
    console.log(req.body);
    Ivset.collection.update({ivdpf:req.body.ivdpf},{$set:{ivname:req.body.ivname,ivdpf:req.body.ivdpf,uid:req.user.id,sname:req.session.station}},{upsert:true})
    res.redirect('/');
});

//route for posting and verifying register details
router.post('/register', function(req, res) {
//check whether the user is already registered    
    Account.find({'username':req.body.username}).exec(function(err, tempp) {
    if(tempp.length !==0){
        res.render('errusralreadyexist'); //warning user already exist
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

//route for posting login details
router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/addstation?add_flag=null');
});

//route for remove patient from bed
router.post('/removepatient', checkAuthentication, function(req, res) {
    var bedid=ObjectId(req.query.bed);
    var patid;
    //to get patid search in bed
    Bed.find({'_id':bedid}).exec(function (err,bed) {
        patid=bed[0]._patient;
    //to link back the medicines removed from patient , search for all medicines that was previously linked with current bed
    //stores the medids of removed medicines in removedmedids
    Medication.find({'_delbed':bedid}).exec(function (err,med) {
        var removedmedids=[];
        for(var key in med)
        {
            removedmedids.push(ObjectId(med[key]._id));
        }
    //if there is atleast one medicine removed previously from patient link back that medicine for patient history
    if(removedmedids.length>0)
    {
        for (var key1 in removedmedids){
        Patient.collection.update({'_id':patid},{$push:{_medication:removedmedids[key1]}},{upsert:false});
        }
    Bed.update({_id:req.query.bed},{$unset:{_patient:""}},function(err,bed){
    });
    Bed.update({_id:req.query.bed},{$set:{bedstatus:"unoccupied"}},function(err,bed){
    });
    var date = new Date();
    Patient.collection.update({'_id':patid},{$set:{patientstatus:"inactive",dischargedon:date},$unset:{_bed:""}});
    Medication.collection.updateMany({'_bed':bedid},{$unset:{_bed:""}});
    Timetable.collection.remove({bed:req.query.bed});
    Medication.collection.updateMany({'_delbed':bedid},{$unset:{_delbed:""}});
    console.log("just before redirect");
    res.redirect('/');
    }
    //if there is no medicine removal do normal operations of unlinking and removing respective collection
    else{
    Bed.update({_id:req.query.bed},{$unset:{_patient:""}},function(err,bed){
    });
    Bed.update({_id:req.query.bed},{$set:{bedstatus:"unoccupied"}},function(err,bed){
    });
    var date = new Date();
    Patient.collection.update({'_bed':bedid},{$set:{patientstatus:"inactive",dischargedon:date},$unset:{_bed:""}});
    Medication.collection.updateMany({'_bed':bedid},{$unset:{_bed:""}});
    Timetable.collection.remove({bed:req.query.bed});
    res.redirect('/');
    }
});
    });
   
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

//route for posting password reset content
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

//ajax request from notification.js query has the medid and route will return corresponding bedname (to display in the error notification)
router.get('/medtobed', checkAuthentication, function(req, res) {
    console.log(req.query.medid);
    var medid=ObjectId(req.query.medid);
    Medication.find({'_id':medid}).populate({path:'_bed',model:'Bed'}).exec(function(err,bed){
    console.log(bed[0]._bed.bname);
    res.send(bed[0]._bed.bname);
});
});

//this route is from notification.js to check is there any infusion in next hour 
//route will be called in 55th min of every hour
router.get('/infusionalert', checkAuthentication, function(req, res) {
    console.log("called infusion alert");
    Timetable.find({'station':req.session.station,'infused':'not_infused'}).exec(function(err,tim){
        console.log(tim);
        var date=new Date();
        var hour=date.getHours()+1;
        for(var key in tim)
        {
            if(tim[key].time==hour)
            {
                res.send('alert');
                break;
            }
        }
});
});

//route called on acknowledging infusion alert, query has the timeid, route will set its infused flag to alerted (red color in UI)
router.post('/infusionalertack', checkAuthentication, function(req, res) {
    var timeid=ObjectId(req.query.timeid);
    Timetable.collection.update({'_id':timeid},{$set:{infused:"alerted"}});
    
});

//route to render list of device search all device linked with the station
router.get('/listdevice',checkAuthentication,function(req,res){
    Device.find({'sname':req.session.station}).exec(function(err,device){
        if (err)return console,log(err);
        res.render('listdevice',{
            user: req.user,
            devices:device
        });

    });

});

//route to render add device page
router.get('/adddevice', checkAuthentication, function(req, res) {
        res.render('adddeviceonl', {
            user: req.user
        });
});

//route for render edit device , query has the device id find and send the details
router.get('/editdevice',checkAuthentication,function(req,res){
    Device.find({'_id':req.query.device}).exec(function(err,device){
        res.render('editdevice',{
            devices:device

        });
       

    });

});

//route for posting add device details
router.post('/adddevice', checkAuthentication, function(req, res) {
    Device.collection.update({divid:req.body.divid},{$set:{divid:req.body.divid,uid:req.user.id,sname:req.session.station}},{upsert:true})
    res.redirect('/');
});

//route for posting edit device
router.post('/editdevice', checkAuthentication, function(req, res) {
    var devid = ObjectId(req.body.id);
    Device.collection.update({'_id':devid},{$set:{divid:req.body.divid}});
    res.redirect('/');
});

//route for deleting a device from database, qury has the device id
router.post('/deletedevice',checkAuthentication,function(req,res){
    console.log(req.query.device);
    var deviceid=ObjectId(req.query.device);
    Device.collection.remove({_id:deviceid});
    res.redirect('/listdevice');    
});

module.exports = router;
