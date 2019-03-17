

# lgtv-bridge
## A Docker image enabling control and status monitoring of WebOS LG TVs by simple URL requests. For SmartThings/Domoticz integration.

## Notes
- Modified from lgtv-alexa-skill to remove the Alexa part and add a web accessible API. The intention for this image is to help with the integration of the TV into your existing smart hub (SmartThings, Domoticz, etc). If you wish to then integrate it into Alexa, you'd do so by managing that integration from your central hub as you are likely already doing with other devices.
- Added a TV status monitor based on ICMP (ping). If the service detects the TV's power status has changed, it calls a supplied callback URL.
- This works best if both the Docker host and the LG TV are on wired network connections. It is also essential that both are on the *same* network subnet (broadcast domain).
- I have this working with an LG 32LK6100 (2018 WebOS 4) and a Samsung SmartThings Hub v3. Your experience may vary...
- Don't run two versions of this container on the same network, I did that by accident and the TV went crazy powering itself on and off as the two containers fought against each other in an epic battle for standby control.

## Home Pages

 - Docker Hub: https://hub.docker.com/r/sockhamster/lgtv-bridge
 - Github: https://github.com/sOckhamSter/lgtv-bridge

## Instructions

### Parameters ###
Make sure you define the following environment variables when you run the container:
 - TV_MAC. MAC address of your LG TV in the format "xx:xx:xx:xx:xx:xx"
 - TV_IP. IP address of your LG TV in the format "xxx.xxx.xxx.xxx". You will probably want to make this static or reserved on your TV to prevent it from changing.
 - SERVICE_PORT. The TCP port that the service listens on for requests.
 - CALLBACK_URL_ON. The https URL for the service to call when it detects that the TV has been powered on.
 - CALLBACK_URL_OFF. The https URL for the service to call when it detects that the TV has been powered off.


***Must be run in HOST NETWORK mode or the Wake-on LAN magic packets will fail to wake your TV up!***

### Example docker run command ###
docker run --net=host -e TV_MAC="a8:23:fe:87:8d:d8" -e TV_IP="192.168.1.53" -e SERVICE_PORT=4000 -e CALLBACK_URL_ON="https://url_to_webcore_piston?TurnIt=on" -e CALLBACK_URL_OFF="https://url_to_webcore_piston?TurnIt=off"  lgtvbridge

### To Do on First Run ###
 - On your TV, make sure that _TV Mobile On_ (General settings) is set to ON
 - On your TV, make sure that _LG Connect Apps_ (Network settings) is set to ON
 - **Important: The first time, turning on/off the TV will ask for permission; just confirm the pairing via prompt on your TV and your bridge is ready!**

### Available Functions (used from the Docker Container Console) ###
The following functions are exposed via their respective URLs:
 - http://container_ip:SERVICE_PORT/tvon
 - http://container_ip:SERVICE_PORT/tvoff
 - http://container_ip:SERVICE_PORT/mute
 - http://container_ip:SERVICE_PORT/unmute

## SmartThings
You can integrate this into Samsung SmartThings for basic on/off control. The device you create in SmartThings will track the power status of the TV in the real world based, and also allow control of its power state.
1) Create a Virtual On/Off switch in SmartThings
2) Make sure you have the webCoRE SmartApp installed: https://wiki.webcore.co/webCoRE#Installing_webCoRE
3) Import the following Piston: 5ah0a: ![enter image description here](https://github.com/sOckhamSter/lgtv-bridge/blob/master/lgtv-bridge_webCoRE_Piston.png?raw=true)
4) Copy and paste the External URL from the Piston's property page to use as the container's callback URL. Add ?TurnIt=on or ?TurnIt=off to the end of the URL depending on whether it's for the CALLBACK_URL_ON or CALLBACK_URL_OFF variable. See this screenshot of the webCoRE dashboard for the location of that External URL: ![enter image description here](https://github.com/sOckhamSter/lgtv-bridge/blob/master/lgtv-bridge_webcore_external_url.png?raw=true)

## To-Do

At some point, if anyone can be bothered... it would be much nicer to have proper SmartThings Device Handler for an LG Smart TV. I'd see this device as being able to also mute/unmute, and maybe even sending Toast notifications too, plus control the start of activites. Anyway here's my to-do list for functionality if there are any takers:

 - [ ] ToDo01: Update index.js / bridgeAPIservice() to understand the calling URLs in a more intelligent way. Must be able to read and act on the passed in parameters.
 - [ ] ToDo02: Enable Toast notifications to TV from a web call. Relies on ToDo01.
 - [ ] ToDo03: Enable service starting (i.e. iPlayer, Netflix, etc) from a web call. Would be neater if it relied on ToDo01, but not necessary.
 - [ ] ToDo04: Create a proper SmartThings Device Handler for LG Smart TVs. Must include functionality for On/Off, Mute, Notifications, App Starting. Replaces the webCoRE piston. Might require an accompanying SmartApp.
 - [ ] ToDo05: Docker image configuration: make it optional to use either environment variable parameters, or a config file. Some sort of auto-detection of which one is in use needs to be added. I know beginners prefer environment variables for simplicity, but config files are more robust.

 

### Thanks to original work conducted by
- [bigbadblo/lgtv-alexa-skill](https://github.com/bigbadblo/lgtv-alexa-skill)
