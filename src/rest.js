const jwt = require('jsonwebtoken');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://39.98.212.236:20003/runoob";
module.exports = function (app) {
    // 分发user模块，比如用户的注册和登录请求业务逻辑将会在/api/user.js中实现

    app.get('/', function (req, res) {
        res.send('Hello World')
      })



};