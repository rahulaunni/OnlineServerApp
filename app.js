var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var routes = require('./routes/index');
var users = require('./routes/users');
var http = require("http");
var app = express();
var ObjectId = require('mongodb').ObjectID;
var fs = require('fs');
var cron = require('node-cron');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', routes);


// passport config
var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// mongoose
// mongoose.connect('mongodb://localhost/dripov2');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/dripov2',{ server: {reconnectTries:30,reconnectInterval:10000} }, function(error) {
    if(error)
    {   
        
        console.log("mongodb connection failed");
    }
    else
    {
        console.log("mongodb connection success");
        var dateObj = new Date();
        var month = dateObj.getUTCMonth() + 1; //months from 1-12
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();
        newdate = day + "/" + month + "/" + year;
        console.log(newdate);
        console.log((new Date).getHours()+':'+(new Date).getMinutes()+':'+(new Date).getSeconds()+':'+(new Date).getMilliseconds());

    }
});
app.use(session({secret: "Shhsssh",resave: true,
    saveUninitialized: true}));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// mqtt part*******************************************************************************************************************
//importing models necessary for mqtt part
var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://localhost:1883');
var Station = require('./models/stations');
var Account = require('./models/account');
var Bed = require('./models/bed');
var Patient = require('./models/patient');
var Medication = require('./models/medication');
var Timetable = require('./models/timetable');
var Infusionhistory = require('./models/infusionhistory');
var Device = require('./models/device');
var Ivset = require('./models/ivset');
//subscribing to topic dripo/ on connect
client.on('connect', function() {
    client.subscribe('dripo/#',{ qos: 1 });
});

