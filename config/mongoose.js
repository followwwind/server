var mongoose = require('mongoose');
var config = require('./config.js');           //引入config配置文件夹下的配置文件
module.exports = function () {
    mongoose.connect(config.mongodb, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
        writeConcern: {
            w: 'majority',
            j: true,
            wtimeout: 1000,
        },
    });
    console.log('MongoDB连接成功！！')
    //创建数据库连接对象db
    //创建mongoose实例对象
    const db = mongoose.connection;
    //连接异常
    db.on('error', (err) => {
        // console.error.bind( '连接错误：')
        console.log('MongoDB连接失败！！')
    })
    //连接成功
    db.once('open', (callback) => {
        console.log('MongoDB连接成功！！')
    })
    //连接断开
    db.on('disconnected', function () {
        console.log('Mongoose connection disconnected');
    });
    return db;
}