var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');
var { genPassword, exportPassword } = require('./utils/cryp')
var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
/* 需要先定义和初始化mongoose */
const mongoose = require('./config/mongoose.js')
const db = mongoose();
db.set('useFindAndModify', false)
app.get('/jm', function (req, res, next) {
    let data = req.query;
    res.send(genPassword(data.uid));
});

app.get('/xm', function (req, res, next) {
    let data = req.query;
    try { exportPassword(data.uid) } catch (err) {
        res.json({
            'code': '400',
            'msg': '解密有误',
            'state': err
        });
    } finally {
        res.json({
            'code': '000',
            'msg': exportPassword(data.uid)
        });
    }

});
app.use('/', indexRouter);
app.use('/index', indexRouter);
app.use('/users', usersRouter);
app.use('/account', loginRouter);
app.use(function (req, res, next) {
    res.status(404).send({
        ret: 404,
        message: '接口地址有误，请重试',
    })
    // next(createError(404));
});
module.exports = app;
