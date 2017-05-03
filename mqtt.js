var mqtt = require('mqtt')
var client = mqtt.connect('mqtt://localhost:1883')

client.on('connect', function() {
    console.log("started");
    client.subscribe('dripo/#');
})


client.on('message', function(topic, message) {

    var res = topic.split("/");
    var id = res[1];
    console.log(res[1]);
if(id=="599869"){

    if (res[2] == 'rate') {
	
	        if (message == "list") {
	           	 client.publish('dripo/' + id + '/pat', "");
	    	} else if (message == "df") {
	        	client.publish('dripo/' + id + '/df', "60*20*15*");
	    	} else {
	       		var str = message.toString().split("-");
	      		 console.log(str[1] + "," + str[2] + "," + str[3] + "," + getDateTime());
      	  	}
	}else if (res[2] == 'pat2set') {
          client.publish('dripo/' + id + '/rate2set', '100*60*100*');
      }
 //console.log(message);
}

});

function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return  hour + ":" + min + ":" + sec;

}
