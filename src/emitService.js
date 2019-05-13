const jwt = require('jsonwebtoken');
const config = require('../config/config');
var mysql = require('mysql');
rp = require('request-promise');
var mysqlpool = mysql.createPool({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    port: config.mysql.port,
    database: config.mysql.database
});

function jwtVerify(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, config.secret, function (err, data) {
            if (err) {
                reject(err)
            } else {
                data.now = (new Date()).getTime();
                if (data.exp > data.now / 1000) {
                    resolve(data);
                } else {
                    reject(data);
                }
            }
        })
    })
}


module.exports = function (io, sockets, livetime,meetingIds,socketIds) {

var type=0;
    io.on('connection', function (socket) {

        if(socketIds.get(socket.id)==undefined){
            type=1
        }else{
            type=0
        }
        
        socketIds.set(socket.id,socket);

        //接收并处理客户端心跳事件
        socket.on('heartbeat', function (datain) {

            // console.log(type);
           
            // console.log('heartbeat');
            // console.log(livetime);
            var online=new Array();
            livetime.forEach(function (value, key) {
                if (value < (new Date()).getTime()) {  //如果超时，全网广播下线了
                    console.log('heartbeat:' + key + '下线了');
                    livetime.delete(key);  
                    sockets.delete(key);  
                    meetingIds.delete(key);
//告知IM该人下线
                    //暂时模拟请求，发送给自己的rest

                    let options = {
                        method: 'post',
                        uri: 'http://127.0.0.1:3000',
                        body: {
                            message: key + '下线或退出会议'
                        },
                        json: true // Automatically stringifies the body to JSON
                    }
                    rp(options)
                        .then(function (parsedBody) {
                            // POST succeeded...
                            console.log('下线退会调用IM成功');
                        })
                        .catch(function (err) {
                            // POST failed...
                            console.log('下线退会调用IM失败');
                        })
                    io.emit('chairmanOffLine', key);
                } else {                    
                    online.push(key);
                }
            });
// console.log(JSON.stringify(online)+'心跳正常'+new Date());

            jwtVerify(datain.token).then(
                function (data) {
                    // sockets.set(data.userid,socket);                    
                    // console.log(livetime);
                    // console.log(datain);
                    if (livetime.get(data.userid) == undefined) {                        
                        livetime.set(data.userid, (new Date()).getTime()+10000);
                        console.log(data.userid+'上线了');
                    } else {
                        livetime.set(data.userid, (new Date()).getTime()+10000);
                    }

                    if (meetingIds.get(data.userid) == undefined) {                        
                        meetingIds.set(data.userid, datain.meetingId);                       
                        // console.log(datain.meetingId+'会议室编号状态收到');
                    } else {
                        // console.log('会议室编号状态更新');
                        meetingIds.set(data.userid, datain.meetingId);                       
                    }

                        sockets.set(data.userid,socket);
                        socket.join(datain.meetingId);                        



// console.log(meetingIds);

                },
                function (reason, data) {
                    data = {};
                    data.message = 'token无效';
                }
            );
            
            socket.emit('heartbeat', '你依然坚挺的活着');
        });


        //接收并处理客户端的关闭会议事件
        socket.on('closeMeeting', function (data) {
            jwtVerify(data.token).then(
                function (data) {
                    io.emit('closeMeeting', data.meetingId);
                },
                function (reason, data) {
                    console.log('rejected');
                    console.log(reason);
                    data = {};
                    data.message = 'token失效';
                }
            );
        });


        //接收并处理客户端的踢人事件
        socket.on('kick', function (datain) {
            jwtVerify(datain.token).then(
                function (data) {
                    io.emit('kick', datain.kickUid);

                    //暂时模拟请求，发送给自己的rest

                    let options = {
                        method: 'post',
                        uri: 'http://127.0.0.1:3000',
                        body: {
                            message: datain.kickUid + '被踢出会议了'
                        },
                        json: true // Automatically stringifies the body to JSON
                    }
                    rp(options)
                        .then(function (parsedBody) {
                            // POST succeeded...
                            console.log('踢人调用IM成功')
                        })
                        .catch(function (err) {
                            // POST failed...
                            console.log('踢人调用IM失败')
                        })
                },
                function (reason, data) {
                    console.log('rejected');
                    console.log(reason);
                    data = {};
                    data.message = 'token失效';
                }
            );
        });

        //接收并处理客户端的申请主席事件
        socket.on('applyChairman', function (datain) {
            console.log("申请主席事件");
            console.log(meetingIds)
            console.log(socket.id);



            console.log(datain);
            jwtVerify(datain.token).then(function (data) {
                    // socket.broadcast.emit('applyChairman', datain.id);

                    console.log(meetingIds.get(data.userid));
                    console.log(meetingIds);

                    socket.broadcast.to(meetingIds.get(data.userid)).emit('applyChairman', datain.id);
                },
                function (reason, data) {
                    console.log('申请主席失败', reason, data);
                })
        });




        //接收并处理客户端的更换主席事件(包含同意更换主席和拒绝更换主席)
        socket.on('changeChairman', function (datain) {
            
            // console.log(datain);
            jwtVerify(datain.token).then(function (data) {

                console.log(data.userid);

                console.log(meetingIds);               
                console.log(socket.id);


// sockets.forEach()

// console.log(Object.keys(socket.rooms));



                // socket.broadcast.to(meetingIds.get(data.userid)).emit('changeChairman', datain);  //发送给会议室内所有人，不发送给自己
                io.sockets.in(meetingIds.get(data.userid)).emit('changeChairman', datain);           //发送给会议室内所有人，含自己

                if(datain.status == true){

                    let addSql = 'update tb_meeting set chairmanID = ? where meetingID= ?';
                    let addSqlParams = [datain.id, meetingIds.get(data.userid)];
                    mysqlpool.query(addSql, addSqlParams, function (err, result) {
                        if (err) {
                            console.log('更换主席更新数据库失败：', err , addSql, addSqlParams);
                        } else {
                            console.log((datain));   
                            console.log('更换主席成功');                         
                        }
                        ;
                    });
                }

            }, function (reason, data) {
                console.log('切换主席失败', reason, data);
            })
        });


        //绘图事件
        socket.on('drawing', function (datain) {
            console.log('画图进行中', data)
            jwtVerify(datain.token).then(function (data) {
                socket.join(datain.mId);
                io.sockets.in(datain.mId).emit('drawing', datain.data);
            }, function (reason, data) {
                console.log('画图消息转发失败', reason, data);
            })
        })


        //editing message
        socket.on('editing', function (datain) {

            jwtVerify(datain.token).then(function (data) {
                socket.join(datain.mId);
                io.sockets.in(datain.mId).emit('editing', datain.data);
            }, function (reason, data) {
                console.log('编辑消息转发失败', reason, data);
            })
        })


        //chat message
        socket.on('chating', function (datain) {
            jwtVerify(datain.token).then(function (data) {
                datain.sendTime=(new Date()).getTime();
                let addSql = 'INSERT INTO message(sender,receiver,content,sendTime) VALUES(?,?,?,?)';
                let addSqlParams = [data.userid, datain.to, datain.content,datain.sendTime];
                mysqlpool.query(addSql, addSqlParams, function (err, result) {
                    if (err) {
                        console.log('聊天消息插入数据库失败：', result, addSql, addSqlParams);
                    } else {
                        datain.sender=data.userid;
                        console.log((datain));
                        if (sockets.get(datain.to)) {
                            sockets.get(datain.to).emit('chating', datain);
                        } else {
                            socket.emit('chating', '接收方还没有上线');
                        }
                    }
                    ;
                });
            }, function (reason, data) {
                console.log('聊天消息转发失败', reason, data);
            })
        })


        //断开事件
        socket.on('disconnect', function (data) {
           

if(data == "transport error"){

    sockets.forEach(function (value, key) {
        if (value == socket) {  //如果超时，全网广播下线了
            console.log(key + '用户刷新界面或者关闭界面');

            sockets.delete(key);
        //    console.log( sockets.delete(key));    
        //    console.log( livetime.delete(key));  
            // console.log(livetime);    




        } 
    });

}       

        })


    });

};