$(function() {   
var socket = io.connect('wss://localhost');
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
                        $('#'+medid+'ack').addClass("displaydis");
                        $('#'+medid+'progressbar').removeClass("progress-bar-danger");
                        $('#'+medid).parent().parent().parent().children('.del').children('.patrmv').attr("disabled","disabled");
                        $('#'+medid).parent().parent().parent().children('.del').children('.patedit').attr("disabled","disabled");

                		$('#'+medid+'progressbardiv').removeClass("displaydis");
                        $('#'+medid+'percent').removeClass("displaydis");
                        $('#'+medid+'details').removeClass("displaydis");
                        $('#'+medid+'details-rate').html(rateml);
                        $('#'+medid+'details-volume').html(volinfused);
                        $('#'+medid+'details-time').html(remaintime);
                        $('#'+medid+'progressbar').removeClass("displaydis");
                		$('#'+medid+'progressbar').css("width",progress_width+'%');
                        $('#'+medid+'percentage').html(progress_width_int+'%');
                        $('#'+medid+'details-ratediv').removeClass("backgroundRed");
                        $('#'+medid+'details-timediv').removeClass("backgroundRed");
                        if(progress_width >90)
                        {
                            $('#'+medid+'progressbar').addClass("progress-bar-warning");

                        }
                        if(progress_width==100){
                            $('#'+medid+'progressbar').removeClass("progress-bar-warning");
                            $('#'+medid+'progressbar').addClass("progress-bar-success");
                        }



                	}
                	else if(status=='infusing')
                	{    
                		$('#'+medid).addClass("displaydis");
                        $('#'+medid+'ack').addClass("displaydis");
                		$('#'+medid+'progressbardiv').removeClass("displaydis");
                        $('#'+medid+'percent').removeClass("displaydis");
                        $('#'+medid+'details').removeClass("displaydis");
                        $('#'+medid+'details-rate').html(rateml);
                        $('#'+medid+'details-volume').html(volinfused);
                        $('#'+medid+'details-time').html(remaintime);
                        $('#'+medid+'progressbar').removeClass("displaydis");
                		$('#'+medid+'progressbar').removeClass("progress-bar-danger");
                		$('#'+medid+'progressbar').css("width",progress_width+'%');
                		$('#'+medid+'percentage').html(progress_width_int+'%');
                        $('#'+medid+'details-ratediv').removeClass("backgroundRed");
                        $('#'+medid+'details-timediv').removeClass("backgroundRed");
                		if(progress_width >90)
                		{
                			$('#'+medid+'progressbar').addClass("progress-bar-warning");

                		}
                		if(progress_width==100){
                			$('#'+medid+'progressbar').removeClass("progress-bar-warning");
                			$('#'+medid+'progressbar').addClass("progress-bar-success");
                		}
                		//add code to display info

                	}
                	else if(status=='stop')
                	{

                		$('#'+medid+'progressbardiv').addClass("displaydis");
                        $('#'+medid+'percent').addClass("displaydis");
                        $('#'+medid+'details').addClass("displaydis");
                        $('#'+medid+'ack').addClass("displaydis");
                        $('#'+medid+'progressbar').addClass("displaydis");
                        $('#'+medid).removeClass("displaydis");
                        socket.emit('publish', {topic:msg.topic,payload:""});
                        $('#'+medid).parent().parent().parent().children('.del').children('.patrmv').attr("disabled","enabled");
                        $('#'+medid).parent().parent().parent().children('.del').children('.patedit').attr("disabled","enabled");

                        if(progress_width>95)
                        {
                            $('#'+timeid).removeClass("not_infused");
                            $('#'+timeid).addClass("infused");

  
                        }
                        if(progress_width<95)
                        {
                          $('#'+timeid).removeClass("infusing");
                            $('#'+timeid).addClass("not_infused");  
                        }


                	}
                	else if(status=='Block')
                	{
                		$('#'+medid).addClass("displaydis");
                		$('#'+medid+'progressbardiv').removeClass("displaydis");
                		$('#'+medid+'progressbar').removeClass("progress-bar-info");
                        $('#'+medid+'percent').removeClass("displaydis");
                        $('#'+medid+'progressbar').removeClass("progress-bar-warning");
                        $('#'+medid+'progressbar').css("width",progress_width+'%');
                        $('#'+medid+'progressbar').addClass("progress-bar-danger");
                        $('#'+medid+'percentage').html(progress_width_int+'%');
                        $('#'+medid+'details').addClass("displaydis");
                        $('#'+medid+'ack').removeClass("displaydis");
                        $('#'+medid+'ack-errtype').html(status);
                        $('#'+medid+'details-ratediv').removeClass("backgroundRed");
            
                        $('#'+medid+'ack-btn').unbind().on("click", function(){
                        console.log("ok");
                        socket.emit('publish', {topic:msg.topic,payload:medid+'-'+timeid+'-'+'errackclicked'+'-'+rateml+'-'+volinfused+'-'+remaintime+'-'+tvol});
                         });



                	}
					else if(status=='Empty')
                	{
                		$('#'+medid).addClass("displaydis");
                		$('#'+medid+'progressbardiv').removeClass("displaydis");
                		$('#'+medid+'progressbar').removeClass("progress-bar-info");
                        $('#'+medid+'percent').removeClass("displaydis");
                        $('#'+medid+'progressbar').removeClass("progress-bar-warning");
                        $('#'+medid+'progressbar').css("width",progress_width+'%');
                        $('#'+medid+'progressbar').addClass("progress-bar-success");
                        $('#'+medid+'percentage').html(progress_width_int+'%');
                        $('#'+medid+'details').addClass("displaydis");
                        $('#'+medid+'ack').removeClass("displaydis");
                        $('#'+medid+'ack-errtype').html(status);
                        $('#'+medid+'details-ratediv').removeClass("backgroundRed");
                        $('#'+medid+'details-ratediv').removeClass("backgroundRed");
                        
                        $('#'+medid+'ack-btn').unbind().on("click", function(){
                        $('#'+medid).parent().parent().parent().children('.del').children('.patrmv').attr("disabled","enabled");
                        $('#'+medid).parent().parent().parent().children('.del').children('.patedit').attr("disabled","enabled");

                        $('#'+medid+'progressbardiv').addClass("displaydis");
                        $('#'+medid+'ack').addClass("displaydis");
                        $('#'+medid).removeClass("displaydis");
                        $('#'+medid+'percent').addClass("displaydis");
                        $('#'+timeid).removeClass("not_infused");
                        $('#'+timeid).addClass("infused");
                        socket.emit('publish', {topic:msg.topic,payload:""});
                         });


                	}
                	else if(status=='Rate Err')
                	{
                		$('#'+medid).addClass("displaydis");
                		$('#'+medid+'progressbardiv').removeClass("displaydis");
                		$('#'+medid+'progressbar').removeClass("progress-bar-info");
                        $('#'+medid+'percent').removeClass("displaydis");
                        $('#'+medid+'progressbar').removeClass("progress-bar-warning");
                        $('#'+medid+'progressbar').css("width",progress_width+'%');
                        $('#'+medid+'progressbar').addClass("progress-bar-danger");
                        $('#'+medid+'percentage').html(progress_width_int+'%');
                        $('#'+medid+'details').addClass("displaydis");
                        $('#'+medid+'ack').removeClass("displaydis");
                        $('#'+medid+'ack-errtype').html(status);
                        $('#'+medid+'details-ratediv').removeClass("backgroundRed");
                        $('#'+medid+'ack-btn').unbind().on("click", function(){
                        socket.emit('publish', {topic:msg.topic,payload:medid+'-'+timeid+'-'+'errackclicked'+'-'+rateml+'-'+volinfused+'-'+remaintime+'-'+tvol});
                         });


                	}

					else if(status=='Complete')
                	{
                		$('#'+medid).addClass("displaydis");
                		$('#'+medid+'progressbardiv').removeClass("displaydis");
                		$('#'+medid+'progressbar').removeClass("progress-bar-info");
                        $('#'+medid+'percent').removeClass("displaydis");
                        $('#'+medid+'progressbar').removeClass("progress-bar-warning");
                        $('#'+medid+'progressbar').css("width",progress_width+'%');
                        $('#'+medid+'progressbar').addClass("progress-bar-warning");
                        $('#'+medid+'percentage').html(progress_width_int+'%');
                        $('#'+medid+'details').addClass("displaydis");
                        $('#'+medid+'ack').removeClass("displaydis");
                        $('#'+medid+'ack-errtype').html(status);
                        $('#'+medid+'details-ratediv').removeClass("backgroundRed");
                        $('#'+medid+'ack-btn').unbind().on("click", function(){
                        socket.emit('publish', {topic:msg.topic,payload:medid+'-'+timeid+'-'+'cmpltackclicked'+'-'+rateml+'-'+volinfused+'-'+remaintime+'-'+tvol});
                         });

                	}
					else if(status=='Block_ACK')
                	{
                	
                    socket.emit('publish', {topic:msg.topic,payload:medid+'-'+timeid+'-'+'errackclicked'+'-'+rateml+'-'+volinfused+'-'+remaintime+'-'+tvol});


                	}
					else if(status=='Empty_ACK')
                	{
                		$('#'+medid+'progressbardiv').addClass("displaydis");
                        $('#'+medid+'ack').addClass("displaydis");
                        $('#'+medid).removeClass("displaydis");
                        $('#'+medid+'percent').addClass("displaydis");
                        $('#'+timeid).removeClass("not_infused");
                        $('#'+timeid).addClass("infused");

                        socket.emit('publish', {topic:msg.topic,payload:""});

                	}
                	else if(status=='Rate Err_ACK')
                	{
                		
                        socket.emit('publish', {topic:msg.topic,payload:medid+'-'+timeid+'-'+'errackclicked'+'-'+rateml+'-'+volinfused+'-'+remaintime+'-'+tvol});


                	}

					else if(status=='Complete_ACK')
                	{
                		
                        socket.emit('publish', {topic:msg.topic,payload:medid+'-'+timeid+'-'+'cmpltackclicked'+'-'+rateml+'-'+volinfused+'-'+remaintime+'-'+tvol});


                	}
                    else if(status=='errackclicked')
                    {
                                $('#'+medid).addClass("displaydis");
                                $('#'+medid+'progressbardiv').removeClass("displaydis");
                                $('#'+medid+'percent').removeClass("displaydis");
                                $('#'+medid+'details').removeClass("displaydis");
                                $('#'+medid+'details-rate').html(rateml);
                                $('#'+medid+'details-volume').html(volinfused);
                                $('#'+medid+'details-time').html(remaintime);
                                $('#'+medid+'progressbar').removeClass("progress-bar-danger");
                                $('#'+medid+'progressbar').css("width",progress_width+'%');
                                $('#'+medid+'percentage').html(progress_width_int+'%');
                                $('#'+medid+'ack').addClass("displaydis");
                                $('#'+medid+'details-ratediv').addClass("backgroundRed");
                                if(progress_width >90)
                                {
                                    $('#'+medid+'progressbar').addClass("progress-bar-warning");

                                }
                                if(progress_width==100){
                                    $('#'+medid+'progressbar').removeClass("progress-bar-warning");
                                    $('#'+medid+'progressbar').addClass("progress-bar-success");
                                }


                    }
                    else if(status=='cmpltackclicked')
                    {
                                $('#'+medid).addClass("displaydis");
                                $('#'+medid+'progressbardiv').removeClass("displaydis");
                                $('#'+medid+'percent').removeClass("displaydis");
                                $('#'+medid+'details').removeClass("displaydis");
                                $('#'+medid+'details-rate').html(rateml);
                                $('#'+medid+'details-volume').html(volinfused);
                                $('#'+medid+'details-time').html(remaintime);
                                $('#'+medid+'progressbar').removeClass("progress-bar-danger");
                                $('#'+medid+'progressbar').css("width",progress_width+'%');
                                $('#'+medid+'percentage').html(progress_width_int+'%');
                                $('#'+medid+'ack').addClass("displaydis");
                                $('#'+medid+'details-timediv').addClass("backgroundRed");
                                if(progress_width >90)
                                {
                                    $('#'+medid+'progressbar').addClass("progress-bar-warning");

                                }
                                if(progress_width==100){
                                    $('#'+medid+'progressbar').removeClass("progress-bar-warning");
                                    $('#'+medid+'progressbar').addClass("progress-bar-success");
                                }


                    }
                    
               }
               
                });

        socket.emit('join', 'retainsend');

      }); 

});




$(document).on("click","#middlebar .patrmv",function(){
$(this).parent().parent().children('.cnfrmmsg').removeClass("displaydis");
$(this).parent().parent().children('.medicines').addClass("displaydis");
$(this).parent().parent().children('.del').addClass("displaydis");

// $(this).parent().parent().children('.msg').addClass('addposmodal');
// $(this).parent().parent().addClass('addposcn');
});



$(document).on("click","#middlebar .patrmvcancel",function(){
$(this).parent().parent().parent().children('.medicines').removeClass("displaydis");
$(this).parent().parent().parent().children('.cnfrmmsg').addClass("displaydis");
$(this).parent().parent().parent().children('.del').removeClass("displaydis");
});

$(document).on("click","#middlebar .patrmvconfirm",function(){
    $.post($(this).attr("data-url"), function( data ) {
  $( ".middlebar" ).html( data );
});
});