//function fired on recieving a message from device in topic dripo/
client.on('message', function(topic, message) {
    //spliting the topic to get the device id stored it in id
    var res = topic.split("/");
    var id = res[1];
        //Searching database for device
        Device.find({'divid':id}).exec(function(err,dev){
        //if device is not found no-operations
        if (dev==0){
            // console.log("invalid device!");
        }
        //if device found do this part
        else{ 
        //managing bed req from device and send bed ids of next 5 beds to be infused
        if(res[2]=='bed_req'){
            if(message == "bed"){
                    //search for all the timeids inside station which are not_infused or alerted and sort it in ascending order
                    Timetable.find({'station':dev[0].sname,'userid':dev[0].uid,'infused':{ $in:['not_infused','alerted']}}).sort({time:1}).populate({path:'station',model:'Station'}).exec(function(err,tim){
                    if (err) return console.error(err);
                    //arrange the returned object based on the current time
                    var date=new Date();
                    var hour=date.getHours();
                    var currenttime;
                    //currenttime holds the starting index of array which has the current or upcoming time 
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
                    //spliting the array to before and after current time
                    var prevtime=[];
                    for(var loop2=0;loop2<currenttime;loop2++)
                    {
                        prevtime.push(tim[loop2]);
                    }
                    var upcomingtime=[];
                    for(var loop3=currenttime;loop3<tim.length;loop3++)
                    {
                        upcomingtime.push(tim[loop3]);
                    }
                    //concat the splited array
                    var sorted_wrt_current_time=upcomingtime.concat(prevtime);

                    //stores the bed id in arr_bed
                    var arr_bed=[];
                    for (var key in sorted_wrt_current_time) {
                        arr_bed[key]=sorted_wrt_current_time[key]._bed;

                    }
                    //For removing duplicate bed ids  since the arr_bed has the same bed ids repeated
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
                    //search the bed collection by passing the arr_bed_new array as query
                    Bed.find({'_id': {$in:arr_bed_new}}).populate({path:'_patient',model:'Patient',populate:{path:'_medication',model:'Medication',populate:{path:'_timetable',model:'Timetable'}}}).exec(function(err,bedd){
                    // reordering to sorted order;since this will return the obj as in the order i9n DB, we have to reorder it
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
                    // For publishing Bed Name from database; making it in suitable format to send it to device
                        var pub_bedd=[];
                        for (var key in bed)
                        {
                          pub_bedd.push(bed[key].bname); 
                          pub_bedd.push('&'); 
                          pub_bedd.push(bed[key]._id); 
                          pub_bedd.push('&');  
                        }
                        var pub_bed_slicer=pub_bedd.slice(0,19);
                        var pub_bed=pub_bed_slicer.join('');

                        client.publish('dripo/' + id + '/bed',pub_bed,{ qos: 1, retain: false });

                        });
                });
            }
          }
        //if the device made a med_req handle it and send the medicines in that bed
        else if(res[2]== 'med_req'){
            //the message from the device has the bedid of selected bed
            var bed_id=message.toString();
            //for sending the medicines in the order of their infusion sort it wrt to time
            Timetable.find({'bed':bed_id,'infused':{ $in:['not_infused','alerted']}}).sort({time:1}).populate({path:'_medication',model:'Medication'}).exec(function(err,tim){
                if (err) return console.error(err);
                //returned time objects are in sorted order
                //in the array of object find the index where the current time is
                var date=new Date();
                var hour=date.getHours();
                var currenttime;
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
                    else
                    {
                        currenttime=0;
                        break;
                    }
                }
                //spilt the array into two parts that is before time and after current time
                var prevtime=[];
                for(var loop2=0;loop2<currenttime;loop2++)
                {
                    prevtime.push(tim[loop2]);
                }
                var upcomingtime=[];
                for(var loop3=currenttime;loop3<tim.length;loop3++)
                {
                    upcomingtime.push(tim[loop3]);
                }
                //re-arrange the array according to time
                var sorted_wrt_current_time=upcomingtime.concat(prevtime);

                var arr_med=[];
                for (var key in sorted_wrt_current_time) {
                    arr_med[key]=sorted_wrt_current_time[key]._medication._id;

                }
                //For removing duplicate med ids 
                var arr_med_new=[];
                var n=arr_med.length;
                var count=0;
                for(var c=0;c<n;c++) 
                    { 
                        for(var d=0;d<count;d++) 
                        { 
                            if(arr_med[c].toString()==arr_med_new[d].toString()) 
                                break; 
                        } 
                        if(d==count) 
                        { 
                            arr_med_new[count] = arr_med[c]; 
                            count++; 
                        } 
                    } 
                //search in the medication data base by giving the arr_med_new array as query
                Medication.find({'_id': {$in:arr_med_new}}).exec(function(err,medd){
                    if (err) return console.error(err);
                    var med=[];
                    for (var key in arr_med_new)
                    {
                        for (var key2 in medd)
                        {
                            if(arr_med_new[key].toString()==medd[key2]._id.toString())
                            {
                                med.push(medd[key2])

                            }
                        }

                    }
                    // For publishing Bed Name from database, formating it and sending to device
                        var pub_medd=[];
                        for (var key in med)
                        {
                          pub_medd.push(med[key].name); 
                          pub_medd.push('&'); 
                          pub_medd.push(med[key]._id); 
                          pub_medd.push('&');  
                        }
                        var pub_med=pub_medd.join('');
                        client.publish('dripo/' + id + '/med',pub_med,{ qos: 1, retain: false });

                        });
          }); 

            
        }
        //handles the rate_req from the device
       else if (res[2]== 'rate_req'){
        //message from the device has the medid of selected medicine
          Medication.find({'_id':message}).populate({path:'_bed',model:'Bed',populate:{path:'_patient',model:'Patient'}}).exec(function(err,ratee){
            if (err) return console.error(err);
            //we have to send the corresponding timeid in reply to this
            Timetable.find({'_medication':message,'infused':{ $in:['not_infused','alerted']}}).sort({time:1}).exec(function(err,tim){
            if (err) return console.error(err);
            //compare each tim.time with the current time to send the appropriate timeids
            var date=new Date();
            var hour=date.getHours();
            var timid;
            for(var key in tim)
            {
                if(tim[key].time==hour)
                {
                    timid=tim[key]._id;
                    break;

                }
                else if(tim[key].time==(hour-1))
                {
                    timid=tim[key]._id;
                    break;

                }
                else if(tim[key].time==(hour+1))
                {
                    timid=tim[key]._id;
                    break;

                }
                else
                {
                    timid=tim[0]._id;
                }
            }
            //formating the messages to publish to device
            var rate=ratee[0].rate;
            var mname=ratee[0].name;
            var pname=ratee[0]._bed._patient.name;
            var vol=ratee[0].tvol;
            var alert=30;
            var pub_rate=timid+'&'+pname+'&'+mname+'&'+vol+'&'+rate+'&'+alert+'&';
            client.publish('dripo/' + id + '/rate2set',pub_rate,{ qos: 1, retain: false });
        });
        });
        }
        else if (res[2] == 'req_df') { 
                Medication.find({'_id':message}).exec(function(err,mrate){
                    var mlhr=mrate[0].rate;
                //search and sort all the dfs and stored it in an array
                Ivset.find({'sname':dev[0].sname,'uid':dev[0].uid}).sort({ivdpf:1}).exec(function(err,dfs){
                    if(err){
                        console.log(err);
                    }
                    else{
                        //for sending only relavant dfs the calculations are made based on the device's limitation to detect (upto 300dpm)
                        var df=[];
                        for(var key in dfs)
                        {
                            df[key]=dfs[key].ivdpf;
                        }
                        var maxdf=18000/mlhr;
                        var index=0;
                        for(var key1 in df)
                        {
                            if(df[key1]<=maxdf)
                            {
                                index+=1;
                            }
                        }
                        var rdf=df.slice(0,index);
                        var pub_dff=[];
                        for (var key2 in rdf)
                        {
                          pub_dff.push(rdf[key2]); 
                          pub_dff.push('&'); 
                          pub_dff.push(rdf[key2]); 
                          pub_dff.push('&'); 

                        }
                        var pub_df=pub_dff.join('');
                        //condition to send dfs

                        client.publish('dripo/' + id + '/df',pub_df,{ qos: 1, retain: false });


                    }

                });
            });
                
            }

        }
       }); 
        
    

});
//********************************SOcketio part*********************************************************
//socket.io config
var socket_io    = require( "socket.io" );
var io = socket_io();
app.io = io;
var sys = require('util');
var net = require('net');
//socket io event on connect fires when an socketconnection made from client side
io.sockets.on( "connection", function( socket )
{
    socket.on('join', function(data) {
        //on homepage.js when the page reloads data is send as'retainsend' enables the sockets working even in page reload
        if(data==='retainsend'){
        var client1=mqtt.connect('mqtt://localhost:1883');
        client1.on('connect', function() {
        //subscribe to the dripo  topic to send the message from device to the client(browser) end via websocket 
        client1.subscribe('dripo/#',{ qos: 1 });
        });
        //on reciveing the message check whether the device is there in DB as done before
       client1.on('message', function (topic, payload, packet) {
       var res = topic.split("/");
       var id = res[1];
        Device.find({'divid':id}).exec(function(err,dev){
        if (dev==0){
        }
        //if device is found in DB emit that message to the browser via socket.io
        else{
        //check if the topic is correct #/mon is the topic for monitoring purpose
        if(topic=='dripo/'+ id + '/mon')
        {
            io.sockets.emit('mqtt',{'topic':topic.toString(),'payload':payload.toString()});

        } 
        else
        {
            
        }
        }
        });
        client1.end();
        });

        //console.log(data);
    }
    else{
        //console.log(data);

    }
    });
     // socket connection indicates what mqtt topic to subscribe to in data.topic
    socket.on('subscribe', function (data) {
        //console.log('Subscribing to '+data.topic);
        socket.join(data.topic);
        client.subscribe(data.topic);
    });
     // when socket connection publishes a message, forward that message the the mqtt broker
    socket.on('publish', function (data) {
        //console.log('Publishing to '+data.topic);
        client.publish(data.topic,data.payload,{ qos: 1, retain: true });
    });

});
//This part is the data base operations carried out while montotoring an infusion
// listen to messages coming from the mqtt broker
client.on('message', function (topic, payload, packet) {
     var res = topic.split("/");
    var id = res[1];
        //check the authenticity of the device as before
        Device.find({'divid':id}).exec(function(err,dev){
        if (dev==0){
            //client.publish('dripo/' + id + '/iv',"invalid",{ qos: 1, retain: false );
        }
        else{
        var stationid=dev[0].sname;
        var userid=dev[0].uid;
        var user_name,station_name;
        Account.find({'_id':ObjectId(userid)}).exec(function (err,user) {
            user_name=user[0].username;
        });
        Station.find({'_id':ObjectId(stationid)}).exec(function (err,station) {
            station_name=station[0].sname;
        });
        // console.log(user_name);
        // console.log(station_name);
        //check for the topic and if true; split the message and stores into different variables for ease of operation
        if(topic=='dripo/'+ id + '/mon')
        {
            io.sockets.emit('mqtt',{'topic':topic.toString(),'payload':payload.toString()});
            var message = payload.toString();
            var ress = message.split("-");
            var medid = ress[0];
            var timeid= ress[1];
            var status = ress[2];
            var rateml = ress[3];
            var volinfused = ress[4];
            var remaintime = ress[5];
            var tvol = ress[6];
            var meddpf=ress[7];
            var progress_width = ((volinfused/tvol)*100);
            var infdate= new Date();
            var inftime=(new Date()).getHours()+':'+(new Date()).getMinutes()+':'+(new Date()).getSeconds();
            var dateObj = new Date();
            var month = dateObj.getUTCMonth() + 1; //months from 1-12
            var day = dateObj.getUTCDate();
            var year = dateObj.getUTCFullYear();
            var newdate = day + "/" + month + "/" + year;
            var filenamebeg=day + "-" + month + "-" + year;
            if(status=='start')
            {       
                //on start change timetable status to infusing
                 Timetable.update({_id:timeid},{$set:{infused:"infusing"}},function(err,bed){
                    if(err){console.log(err);}
                    });
                 //code for testlogfile

                 Medication.find({_id:ObjectId(medid)}).exec(function(err,med){
                var medrate=med[0].rate;
                fs.appendFileSync("TestLogfiles/"+"R"+medrate+"_V"+tvol+"_D"+meddpf+"_"+timeid+".txt",'start'+'\n', "UTF-8",{'flags': 'a+'});
                });
                 //create an infusion history collection and add date and time of infusion
                 //checking whether is there already a infusion history file associated with the timetable
                 //*******************review needed**************************************//
                Infusionhistory.find({'_timetable':ObjectId(timeid),'date':newdate}).exec(function(err,inf){
                if (inf==0){
                //if not create a new infusionhistory
                Infusionhistory.collection.update({_timetable:ObjectId(timeid),date:newdate},{$set:{date:newdate,infstarttime:inftime,infdate:infdate,sname:stationid,uid:userid}},{upsert:true});
                Infusionhistory.find({'_timetable':ObjectId(timeid),'date':newdate}).exec(function(err,inff){
                console.log(inff);
                //link that infusion history file with the medication
                Medication.collection.update({_id:ObjectId(medid)},{$push:{_infusionhistory:inff[0]._id}});
                });
                
                //infusion history log file creation
                fs.appendFileSync("Logfiles/"+user_name+"_"+station_name+"_"+filenamebeg+"_"+timeid+".txt",status+","+rateml+","+volinfused+","+remaintime+","+tvol+'\n', "UTF-8",{'flags': 'a+'});
               
                }
            });

            }
            if(status=='infusing')
            {
                //store rate and infusedvolume in db to plot rate vs infusedvol
                Infusionhistory.collection.update({_timetable:ObjectId(timeid),date:newdate},{$push:{plotrate:rateml,plotinfvol:volinfused}});
                fs.appendFileSync("Logfiles/"+user_name+"_"+station_name+"_"+filenamebeg+"_"+timeid+".txt",status+","+rateml+","+volinfused+","+remaintime+","+tvol+'\n', "UTF-8",{'flags': 'a+'});

            }
            if(status=='Empty')
            {    
                //Empty is infusion completion status message; change the infused flag to "infused"
                 Timetable.update({_id:timeid},{$set:{infused:"infused"}},function(err,bed){
                    if(err){console.log(err);}
                    });
                 //add the infusion ending time in infusion history file
                 Infusionhistory.collection.update({_timetable:ObjectId(timeid),date:newdate},{$set:{infendtime:inftime,inftvol:volinfused}});
                 Infusionhistory.collection.update({_timetable:ObjectId(timeid),date:newdate},{$push:{plotrate:rateml,plotinfvol:volinfused}});
                 fs.appendFileSync("Logfiles/"+user_name+"_"+station_name+"_"+filenamebeg+"_"+timeid+".txt",status+","+rateml+","+volinfused+","+remaintime+","+tvol+'\n', "UTF-8",{'flags': 'a+'});


            }  
            if(status=='stop')
            {   
                //checking whether the infusion is below 90% if it is below 90% system assumes that the infusion is not complete and in DB the flag is set from 
                //infusing to not_infused
                //check if medid is there coz empty meassage will be send by client after stop to get rid of retained messages
                if(medid != 0)
                {
                Medication.find({_id:ObjectId(medid)}).exec(function(err,med){
                if(err){console.log("err");}
                var medrate=med[0].rate;
                fs.appendFileSync("TestLogfiles/"+"R"+medrate+"_V"+tvol+"_D"+meddpf+"_"+timeid+".txt",'stop'+'\n', "UTF-8",{'flags': 'a+'});
                });
                if(progress_width<90)
                {
                     Timetable.update({_id:timeid},{$set:{infused:"not_infused"}},function(err,bed){
                    if(err){console.log(err);}
                    }); 

                }
                //if infusion is > 90% the DB set as infused and in infusionhistory file it is recored as the ending time of infusion 
                else
                {
                    Timetable.update({_id:timeid},{$set:{infused:"infused"}},function(err,bed){
                       if(err){console.log(err);}
                      });
                    Infusionhistory.collection.update({_timetable:ObjectId(timeid),date:newdate},{$set:{infendtime:inftime,inftvol:volinfused}});
                    Infusionhistory.collection.update({_timetable:ObjectId(timeid),date:newdate},{$push:{plotrate:rateml,plotinfvol:volinfused}});
                   fs.appendFileSync("Logfiles/"+user_name+"_"+station_name+"_"+filenamebeg+"_"+timeid+".txt",status+","+rateml+","+volinfused+","+remaintime+","+tvol+'\n', "UTF-8",{'flags': 'a+'});

                }
            }
                
            }  
            //the errors are recorded in the infusion history file for future reviewing
            if(status=='Block'||status=='Rate Err')
            {
                Infusionhistory.collection.update({_timetable:ObjectId(timeid),date:newdate},{$push:{inferr:{errtype:status,errtime:inftime}}});
                fs.appendFileSync("Logfiles/"+user_name+"_"+station_name+"_"+filenamebeg+"_"+timeid+".txt",status+","+rateml+","+volinfused+","+remaintime+","+tvol+'\n', "UTF-8",{'flags': 'a+'});

            }
        } 
      
}
});
});
//cron-Job********************************************************************************************************************
//infused and skipped timetable of medicine back to not_infused
cron.schedule('1 0-23 * * *', function(){
  Timetable.find({'infused':{ $in:['infused','skipped']}}).exec(function(err,tim){
    if(err){console.log(err);}
    var time_ids=[];
    for(var key in tim)
    {
        var timediff=tim[key].time-(new Date()).getHours();
        if(timediff == 12||timediff == -12)
        {

            time_ids.push(tim[key]._id);
        }     
    } 
    Timetable.collection.updateMany({'_id': {$in:time_ids}},{$set:{infused:"not_infused"}},function(err,bed){
        if(err){console.log(err);}
    });

  });

});
//In the first min of every hour infused flag of the timetable collection with spresent hour is set to alerted(Red Color in UI)
cron.schedule('1-59 0-23 * * *', function(){
    var date= new Date();
    var hour=date.getHours();
  Timetable.collection.updateMany({'time':hour,'infused':'not_infused'},{$set:{infused:"alerted"}},function(err,tim){
    if(err){console.log(err);}
  });
});

