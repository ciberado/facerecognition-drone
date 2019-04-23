'use strict';

const http = require('http');
const Protocol = require('azure-iot-device-mqtt').Mqtt;
const Client = require('azure-iot-device').ModuleClient;
const Message = require('azure-iot-device').Message;
const express = require('express');
const path = require('path');

let iotEdgeHubClient;

function startIotEdgeHubClient() {
  Client.fromEnvironment(Protocol, function (err, client) {
    if (err) {
      throw err;
    } else {
      client.on('error', function (err) {
        throw err;
      });
  
      console.log(`Connecting to IoTHub.`);
      client.open(function (err) {
        if (err) {
          throw err;
        } else {
          console.log('IoT Hub module client initialized');
          iotEdgeHubClient = client;
          client.on('inputMessage', onInputMessage);
          client.onMethod('SetVisualAlarmState', onDirectMethodSetVisualAlarmState);
  
          startExpressServer();
        }
      });
    }
  });  
}

function onInputMessage(inputName, msg) {
  console.log(`Received message ${JSON.stringify(msg)}.`);
  /* this points to iotEdgeHubClient */
  this.complete(msg, function(err, data) {});
}

function onDirectMethodSetVisualAlarmState(request, response) {
  // Example payload: { "desiredAlarmState" : true }
  const desiredAlarmState = request.payload.desiredAlarmState ? 1 : 0;
  const apiKey = 'B33BFB12B5B09B1C';
  const requestOptions = {
    host: '192.168.43.216',
    port: 80,
    path: `/api/relay/0?apikey=${apiKey}&value=${desiredAlarmState}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }    
  };
  
  http.request(requestOptions, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      console.log('BODY: ' + chunk);
    });
  }).end();

  response.send(200, 'SetVisualAlarmState invoked: ' + request.payload, function(err) {
    if (err) throw err;
    console.log(`Direct method invocation completed.`);
  });
}

function pipeMessage(client, inputName, messagePayload) {
  if (inputName === 'express') {
    messagePayload.timestamp = new Date().getTime();
    const message = new Message(JSON.stringify(messagePayload));
    message.properties.add('MessageType', 'face-match');
    client.sendOutputEvent('output1', message, function(err, data) {
      if (err) throw err;
      console.log(`Message sent (${JSON.stringify(data)}).`);
    });
  }
}

function startExpressServer() {
  const app = express()

  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  
  const viewsDir = path.join(__dirname, 'views')
  app.use(express.static(viewsDir))
  app.use(express.static(path.join(__dirname, './public')))
  app.use(express.static(path.join(__dirname, './weights')))
  app.use(express.static(path.join(__dirname, './dist')))
  
  app.get('/', (req, res) => res.sendFile(path.join(viewsDir, 'index.html')))
  app.post('/', async (req, res) => {
    if (iotEdgeHubClient) pipeMessage(iotEdgeHubClient, 'express', req.body);
    return res.status(200).send('Received match.');
  });
  
  app.listen(3000, () => console.log('Listening on port 3000!'));  
}

startExpressServer();