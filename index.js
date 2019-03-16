"use strict";

const API = require("./lgtv-api.json");
//const CONFIG = require("./config.json");
const PACKAGE = require("./package.json");

const MyLGTV = require("./LGTVbridge.js");

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
      mylgtv.turnOffTV();
      break;
    case 'tvon':
      console.log("\nTurning on TV ...\n");
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
          executeCommand('tvon','');
          break;
        case '/tvoff':
          executeCommand('tvoff','');
          break; 
        case '/mute':
          executeCommand('mute','true');
          break;
        case '/unmute':
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


}

__init(process.argv[2], process.argv[3]);

