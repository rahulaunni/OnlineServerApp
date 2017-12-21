$(function()
{
	var socket = io.connect('http://localhost');
	socket.on('connect', function(data){
	socket.on('mqtt_button', function(msg)
	{
               console.log(msg.topic+' '+msg.payload);
               var button = msg.topic.split("/");
               var id = button[1];
               var message = msg.payload;
               if(message=='ALERT')
               {
               	   $.ajax({
               	   	type: 'GET',
               	    url: '/buttontopurpose?buttonid='+id,						
               	    success: function(res)
               	    {
               	    	$('#'+id).addClass("displaydis");
               	    	$('#'+id+'hide').addClass("displaydis");
               	    	$('#'+id+'message').removeClass("displaydis");
               	    	$('#'+id+'purpose').html(res);
               	    	$('#'+id+'ack-btn').unbind().on("click", function(){
                              $('#'+id).removeClass("displaydis");
                              $('#'+id+'hide').removeClass("displaydis");
                              $('#'+id+'message').addClass("displaydis");
               	    	     socket.emit('publish_button', {topic:'aavo/'+id+'/ack',payload:'STA_ACK'});
               	    	     socket.emit('publish', {topic:'aavo/'+id+'/alert',payload:''});
               	    	
               	    	 });
               	    }
               	})

               }   


	})
	socket.emit('join_button', 'sendbtnalert');

});
})