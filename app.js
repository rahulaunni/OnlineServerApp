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
mongoose.connect('mongodb://localhost/dripov2',{ server: {reconnectTries:30,reconnectInterval:10000} }, function(error) {
    if(error)
    {   
        
        console.log("mongodb connection failed");
    }
    else
    {
        console.log("mongodb connection success");
    }
});
app.use(session({secret: "Shhsssh"}));

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

var mqtt = require('mqtt')
var client = mqtt.connect('mqtt://localhost:1883')
var Station = require('./models/stations');
var Account = require('./models/account');
var Bed = require('./models/bed');
var Patient = require('./models/patient');
var Medication = require('./models/medication');
var Timetable = require('./models/timetable');
var Device = require('./models/device')
var Ivset = require('./models/ivset')

client.on('connect', function() {
    console.log("started");
    client.subscribe('dripo/#',{ qos: 1 });
});


client.on('message', function(topic, message) {

    var res = topic.split("/");
    var id = res[1];
        Device.find({'divid':id}).exec(function(err,dev){
        if (dev==0){
            console.log(dev);
            //client.publish('dripo/' + id + '/iv',"invalid",{ qos: 1, retain: false );
        }
        else{ 
        if(res[2]=='bed_req'){
            if(message == "bed"){
                    Timetable.find({'station':dev[0].sname,'userid':dev[0].uid}).sort({time:1}).populate({path:'station',model:'Station'}).exec(function(err,tim){
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
                    // For publishing Bed Name from database
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
        else if(res[2]== 'med_req'){
            var bed_id=message.toString();
            Timetable.find({'bed':bed_id,'infused':'not_infused'}).sort({time:1}).populate({path:'_medication',model:'Medication'}).exec(function(err,tim){
                if (err) return console.error(err);
                var arr_med=[];
                for (var key in tim) {
                    arr_med[key]=tim[key]._medication._id;

                }
                var arr_med_new=[];
                var n=arr_med.length;
                var count=0;
                for(var c=0;c<n;c++) //For removing duplicate bed ids 
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
                    // For publishing Bed Name from database
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

       else if (res[2]== 'rate_req'){
          Medication.find({'_id':message}).populate({path:'_bed',model:'Bed',populate:{path:'_patient',model:'Patient'}}).exec(function(err,ratee){
            if (err) return console.error(err);
            var rate=ratee[0].rate;
            var mname=ratee[0].name;
            var pname=ratee[0]._bed._patient.name;
            var vol=100;
            var alert=30;
            var pub_rate=pname+'&'+mname+'&'+vol+'&'+rate+'&'+alert+'&';
            console.log(pub_rate);
            client.publish('dripo/' + id + '/rate2set',pub_rate,{ qos: 1, retain: false });
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
                        //for sending only relavant dfs
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
//socket.io config
var socket_io    = require( "socket.io" );
var io = socket_io();
app.io = io;
// socket.io events
io.on( "connection", function( socket )
{
    console.log( "A user connected" );
});

module.exports = app;
