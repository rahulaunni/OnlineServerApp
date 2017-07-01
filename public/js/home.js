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
                	var res = message.split("-");
                	var medid = res[0];
                	var status = res[2];
                	var rateml = res[3];
                	var volinfused = res[4];
                	var remaintime = res[5];
                	var tvol = res[6];
                	var progress_width = ((volinfused/tvol)*100);
                	//console.log(progress_width);
                	if(status=='start')
                	{
                		$('#'+medid).addClass("displaydis");
                		$('#'+medid+'copy').removeClass("displaydis");
                		$('#'+medid+'copy').addClass("displayen");
                	    $('#'+medid+'copy2').removeClass("progress-bar-danger");
                	    $('#'+medid+'copy2').removeClass("progress-bar-success");
                	    $('#'+medid+'copy2').removeClass("progress-bar-warning");
                		$('#'+medid+'copy2').css("width",progress_width+'%');
                        $('#'+medid+'copy3').html(progress_width+'%');
                		//add code to diplay information

                	}
                	else if(status=='infusing')
                	{    
                		$('#'+medid).addClass("displaydis");
                		$('#'+medid+'copy').removeClass("displaydis");
                		$('#'+medid+'copy2').removeClass("progress-bar-danger");
                		$('#'+medid+'copy2').css("width",progress_width+'%');
                		$('#'+medid+'copy3').html(progress_width+'%');
                		if(progress_width >90)
                		{
                			$('#'+medid+'copy2').removeClass("progress-bar-info");
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

                		$('#'+medid).addClass("displaydis");
                		$('#'+medid+'copy').removeClass("displaydis");
                		$('#'+medid+'copy2').css("width",progress_width+'%');
                		$('#'+medid+'copy3').html(progress_width+'%');
                		if(progress_width >95)
                		{
                			$('#'+medid+'copy2').removeClass("progress-bar-warning");
                			$('#'+medid+'copy2').addClass("progress-bar-success");

                		}
                		//add code to display info

                	}
                	else if(status=='Block')
                	{
                		$('#'+medid).addClass("displaydis");
                		$('#'+medid+'copy').removeClass("displaydis");
                		$('#'+medid+'copy2').removeClass("progress-bar-info");
                        $('#'+medid+'copy2').removeClass("progress-bar-warning");
                        $('#'+medid+'copy2').css("width",progress_width+'%');
                        $('#'+medid+'copy2').addClass("progress-bar-danger");
                        $('#'+medid+'copy3').html(progress_width+'%');
                	}
					else if(status=='Empty')
                	{
                		$('#'+medid).addClass("displaydis");
                		$('#'+medid+'copy').removeClass("displaydis");
                		$('#'+medid+'copy2').removeClass("progress-bar-info");
                        $('#'+medid+'copy2').removeClass("progress-bar-warning");
                        $('#'+medid+'copy2').css("width",progress_width+'%');
                        $('#'+medid+'copy2').addClass("progress-bar-danger");
                        $('#'+medid+'copy3').html(progress_width+'%');

                	}
                	else if(status=='Rate Err')
                	{
                		$('#'+medid).addClass("displaydis");
                		$('#'+medid+'copy').removeClass("displaydis");
                		$('#'+medid+'copy2').removeClass("progress-bar-info");
                        $('#'+medid+'copy2').removeClass("progress-bar-warning");
                        $('#'+medid+'copy2').css("width",progress_width+'%');
                        $('#'+medid+'copy2').addClass("progress-bar-danger");
                        $('#'+medid+'copy3').html(progress_width+'%');

                	}

					else if(status=='Complete')
                	{
                		$('#'+medid).addClass("displaydis");
                		$('#'+medid+'copy').removeClass("displaydis");
                		$('#'+medid+'copy2').removeClass("progress-bar-info");
                        $('#'+medid+'copy2').removeClass("progress-bar-warning");
                        $('#'+medid+'copy2').css("width",progress_width+'%');
                        $('#'+medid+'copy2').addClass("progress-bar-success");
                        $('#'+medid+'copy3').html(progress_width+'%');

                	}
					else if(status=='Block_ACK')
                	{
                		$('#'+medid).addClass("displaydis");
                		$('#'+medid+'copy').removeClass("displaydis");
                		$('#'+medid+'copy2').removeClass("progress-bar-info");
                        $('#'+medid+'copy2').removeClass("progress-bar-warning");
                        $('#'+medid+'copy2').css("width",progress_width+'%');
                        $('#'+medid+'copy2').addClass("progress-bar-danger");
                        $('#'+medid+'copy3').html(progress_width+'%');

                	}
					else if(status=='Empty_ACK')
                	{
                		$('#'+medid).addClass("displaydis");
                		$('#'+medid+'copy').removeClass("displaydis");
                		$('#'+medid+'copy2').removeClass("progress-bar-info");
                        $('#'+medid+'copy2').removeClass("progress-bar-warning");
                        $('#'+medid+'copy2').css("width",progress_width+'%');
                        $('#'+medid+'copy2').addClass("progress-bar-danger");
                        $('#'+medid+'copy3').html(progress_width+'%');

                	}
                	else if(status=='Rate Err_ACK')
                	{
                		$('#'+medid).addClass("displaydis");
                		$('#'+medid+'copy').removeClass("displaydis");
                		$('#'+medid+'copy2').removeClass("progress-bar-info");
                        $('#'+medid+'copy2').removeClass("progress-bar-warning");
                        $('#'+medid+'copy2').css("width",progress_width+'%');
                        $('#'+medid+'copy2').addClass("progress-bar-danger");
                        $('#'+medid+'copy3').html(progress_width+'%');

                	}

					else if(status=='Complete_ACK')
                	{
                		$('#'+medid).addClass("displaydis");
                		$('#'+medid+'copy').removeClass("displaydis");
                		$('#'+medid+'copy2').removeClass("progress-bar-info");
                        $('#'+medid+'copy2').removeClass("progress-bar-warning");
                        $('#'+medid+'copy2').css("width",progress_width+'%');
                        $('#'+medid+'copy2').addClass("progress-bar-success");
                        $('#'+medid+'copy3').html(progress_width+'%');

                	}
               }
                });

        socket.emit('join', 'retainsend');

      }); 

});

