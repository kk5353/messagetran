var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://39.98.212.236:20003/runoob";
module.exports = function (io) {
    // 分发user模块，比如用户的注册和登录请求业务逻辑将会在/api/user.js中实现

    io.on('connection', function (socket) {

        //接收并处理客户端的hi事件
        socket.on('hi', function (data) {
            console.log(data);

            //触发客户端事件c_hi
            socket.join(data.roomId);
            data.name = '系统为您增加的内容';
            data.socket = JSON.stringify(socket);
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

        //断开事件
        socket.on('disconnect', function (data) {
            console.log('断s开', data)
            socket.emit('news', '离开');
            //socket.broadcast用于向整个网络广播(除自己之外)
            //socket.broadcast.emit('c_leave','某某人离开了')
        })


    });

};