# lgtv-bridge
## A Docker-based container to enable WebOS LG TVs to be controlled by simple URL requests

### Modification Notes
- Modified from lgtv-alexa-skill to remove the Alexa part and add a webhook accessible API

### Parameters
Make sure you define the following environment variables when you run the container:
- TV_MAC. MAC address of your LG TV in the format "xx:xx:xx:xx:xx:xx"
- TV_IP. IP address of your LG TV in the format "xxx.xxx.xxx.xxx". You will probably want to make this static or reserved on your TV to prevent it from changing.

### Example docker run
docker run -p 4000:80 -e TV_MAC="a8:23:fe:87:8d:d8" -e TV_IP="192.168.1.53" lgtvbridge

### To Do on First Run
- On your TV, make sure that _TV Mobile On_ (General settings) is set to ON
- On your TV, make sure that _LG Connect Apps_ (Network settings) is set to ON
- **Important The first time, turning on/off the TV will ask for permission; just confirm the pairing via prompt on your tv and your bridge is ready!**

### Available Functions (used from the Docker Container Console)
The following functions are exposed via their respective URLs:<br>
http://container_ip:80/tvon<br>
http://container_ip:80/tvoff<br>
http://container_ip:80/mute<br>
http://container_ip:80/unmute<br>

### Thanks to original work conducted by
- [bigbadblo/lgtv-alexa-skill](https://github.com/bigbadblo/lgtv-alexa-skill)
- [lucone83, forked lgvt-alexa-skill](https://github.com/lucone83/lgtv-alexa-skill)
- [hobbyquacker, lgtv2 library](https://github.com/hobbyquaker/lgtv2)
- [neil-morrison-44, forked project](https://github.com/neil-morrison44/lg-alexa-node)
