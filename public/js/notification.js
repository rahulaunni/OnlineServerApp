$(document).ready(function(){
	console.log($(".activehome").length);

$(function() {   
var socket = io.connect('http://localhost');
      socket.on('connect', function(data) {
       socket.on('mqtt', function(msg) {
               console.log(msg.topic+' '+msg.payload);
                 var dev = msg.topic.split("/");
                 var id = dev[1];
                if(msg.topic=='dripo/'+ id + '/mon')
                {
                	var message = msg.payload;
                	var ress = message.split("-");
                	var medid = ress[0];
                	var status = ress[2];
                	if(status=='Block'||status=='Rate Err'||status=='Complete'||status=='Empty')
                	{
                		if($(".leftbar .iconhome").hasClass("activem"))
                		{
                			console.log("nothing");
                		}
                		else{
                						$.ajax({
                								type: 'GET',
                		                        url: '/medtobed?medid='+medid,						
                		                        success: function(res) {
                		                        	console.log(res);
                		                        $.notify({
                		                        	// options
                		                        	icon: 'glyphicon glyphicon-warning-sign',
                		                        	title: 'Caution',
                		                        	message: status + ' alert in bed '+res,
                		                        	url: '/',
                		                        	target: '_self'
                		                        },{
                		                        	// settings
                		                        	element: 'body',
                		                        	position: null,
                		                        	type: "danger",
                		                        	allow_dismiss: true,
                		                        	newest_on_top: true,
                		                        	showProgressbar: false,
                		                        	placement: {
                		                        		from: "top",
                		                        		align: "right"
                		                        	},
                		                        	offset: 20,
                		                        	spacing: 10,
                		                        	z_index: 1031,
                		                        	delay: 500000,
                		                        	timer: 1000,
                		                        	url_target: '_blank',
                		                        	mouse_over: null,
                		                        	animate: {
                		                        		enter: 'animated fadeInDown',
                		                        		// exit: 'animated fadeOutUp'
                		                        	},
                		                        	onShow: null,
                		                        	onShown: null,
                		                        	onClose: null,
                		                        	onClosed: null,
                		                        	icon_type: 'class',
                		                        	template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0}" role="alert">' +
                		                        		'<button type="button" aria-hidden="true" class="close" id="notclose" data-notify="dismiss">×</button>' +
                		                        		'<span data-notify="icon"></span> ' +
                		                        		'<span data-notify="title">{1}</span> ' +
                		                        		'<span data-notify="message"><strong><b>{2}</b></strong></span>' +
                		                        		'<div class="progress" data-notify="progressbar">' +
                		                        			'<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
                		                        		'</div>' +
                		                        		'<a href="{3}" target="{4}" data-notify="url"></a>' +
                		                        	'</div>' 
                		                        });


                		                        }

                		                    });

                	
                						}

                		

                	}

                }
            });
   });
  });

});
//infusion alert for user if they using other page 
window.setInterval(function(){ // Set interval for checking
     var date = new Date(); // Create a Date object to find out what time it is
    if(date.getMinutes() >55){ 
    if($(".leftbar .iconhome").hasClass("activem"))
                        {
                            console.log("nothing");
                        }
                        else
                        {
                                            $.ajax({
                                                    type: 'GET',
                                                    url: '/infusionalert',                      
                                                    success: function(res) {
                                                        console.log(res);
                                                    if(res=='alert')
                                                    $.notify({
                                                        // options
                                                        icon: 'glyphicon glyphicon-warning-sign',
                                                        title: 'Caution',
                                                        message: 'You have an Upcoming Infusion. Please Visit Home Page',
                                                        url: '/',
                                                        target: '_self'
                                                    },{
                                                        // settings
                                                        element: 'body',
                                                        position: null,
                                                        type: "danger",
                                                        allow_dismiss: true,
                                                        newest_on_top: true,
                                                        showProgressbar: false,
                                                        placement: {
                                                            from: "top",
                                                            align: "right"
                                                        },
                                                        offset: 20,
                                                        spacing: 10,
                                                        z_index: 1031,
                                                        delay: 500000,
                                                        timer: 1000,
                                                        url_target: '_blank',
                                                        mouse_over: null,
                                                        animate: {
                                                            enter: 'animated fadeInDown',
                                                            // exit: 'animated fadeOutUp'
                                                        },
                                                        onShow: null,
                                                        onShown: null,
                                                        onClose: null,
                                                        onClosed: null,
                                                        icon_type: 'class',
                                                        template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0}" role="alert">' +
                                                            '<button type="button" aria-hidden="true" class="close" id="notclose" data-notify="dismiss">×</button>' +
                                                            '<span data-notify="icon"></span> ' +
                                                            '<span data-notify="title">{1}</span> ' +
                                                            '<span data-notify="message"><strong><b>{2}</b></strong></span>' +
                                                            '<div class="progress" data-notify="progressbar">' +
                                                                '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
                                                            '</div>' +
                                                            '<a href="{3}" target="{4}" data-notify="url"></a>' +
                                                        '</div>' 
                                                    });


                                                    }

                                                });

                            
                        }
       }                 

},60000);