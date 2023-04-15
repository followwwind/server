var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var UserSchema = require('../models/user.server.model');
var User = mongoose.model('User', UserSchema);//创建mongoose下model对象
var { genPassword,
    exportPassword } = require('./../utils/cryp');/* 加密和解密方法 */
var moment = require('moment');
/* 设置当前token */
var Token = require('./../utils/token');
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});
/* 用户注册接口 */
router.post('/register', function (req, res, next) {
    console.log(req.body);
    let Firstname = req.body.Firstname;
    let Lastname = req.body.Lastname;
    let Email = req.body.Email;
    let password = req.body.password;
    let description = req.body.description;
    User.find({
        Email: Email
    }, function (err, docs) {
        if (err) {
            console.log('Error:');
            return next();
        } else {
            if (docs.length == 0) {
                /* 用户不存在 */
                /* 不存在增加数据 */
                var user = new User(
                    {
                        "oid": createUUID(6, 16) + Date.parse(new Date()),
                        "Firstname": Firstname,
                        "Lastname": Lastname,
                        "Email": Email,
                        "password": genPassword(password),
                        "description": description,
                        "datetime": moment().format('YYYY-MM-DD'),
                        "state": ""
                    })
                user.save({
                    "oid": createUUID(6, 16) + Date.parse(new Date()),
                    "Firstname": Firstname,
                    "Lastname": Lastname,
                    "Email": Email,
                    "password": genPassword(password),
                    "description": description,
                    "datetime": moment().format('YYYY-MM-DD'),
                    "state": ""
                }, function (err, doc) {
                    if (err) {
                        res.send('Error');
                        res.json({ 'result': err });
                        return next();
                    } else {
                        const tokenStr = Token.encrypt(doc);//新增数据成功
                        res.json({
                            code: '000',
                            'result': 'registered successfully',
                            'msg': doc,
                            'token': tokenStr
                        });
                    }
                });
            } else {
                /* 用户已注册 */
                res.json({ code: '001', 'result': 'User registered', userstate: docs })
            }
            console.log(docs.length)
        }
        // res.json(docs);
    });
    return false;

});
/* 用户登录接口 */
router.post('/login', function (req, res, next) {
    let Email = req.body.Email;
    let password = req.body.password;
    console.log(genPassword(password))
    console.log(Email)
    User.find({
        Email: Email,
        password: genPassword(password)
    }, function (err, docs) {
        if (err) {
            console.log('Error:' + err);
            return next();
        } else {
            if (docs.length != 0) {
                const tokenStr = Token.encrypt(docs[0]);
                res.json({
                    'code': '000',
                    'result': 'login success',
                    'msg': docs[0],
                    'token': tokenStr
                });
            } else {
                res.json({ 'code': '001', 'result': 'Please reenter the incorrect information' });

            }
        }
    });

});
/* 验证密码 */
router.post('/yzpassword', function (req, res, next) {
    var m = crypto.createHash('md5');
    let basepassword = req.body.basepassword;
    let password = req.body.password;
    m.update(password, 'utf8');
    const result = m.digest('hex').toUpperCase();
    console.log(result == basepassword)
    if (result == basepassword) {
        res.json({ 'code': '000', 'result': 'success' });
    } else {
        res.json({ 'code': '001', 'result': 'error' });
    }
    return false;

});
/* 修改密码 */
router.post('/changepassword', function (req, res, next) {
    var m = crypto.createHash('md5');
    var m2 = crypto.createHash('md5');
    let basepassword = req.body.basepassword;
    let password = req.body.password;
    let newpassword = req.body.newpassword;
    m.update(password, 'utf8');
    m2.update(newpassword, 'utf8');
    const result = m.digest('hex').toUpperCase();
    const result2 = m2.digest('hex').toUpperCase();
    if (result == basepassword) {
        User.findOneAndUpdate(
            //   { _id: req.params.id },
            { _id: req.body._id },
            {
                $set: {
                    password: result2,
                }
            },
            {
                new: true
            }
        )
            .then(state => {
                console.log(state)
                res.json({ 'code': '000', 'result': state })
            })
            .catch(err => res.json(err));
    } else {
        res.json({ 'code': '001', 'result': 'The original password was incorrectly entered' });
    }
    return false;

});
/* 获得用户基本数据接口(jwt) */
router.get('/userstate', function (req, res, next) {
    let userinfo = Token.decrypt(req.headers.authorization);
    console.log(userinfo);
    if (userinfo.token == true) {
        /* 对密码解密进行返回显示 */
        userinfo.data.userdata.password = exportPassword(userinfo.data.userdata.password);
        res.json({
            ret: '000',
            message: '获取用户信息成功',
            data: userinfo
        });
    } else {
        res.json({
            ret: '001',
            message: 'token解析失败，请重新登录',
            data: ''
        });
    }


});
/**
  * 生成指定长度的UUID
  * @param len
  * @param radix
  * @returns uuid
  * eg: createUUID(8, 2) "01001010" createUUID(8, 10) "47473046" createUUID(8, 16) "098F4D35"
  */
function createUUID(len, radix) {
    var chars = '0123456789'.split('');
    var uuid = [], i;
    radix = radix || chars.length;
    if (len) {
        for (i = 0; i < len; i++) {
            uuid[i] = chars[0 | Math.random() * radix];

        }

    }
    return '-' + uuid.join('');

}
module.exports = router;
