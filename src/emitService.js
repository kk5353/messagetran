const jwt = require('jsonwebtoken');
const config=require('../config/config');
var mysql=require('mysql');
var mysqlpool = mysql.createPool({
    host: config.mysql.host,
    user: config.mysql.user,
    password : config.mysql.password,
    port: config.mysql.port,
    database: config.mysql.database});
  

function jwtVerify(token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, config.secret, function (err, datas) {
                if (err) {
                    console.log(err);
                    reject(err)
                } else {
                    resolve(datas);
                    data.data = datas;
                    data.time = (new Date()).getTime();
                    data.userid = datas.userid;
                    if (datas.exp > data.time / 1000) {
                        data.message = 'token有效';
                        sockets.set(data.userid, socket)
                    } else {
                        data = {};
                        data.message = 'token失效';
                    }
                }
            })
        })
    }

module.exports = function (io, sockets,livetime) {
    
    io.on('connection', function (socket) {


        //接收并处理客户端心跳事件
        socket.on('heartbeat', function (data) {


              livetime.forEach(function (value, key, map) {
                console.log('heartbeat:'+key+'----'+value+'------------time now:'+ (new Date()).getTime());

                if(value< (new Date()).getTime()){  //如果超时，全网广播下线了
                    // io.emit('chairmanOffLine',key);
                    console.log('heartbeat:'+key+'已经挂掉了'); 
                    io.emit('chairmanOffLine',key);
                }

            });

            jwtVerify(data.token).then(
                function(data){
                    console.log('resolved');
                    data.time = (new Date()).getTime();
                    if (data.exp > data.time / 1000) {
                        data.message = 'token有效';
                        if(livetime.get(data.userid)==undefined){
                          livetime.set(data.userid, data.time)  
                        }else{
                           livetime.set(data.userid, data.time+100000) 
                        }
                       sockets.set(data.userid, socket);
                       console.log(data);
                    } else {
                        data = {};
                        data.message = 'token失效';
                    }
                }, 
                function(reason, data){
                    console.log('rejected');
                    console.log(reason);
                }
            );
            socket.emit('heartbeat', '你依然坚挺的活着');
        });


        //接收并处理客户端的关闭会议事件
        socket.on('closeMeeting', function (data) {       


            jwtVerify(data.token).then(
                function(data){
                    console.log('resolved');                  
                    data.time = (new Date()).getTime();
                    if (data.exp > data.time / 1000) {
                        data.message = 'token有效';
                       io.emit('closeMeeting',data.meetingId);
                       
                       //可能需要request请求
  
                    } else {
                        data = {};
                        data.message = 'token失效';
                    }
                }, 
                function(reason, data){
                    console.log('rejected');
                    console.log(reason);
                }
            );
       });


        //接收并处理客户端的踢人事件
        socket.on('kick', function (data) {
         
            jwt.verify(data.token, config.secret, function (err, datas) {
                if (err) {
                    console.log(err);
                } else {
                    data.data = datas;
                    data.time = (new Date()).getTime();
                    data.userid = datas.userid;
                    if (datas.exp > data.time / 1000) {
                        data.message = 'token有效';
                       io.emit('kick',data.id);  
  //可能需要request请求  
                    } else {
                        data = {};
                        data.message = 'token失效';
                    }
                }
            })
         });

        //接收并处理客户端的申请主席事件
        socket.on('applyChairman', function (data) {
         
            jwt.verify(data.token, config.secret, function (err, datas) {
                if (err) {
                    console.log(err);
                } else {
                    data.data = datas;
                    data.time = (new Date()).getTime();
                    data.userid = datas.userid;
                    if (datas.exp > data.time / 1000) {
                        data.message = 'token有效';
                       socket.broadcast.emit('applyChairman',data.id); 
  //可能需要request请求  
                    } else {
                        data = {};
                        data.message = 'token失效';
                    }
                }
            })
         });



                 //接收并处理客户端的更换主席事件
        socket.on('changeChairman', function (data) {
         
            jwt.verify(data.token, config.secret, function (err, datas) {
                if (err) {
                    console.log(err);
                } else {
                    data.data = datas;
                    data.time = (new Date()).getTime();
                    data.userid = datas.userid;
                    if (datas.exp > data.time / 1000) {
                        data.message = 'token有效';
                       socket.broadcast.emit('changeChairman',data.id); 
  //可能需要request请求  
                    } else {
                        data = {};
                        data.message = 'token失效';
                    }
                }
            })
         });


        //绘图事件
        socket.on('drawing', function (data) {
            console.log('画图进行中', data)
            jwt.verify(data.token, 'zh-123456SFU>a4bh_$3#46d0e85W10aGMkE5xKQ', function (err, datas) {
                if (err) {
                    console.log(err);
                    data.message = 'token有误';
                    socket.join(data.mId);
                    io.sockets.in(data.mId).emit('editing', data.message);
                } else {
                    data.userinfo = datas;
                    data.time = (new Date()).getTime();
                    data.userid = datas.userid;
                    if (datas.exp > data.time / 1000) {
                        data.message = 'token有效';
                        socket.join(data.mId);
                        io.sockets.in(data.mId).emit('drawing', data.data);

                    } else {
                        data.message = 'token失效';
                        socket.join(data.mId);
                        io.sockets.in(data.mId).emit('drawing', data.message);
                    }

                }
            })

        })




        //editing message
        socket.on('editing', function (data) {
            console.log('文本编辑进行中', data)
            jwt.verify(data.token, 'zh-123456SFU>a4bh_$3#46d0e85W10aGMkE5xKQ', function (err, datas) {
                if (err) {
                    console.log(err);
                    data.message = 'token有误';
                    socket.join(data.mId);
                    io.sockets.in(data.mId).emit('editing', data.message);

                } else {
                    data.userinfo = datas;
                    data.time = (new Date()).getTime();
                    data.userid = datas.userid;
                    if (datas.exp > data.time / 1000) {
                        data.message = 'token有效';
                        socket.join(data.mId);
                        io.sockets.in(data.mId).emit('editing', data.data);

                    } else {
                        data.data = {};
                        data.message = 'token失效';
                        socket.join(data.mId);
                        io.sockets.in(data.mId).emit('editing', data.message);
                    }

                }
            })

        })


        //chat message
        socket.on('chating', function (data) {
            console.log('chating on the way ', data)
            jwt.verify(data.token, 'zh-123456SFU>a4bh_$3#46d0e85W10aGMkE5xKQ', function (err, datas) {
                if (err) {
                    console.log(err);
                    data.message = 'token有误';
                    socket.join(data.mId);
                    io.sockets.in(data.mId).emit('editing', data.message);
                } else {
                    data.userinfo = datas;
                    data.time = (new Date()).getTime();
                    data.userid = datas.userid;
                    if (datas.exp > data.time / 1000) {
                        data.message = 'token有效';
                        sockets.set(data.userid, socket)

                        socket.join(data.mId);
                        let addSql='INSERT INTO message(sender,receiver,content,sendTime) VALUES(?,?,?,?)';
                        let addSqlParams = [data.userid, data.to, data.content, (new Date()).getTime() ];

                        mysqlpool.query(addSql,addSqlParams,function (err, result) {
                                if (err) {
                                    console.log('聊天消息插入数据库失败：',result,addSql,addSqlParams);
                                }else{
                                    if(sockets.get(data.to)){
                                      sockets.get(data.to).emit('chating', data.content);  
                                    }else{
                                        socket.emit('chating','对方还没准备好')
                                    }                                     
                                };                               
                              });   
                            };         
                        }
                      
                    })

        })




        //断开事件
        socket.on('disconnect', function (data) {
            
            
            
            console.log('断s开', data);
            
            
            socket.emit('news', '离开');



            for (var [key, value] of sockets) {
                console.log(key + " = " + value);

if(socket==value){
    console.log(key+'----------------');
    delete sockets[key];
}

              }
              
          //socket.broadcast用于向整个网络广播(除自己之外)
            //socket.broadcast.emit('c_leave','某某人离开了')
        })


    });

};