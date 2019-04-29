const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const path = require('path')
const config = require('./config/config');

//消息转发服务器socketIO
var httpserver = require('http').createServer('*', function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
  res.setHeader("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.setHeader("X-Powered-By", ' 3.2.1');
  res.setHeader("Content-Type", "application/json;charset=utf-8");

}
).listen(config.EMIT_port);
var io = require('socket.io')(httpserver);
let sockets = new Map();
var emitService = require('./emitService')(io, sockets);
console.log('消息转发服务：http://127.0.0.1:' + config.EMIT_port);