//Skip Infusions which are alerted and not infused
cron.schedule('1 0-23 * * *', function(){
    var date= new Date();
    var hour;
    if(date.getHours()===0)
    {
        hour=23;
    }
    else
    {
        hour=date.getHours()-1;
    }
  Timetable.collection.updateMany({'time':hour,'infused':'alerted'},{$set:{infused:"skipped"}},function(err,tim){
    if(err){console.log(err);}
  });
});
//test log code***********************************************************************************************************
client.on('message', function(topic, message) {
    var res = topic.split("/");
    var id = res[1];
    var purpose=res[2];
    if(purpose=='log')
    {            
        var msg = message.toString();
        var ress = msg.split("-");
        var medid = ress[0];
        var timeid = ress[1];
        var meddpf=ress[2];
        var dcount=ress[3];
        var etime=ress[4];
        var srate=ress[5];
        var ivol=ress[6];
        var time=(new Date()).getHours()+':'+(new Date()).getMinutes()+':'+(new Date()).getSeconds()+':'+(new Date()).getMilliseconds();
        if(medid != 0)
        {
        Medication.find({_id:medid}).exec(function(err,med){
        if(err){console.log(err);}
        var medname=med[0].name;
        var medrate=med[0].rate;
        var medtvol=med[0].tvol;
        fs.appendFileSync("TestLogfiles/"+"R"+medrate+"_V"+medtvol+"_D"+meddpf+"_"+timeid+".txt",time+','+ dcount+','+etime+','+srate+','+ivol+'\n', "UTF-8",{'flags': 'a+'});
        });
        }
    }

});
module.exports = app;
