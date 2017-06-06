#!/bin/bash
while [ 1 ];
do
if sudo pgrep -x "mosquitto" > /dev/null
then
echo "Mosquitto Running"
else
echo "Mosquitto Stopped"
mosquitto&
fi
if sudo pgrep -x "mongod" > /dev/null
then
echo "Mongodb Running"
else
echo "Mongodb Stopped"
mongod&
fi
sleep 60
done
