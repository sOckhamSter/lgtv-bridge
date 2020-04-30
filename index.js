"use strict";
var ping = require('ping');

const API = require("./lgtv-api.json");
//const CONFIG = require("./config.json");
const PACKAGE = require("./package.json");
const MyLGTV = require("./LGTVbridge.js");
const request = require('request');


var ping_change_counter = 0;
var ping_stable_counter = 0;
var ping_previous_status = 0;
var tv_power_detected_status = 0;
var first_run_detection = 1;

function __init(command, arg) {
  if(checkMacAddress() && checkIPAddress() && checkArgs(command, arg))
    executeCommand(command, arg);
  else
    return false;
}

function checkMacAddress() {
  if (process.env.TV_MAC === null){
    console.error('\nInvalid or not specified MAC address for your device in TV_MAC environment variable\n');
    return false;
  }
  return true;
}

function checkIPAddress() {
  if (process.env.TV_IP === null){
    console.error('\nInvalid or not specified IP address for your device in TV_IP environment variable\n');
    return false;
  }
  return true;
}

function executeCommand(command, arg) {
  var mylgtv = new MyLGTV();

  switch(command) {
    case 'appslist':
      mylgtv.execute(API.APPS_LIST, 'subscribe', {});
      break;
    case 'servicelist':
      mylgtv.execute(API.SERVICE_LIST, 'subscribe', {});
      break;
    case 'status':
      mylgtv.execute(API.IN_USE_APP, 'subscribe', {});
      break;
    case 'appstatus':
      mylgtv.execute(API.APP_STATUS, 'subscribe', {"id": arg});
      break;
    case 'toast':
      mylgtv.execute(API.TOAST_CREATOR, 'subscribe', {"message": arg});
      break;
    case 'tvoff':
      //tv_power_detected_status = 0;
      console.log("\nTurning off TV ...\n");
      mylgtv.turnOffTV();
      break;
    case 'tvon':
      console.log("\nTurning on TV ...\n");
      //tv_power_detected_status = 1;
      mylgtv.turnOnTV('');
      break;
    case 'mute':
      var setMute = (arg == 'true');
      mylgtv.execute(API.MUTE_TV, 'subscribe', {"mute" : setMute});
      break;
    case 'service':
      bridgeAPIservice();
      break;
    default:
      return;
  }
}

function checkArgs(command, arg) {
  switch(command) {
	case 'service':
    case 'appslist':
    case 'servicelist':
    case 'status':
    case 'tvoff':
    case 'tvon':
      if(typeof arg == 'undefined')
        return true;
      break;
    case 'toast':
      if(typeof arg == 'string')
        return true;
      break;
    case 'mute':
      if(arg == 'true' || arg == 'false')
        return true;
      break;
    default:
       showInstructions();
       return false;
  }

  showInstructions();
  return false;
}

function showInstructions() {
  console.log('\n*** Bridge for LG Smart TVs ***' + ' ' + PACKAGE.version);
  console.log('\nUSAGE: node index.js <option> <parameter>');
  console.log('\nOPTIONS:');
  //console.log('\t* alexa - Bridge for Amazon Alexa');
  console.log('\t* appslist - Displays info about all apps available in your TV');
  console.log('\t* servicelist - Displays info about all services available in your TV');
  console.log('\t* toast "<message>" - Displays a toast message in your TV');
  console.log('\t* tvoff - Turns off your TV');
  console.log('\t* tvon - Turns on your TV\n');
  console.log('\t* mute true|false - Mute/unmute your TV');
  console.log('\t* service - Runs a web service and waits for a GET request');
}

