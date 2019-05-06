


  const jwt = require('jsonwebtoken');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://39.98.212.236:20003/runoob";
module.exports = function (app,sockets) {
    // 分发user模块，比如用户的注册和登录请求业务逻辑将会在/api/user.js中实现

  app.use('/websocket', function (req, res, next) {
    res.websocket(function (ws) {
      // Optional callback
      ws.on('message' , function(data){
          console.log(data);
          ws.send(data);
    });

    ws.on('close' , function(data){
        console.log('dfdfdf123');
        sockets.get(28).emit('chating', "result");
 
  });

     
    });
  });  


};