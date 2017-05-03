var mqtt = require('mqtt')
var client = mqtt.connect('mqtt://35.160.55.96:1883')

client.on('connect', function(err) {
	console.log('started');
    console.log(err);
})
