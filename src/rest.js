const jwt = require('jsonwebtoken');
var config=require('../config/config');
var mysql=require('mysql');
var connection = mysql.createConnection({
    host: config.mysql.host,
    user: config.mysql.user,
    password : config.mysql.password,
    port: config.mysql.port,
    database: config.mysql.database});
    connection.connect();


    var  sql = 'SELECT * FROM organtree';
    //查
    connection.query(sql,function (err, result) {
            if(err){
              console.log('[SELECT ERROR] - ',err.message);
              }  
          //  console.log(result[0]);
           organ= JSON.parse(JSON.stringify(result[0]));   
          organTree= JSON.parse( organ.organTree)    
    });
     
    connection.end();




module.exports = function (app) {
    // 分发user模块，比如用户的注册和登录请求业务逻辑将会在/api/user.js中实现

    app.post('/', function (req, res) {

      console.log(req.body);
        res.send(req.body);
      })


      app.post('/joinMeeting', function (req, res) {

        // console.log(req.body);

console.log(organTree.users[0]);

          res.send(req.body.organTree);
        })


};