$(function() {   
var socket = io.connect('http://localhost');
      socket.on('connect', function(data) {
       socket.on('mqtt', function(msg) {
               // console.log(msg.topic+' '+msg.payload);
                 var dev = msg.topic.split("/");
                 var id = dev[1];
                if(msg.topic=='dripo/'+ id + '/mon')
                {
                	var message = msg.payload;
                	var res = message.split("-");
                	var medid = res[0];
                    var timeid = res[1];
                	var status = res[2];
                	var rateml = res[3];
                	var volinfused = res[4];
                	var remaintime = res[5];
                	var tvol = res[6];
                	var progress_width = ((volinfused/tvol)*100);
                    var progress_width_int=Math.trunc(progress_width);
                	if(status=='start')
                	{
                		$('#'+medid).addClass("displaydis");
                		$('#'+medid+'copy').removeClass("displaydis");
                        $('#'+medid+'percent').removeClass("displaydis");
                        $('#'+medid+'details').removeClass("displaydis");
                        $('#'+medid+'details-rate').html(rateml);
                        $('#'+medid+'details-volume').html(volinfused);
                        $('#'+medid+'details-time').html(remaintime);
                		$('#'+medid+'copy').addClass("displayen");
                        $('#'+medid+'copy2').removeClass("displaydis");
                	    $('#'+medid+'copy2').removeClass("progress-bar-danger");
                	    $('#'+medid+'copy2').removeClass("progress-bar-success");
                	    $('#'+medid+'copy2').removeClass("progress-bar-warning");
                		$('#'+medid+'copy2').css("width",progress_width+'%');
                        $('#'+medid+'copy3').html(progress_width_int+'%');
                        $('#'+medid+'ack').addClass("displaydis");
                        $('#'+medid+'details-ratediv').removeClass("backgroundRed");
                        $('#'+medid+'details-timediv').removeClass("backgroundRed");



                	}
                	else if(status=='infusing')
                	{    
                		$('#'+medid).addClass("displaydis");
                		$('#'+medid+'copy').removeClass("displaydis");
                        $('#'+medid+'percent').removeClass("displaydis");
                        $('#'+medid+'details').removeClass("displaydis");
                        $('#'+medid+'details-rate').html(rateml);
                        $('#'+medid+'details-volume').html(volinfused);
                        $('#'+medid+'details-time').html(remaintime);
                        $('#'+medid+'copy2').removeClass("displaydis");
                		$('#'+medid+'copy2').removeClass("progress-bar-danger");
                		$('#'+medid+'copy2').css("width",progress_width+'%');
                		$('#'+medid+'copy3').html(progress_width_int+'%');
                        $('#'+medid+'ack').addClass("displaydis");
                        $('#'+medid+'details-ratediv').removeClass("backgroundRed");
                        $('#'+medid+'details-timediv').removeClass("backgroundRed");
                		if(progress_width >90)
                		{
                			$('#'+medid+'copy2').addClass("progress-bar-warning");

                		}
                		if(progress_width==100){
                			$('#'+medid+'copy2').removeClass("progress-bar-warning");
                			$('#'+medid+'copy2').addClass("progress-bar-success");
                		}
                		//add code to display info

                	}
                	else if(status=='stop')
                	{

                		$('#'+medid+'copy').addClass("displaydis");
                        $('#'+medid+'percent').addClass("displaydis");
                        $('#'+medid+'details').addClass("displaydis");
                        $('#'+medid+'ack').addClass("displaydis");
                        $('#'+medid+'copy2').addClass("displaydis");
                        $('#'+medid).removeClass("displaydis");
                        socket.emit('publish', {topic:msg.topic,payload:""});

                	}
                	else if(status=='Block')
                	{
                		$('#'+medid).addClass("displaydis");
                		$('#'+medid+'copy').removeClass("displaydis");
                		$('#'+medid+'copy2').removeClass("progress-bar-info");
                        $('#'+medid+'percent').removeClass("displaydis");
                        $('#'+medid+'copy2').removeClass("progress-bar-warning");
                        $('#'+medid+'copy2').css("width",progress_width+'%');
                        $('#'+medid+'copy2').addClass("progress-bar-danger");
                        $('#'+medid+'copy3').html(progress_width_int+'%');
                        $('#'+medid+'details').addClass("displaydis");
                        $('#'+medid+'ack').removeClass("displaydis");
                        $('#'+medid+'ack-errtype').html(status);
                        $('#'+medid+'details-ratediv').removeClass("backgroundRed");
                        $('#'+medid+'ack-btn').submit(function(e){
                        e.preventDefault();
                        console.log("ok");
                        socket.emit('publish', {topic:msg.topic,payload:medid+'-'+timeid+'-'+'errackclicked'+'-'+rateml+'-'+volinfused+'-'+remaintime+'-'+tvol});
                        return false; 
                         });



                	}
					else if(status=='Empty')
                	{
                		$('#'+medid).addClass("displaydis");
                		$('#'+medid+'copy').removeClass("displaydis");
                		$('#'+medid+'copy2').removeClass("progress-bar-info");
                        $('#'+medid+'percent').removeClass("displaydis");
                        $('#'+medid+'copy2').removeClass("progress-bar-warning");
                        $('#'+medid+'copy2').css("width",progress_width+'%');
                        $('#'+medid+'copy2').addClass("progress-bar-success");
                        $('#'+medid+'copy3').html(progress_width_int+'%');
                        $('#'+medid+'details').addClass("displaydis");
                        $('#'+medid+'ack').removeClass("displaydis");
                        $('#'+medid+'ack-errtype').html(status);
                        $('#'+medid+'details-ratediv').removeClass("backgroundRed");
                        $('#'+medid+'details-ratediv').removeClass("backgroundRed");

                        $('#'+medid+'ack-btn').click(function(){
                        $('#'+medid+'copy').addClass("displaydis");
                        $('#'+medid+'ack').addClass("displaydis");
                        $('#'+medid).removeClass("displaydis");
                        $('#'+medid+'percent').addClass("displaydis");
                        socket.emit('publish', {topic:msg.topic,payload:""});
                         });


                	}
                	else if(status=='Rate Err')
                	{
                		$('#'+medid).addClass("displaydis");
                		$('#'+medid+'copy').removeClass("displaydis");
                		$('#'+medid+'copy2').removeClass("progress-bar-info");
                        $('#'+medid+'percent').removeClass("displaydis");
                        $('#'+medid+'copy2').removeClass("progress-bar-warning");
                        $('#'+medid+'copy2').css("width",progress_width+'%');
                        $('#'+medid+'copy2').addClass("progress-bar-danger");
                        $('#'+medid+'copy3').html(progress_width_int+'%');
                        $('#'+medid+'details').addClass("displaydis");
                        $('#'+medid+'ack').removeClass("displaydis");
                        $('#'+medid+'ack-errtype').html(status);
                        $('#'+medid+'details-ratediv').removeClass("backgroundRed");
                        $('#'+medid+'ack-btn').click(function(){
                        socket.emit('publish', {topic:msg.topic,payload:medid+'-'+timeid+'-'+'errackclicked'+'-'+rateml+'-'+volinfused+'-'+remaintime+'-'+tvol});
                         });


                	}

					else if(status=='Complete')
                	{
                		$('#'+medid).addClass("displaydis");
                		$('#'+medid+'copy').removeClass("displaydis");
                		$('#'+medid+'copy2').removeClass("progress-bar-info");
                        $('#'+medid+'percent').removeClass("displaydis");
                        $('#'+medid+'copy2').removeClass("progress-bar-warning");
                        $('#'+medid+'copy2').css("width",progress_width+'%');
                        $('#'+medid+'copy2').addClass("progress-bar-warning");
                        $('#'+medid+'copy3').html(progress_width_int+'%');
                        $('#'+medid+'details').addClass("displaydis");
                        $('#'+medid+'ack').removeClass("displaydis");
                        $('#'+medid+'details-ratediv').removeClass("backgroundRed");
                        $('#'+medid+'ack-btn').click(function(){
                        socket.emit('publish', {topic:msg.topic,payload:medid+'-'+timeid+'-'+'cmpltackclicked'+'-'+rateml+'-'+volinfused+'-'+remaintime+'-'+tvol});
                         });

                	}
					else if(status=='Block_ACK')
                	{
                		$('#'+medid).addClass("displaydis");
                		$('#'+medid+'copy').removeClass("displaydis");
                		$('#'+medid+'copy2').removeClass("progress-bar-info");
                        $('#'+medid+'percent').removeClass("displaydis");
                        $('#'+medid+'details').removeClass("displaydis");
                        $('#'+medid+'copy2').removeClass("progress-bar-warning");
                        $('#'+medid+'copy2').css("width",progress_width+'%');
                        $('#'+medid+'copy2').addClass("progress-bar-danger");
                        $('#'+medid+'copy3').html(progress_width_int+'%');
                        $('#'+medid+'details').addClass("displaydis");
                        $('#'+medid+'ack').removeClass("displaydis");
                        $('#'+medid+'ack-errtype').html(status);


                	}
					else if(status=='Empty_ACK')
                	{
                		$('#'+medid).addClass("displaydis");
                		$('#'+medid+'copy').removeClass("displaydis");
                		$('#'+medid+'copy2').removeClass("progress-bar-info");
                        $('#'+medid+'percent').removeClass("displaydis");
                        $('#'+medid+'details').removeClass("displaydis");
                        $('#'+medid+'copy2').removeClass("progress-bar-warning");
                        $('#'+medid+'copy2').css("width",progress_width+'%');
                        $('#'+medid+'copy2').addClass("progress-bar-danger");
                        $('#'+medid+'copy3').html(progress_width_int+'%');
                        $('#'+medid+'details').addClass("displaydis");
                        $('#'+medid+'ack').removeClass("displaydis");
                        $('#'+medid+'ack-errtype').html(status);


                	}
                	else if(status=='Rate Err_ACK')
                	{
                		$('#'+medid).addClass("displaydis");
                		$('#'+medid+'copy').removeClass("displaydis");
                		$('#'+medid+'copy2').removeClass("progress-bar-info");
                        $('#'+medid+'percent').removeClass("displaydis");
                        $('#'+medid+'details').removeClass("displaydis");
                        $('#'+medid+'copy2').removeClass("progress-bar-warning");
                        $('#'+medid+'copy2').css("width",progress_width+'%');
                        $('#'+medid+'copy2').addClass("progress-bar-danger");
                        $('#'+medid+'copy3').html(progress_width_int+'%');
                        $('#'+medid+'details').addClass("displaydis");
                        $('#'+medid+'ack').removeClass("displaydis");
                        $('#'+medid+'ack-errtype').html(status);


                	}

					else if(status=='Complete_ACK')
                	{
                		$('#'+medid).addClass("displaydis");
                		$('#'+medid+'copy').removeClass("displaydis");
                		$('#'+medid+'copy2').removeClass("progress-bar-info");
                        $('#'+medid+'percent').removeClass("displaydis");
                        $('#'+medid+'copy2').removeClass("progress-bar-warning");
                        $('#'+medid+'copy2').css("width",progress_width+'%');
                        $('#'+medid+'copy2').addClass("progress-bar-success");
                        $('#'+medid+'copy3').html(progress_width_int+'%');
                        $('#'+medid+'details').addClass("displaydis");
                        $('#'+medid+'ack').removeClass("displaydis");
                        $('#'+medid+'ack-errtype').html(status);


                	}
                    else if(status=='errackclicked')
                    {
                                $('#'+medid).addClass("displaydis");
                                $('#'+medid+'copy').removeClass("displaydis");
                                $('#'+medid+'percent').removeClass("displaydis");
                                $('#'+medid+'details').removeClass("displaydis");
                                $('#'+medid+'details-rate').html(rateml);
                                $('#'+medid+'details-volume').html(volinfused);
                                $('#'+medid+'details-time').html(remaintime);
                                $('#'+medid+'copy2').removeClass("progress-bar-danger");
                                $('#'+medid+'copy2').css("width",progress_width+'%');
                                $('#'+medid+'copy3').html(progress_width_int+'%');
                                $('#'+medid+'ack').addClass("displaydis");
                                $('#'+medid+'details-ratediv').addClass("backgroundRed");
                                if(progress_width >90)
                                {
                                    $('#'+medid+'copy2').addClass("progress-bar-warning");

                                }
                                if(progress_width==100){
                                    $('#'+medid+'copy2').removeClass("progress-bar-warning");
                                    $('#'+medid+'copy2').addClass("progress-bar-success");
                                }


                    }
                    else if(status=='cmpltackclicked')
                    {
                                $('#'+medid).addClass("displaydis");
                                $('#'+medid+'copy').removeClass("displaydis");
                                $('#'+medid+'percent').removeClass("displaydis");
                                $('#'+medid+'details').removeClass("displaydis");
                                $('#'+medid+'details-rate').html(rateml);
                                $('#'+medid+'details-volume').html(volinfused);
                                $('#'+medid+'details-time').html(remaintime);
                                $('#'+medid+'copy2').removeClass("progress-bar-danger");
                                $('#'+medid+'copy2').css("width",progress_width+'%');
                                $('#'+medid+'copy3').html(progress_width_int+'%');
                                $('#'+medid+'ack').addClass("displaydis");
                                $('#'+medid+'details-timediv').addClass("backgroundRed");
                                if(progress_width >90)
                                {
                                    $('#'+medid+'copy2').addClass("progress-bar-warning");

                                }
                                if(progress_width==100){
                                    $('#'+medid+'copy2').removeClass("progress-bar-warning");
                                    $('#'+medid+'copy2').addClass("progress-bar-success");
                                }


                    }
                    
               }
               
                });

        socket.emit('join', 'retainsend');

      }); 

});

