const jwt = require('jsonwebtoken');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://39.98.212.236:20003/runoob";
module.exports = function (io) {
    // 分发user模块，比如用户的注册和登录请求业务逻辑将会在/api/user.js中实现

    io.on('connection', function (socket) {


        //接收并处理客户端的hi事件
        socket.on('hi', function (data) {
            console.log(data);

            //触发客户端事件c_hi

            jwt.verify(data.token, 'zh-123456SFU>a4bh_$3#46d0e85W10aGMkE5xKQ', function (err, datas) {
                if (err) {
                    console.log(err);
                } else {
                    data.data = datas;
                    data.time = (new Date()).getTime();
                    data.userid = datas.userid;
                    if (datas.exp > data.time / 1000) {
                        data.message = 'token有效';
                    } else {
                        data = {};
                        data.message = 'token失效';

                    }


                }
            })

            delete (data.token);
            socket.join(data.roomId);

            io.sockets.in(data.roomId).emit('c_hi', JSON.stringify(data));

            MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
                if (err) throw err;
                var dbo = db.db("runoob");
                var myobj = [
                    { name: '短消息', content: data, type: 'cn' }
                ];
                dbo.collection("site").insertMany(myobj, function (err, res) {
                    if (err) throw err;
                    console.log("插入的文档数量为: " + res.insertedCount);
                    db.close();
                });
            });


            socket.emit('c_hi', 'hello too!')
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


                        let sockets = new Map();
                        sockets.set(data.userid, socket)

                        console.log(sockets)
                        console.log(sockets.get(data.userid))

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




        //断开事件
        socket.on('disconnect', function (data) {
            console.log('断s开', data)
            socket.emit('news', '离开');
            //socket.broadcast用于向整个网络广播(除自己之外)
            //socket.broadcast.emit('c_leave','某某人离开了')
        })


    });

};