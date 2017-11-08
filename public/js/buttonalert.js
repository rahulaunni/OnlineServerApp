$(document).ready(function(){
$(function() {   
var socket = io.connect('http://localhost');
      socket.on('connect', function(data) {
       socket.on('mqtt_button', function(msg) {
                 var button = msg.topic.split("/");
                 var id = button[1];
                if(msg.topic=='aavo/'+ id + '/alert')
                {
                	
                		if($(".leftbar .iconhome").hasClass("activem"))
                		{

                		}
                		else{
                						$.ajax({
                								type: 'GET',
                		                        url: '/buttonidtopurpose?buttonid='+id,						
                		                        success: function(res) {
                                                    var obj = JSON.parse(res);
                                                    var bedname=obj.bedname;
                                                    var purpose=obj.purpose;
                		                        $.notify({
                		                        	// options
                		                        	icon: 'glyphicon glyphicon-warning-sign',
                		                        	title: 'Caution',
                		                        	message: 'Patient in '+bedname+' need '+purpose,
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
            });
   });
  });

});