function bridgeAPIservice() {
  console.log('Starting bridge API service...');
  var http = require('http');
  var port = parseInt(process.env.SERVICE_PORT);
  var s = http.createServer();
  s.on('request', function(request, response) {
      //response.writeHead(200);
      //console.log(request.method);
      //console.log(request.headers);
      //console.log(request.url);
      //response.write('hi');
      response.write('Requested API Call: ' + request.url);

      switch(request.url) {
        case '/tvon':
          console.log('Request: tvon');
          executeCommand('tvon','');
          break;
        case '/tvoff':
          console.log('Request: tvoff');
          executeCommand('tvoff','');
          break;
        case '/mute':
          console.log('Request: mute');
          executeCommand('mute','true');
          break;
        case '/unmute':
          console.log('Request: unmute');
          executeCommand('mute','false');
          break;
        default:
          console.log('Unknown Command Received');
          break;
      }
      response.end();

  });

  s.listen(port);
  //console.log('\nBrowse to http://container_ip:' + port);
  console.log('Service started, listening on port ' + port);
  console.log('\nUse the following URLS:');
  console.log('http://container_ip:' + port + '/tvon');
  console.log('http://container_ip:' + port + '/tvoff');
  console.log('http://container_ip:' + port + '/mute');
  console.log('http://container_ip:' + port + '/unmute');

  console.log('-----------------------------------------------------\n');

  RunThePings();

}


// Our app function.
function RunThePings(){
  var thispingstatus = 0;
		// This will send a ping to our host (site) and then..
		ping.promise.probe(process.env.TV_IP, {time: 10,})
		// runs 'then' function after completion and sends the response to it (res).
		.then(function (res) {
			if (res.alive == true){
			  thispingstatus=1;
			  //console.log('UP ping_change_counter:' +  ping_change_counter + ',ping_previous_status:' + ping_previous_status + ',tv_power_detected_status:' + tv_power_detected_status + ',stable:' + ping_stable_counter);
			} else {
			  thispingstatus=0;
			  //console.log('DOWN ping_change_counter:' +  ping_change_counter + ',ping_previous_status:' + ping_previous_status + ',tv_power_detected_status:' + tv_power_detected_status + ',stable:' + ping_stable_counter);
			}
			if( (thispingstatus == ping_previous_status) ) {
				ping_stable_counter++; // Increment the change counter
			}
			else {
				ping_stable_counter = 0;
			}
			if(ping_stable_counter > 5) {
				ping_stable_counter--; // keep it at 5, don't want to run out of memory
				// 5 pings assumes that the device status is permanent.
				tv_power_detected_status=thispingstatus;
				if(first_run_detection == 1) {
					// We have a stable ping and the app has just started.
					// Need to fake sending a status change to the callback url
					ping_change_counter = 4;
					if(thispingstatus == 0){
						ping_previous_status=1;
						}
					else {
						ping_previous_status=0;
					}
				}
			}

			// Now some clever stuff to figure out if we've missed a ping or it's change and stuff
			// If the ping status has changed, or we have just missed some pings
			if( (thispingstatus != ping_previous_status) || (ping_change_counter > 0) ) {
				// Ping status has changed from last time
				ping_change_counter++;

				if(ping_change_counter > 3) {
					// We've missed pings!
					ping_change_counter = 0; // Reset the counter
					console.log('TV Power Status Change Detected');
					var callback_url = "";
					if(thispingstatus == 1 && ((tv_power_detected_status == 0) || (first_run_detection == 1)) ) {
						first_run_detection = 0;
						console.log('Opening Callback URL for TV On');
            console.log(process.env.CALLBACK_URL_ON);
						tv_power_detected_status = 1;
						callback_url = process.env.CALLBACK_URL_ON;
						request(callback_url, { json: true }, (err, res, body) => {
              if (err) {
                console.log("Error calling callback url: " + err);
              }
              else {
                console.log("Callback successful");
                //console.log("Body URL: " + body.url);
                //console.log("Body Explanation: " + body.explanation);
              }
						});
					}
					else if (thispingstatus == 0 && ((tv_power_detected_status == 1) || (first_run_detection == 1))) {
						first_run_detection = 0;
						console.log('Opening Callback URL for TV Off');
            console.log(process.env.CALLBACK_URL_OFF);
						tv_power_detected_status = 0;
						callback_url = process.env.CALLBACK_URL_OFF;
						request(callback_url, { json: true }, (err, res, body) => {
						  if (err) {
                console.log("Error calling callback url: " + err);
              }
              else {
                console.log("Callback successful");
                //console.log("Body URL: " + body.url);
                //console.log("Body Explanation: " + body.explanation);
              }
						});
					}

				}
			}
			else {

				ping_change_counter = 0; // Reset the change counter
			}


			ping_previous_status = thispingstatus;


		});



	// This just continuously runs the function every 1000 miliseconds (1 second).
	setTimeout(RunThePings, 1000);
}



__init(process.argv[2], process.argv[3]);
