const express = require('express');
const bodyParser = require('body-parser');
var http=require('http');
var ws=require('ws');
app =express();
var httpserver = http.Server(app);
var handleUpgrade = require('express-websocket');
httpserver.on('upgrade', handleUpgrade(app, wss));
var wss = new ws.Server({ noServer: true });
app.use(bodyParser.json());
var io = require('socket.io')(httpserver);
let sockets = new Map();
let socketIds = new Map();
let livetime=new Map();
let meetingIds=new Map();

let emitService = require('./src/emitService')(io, sockets, livetime,meetingIds,socketIds);
let rest=require('./src/rest')(app);
let ws1=require('./src/ws')(app,sockets)

httpserver.listen(3000, function(){
  console.log('message tranmit server listening on *:3000');
});