var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var UserSchema = require('../models/user.server.model');
var User = mongoose.model('User', UserSchema);//创建mongoose下model对象
var userdata = require('./../public/userlist.json');
var { genPassword,
  exportPassword } = require('./../utils/cryp');/* 加密和解密方法 */
/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});
router.get('/adddata', function (req, res, next) {
  res.send('respond with a resource');
});
/* 查询所有用户数据 */
router.get('/find', function (req, res, next) {
  User.find(function (err, docs) {
    if (err) {
      console.log('Error:');
      return next();
    }
    res.json(docs);
  });
});
/* 查找指定用户 */
router.get('/finduser', function (req, res, next) {
  console.log(req.query)
  User.findOne({
    _id: req.query._id
  }, function (err, docs) {
    if (err) {
      // console.log('Error:');
      // return next();
      res.json({
        ret: '001',
        message: '用户信息不存在',
        data: docs
      });
    } else {
      res.json({
        ret: '000',
        message: 'success',
        data: docs
      });
    }
  });
});
/* 修改用户信息 */
router.put("/change", (req, res) => {
  console.log(req.body)
  User.findOneAndUpdate(
    { _id: req.body._id },
    {
      $set: {
        Firstname: req.body.Firstname,
        Lastname: req.body.Lastname,
        Email: req.body.Email,
        password: genPassword(req.body.password),
        description: req.body.description,
        state: req.body.state,
      }
    },
    {
      new: true
    }
  )
    .then(state => {
      res.json({
        ret: '000',
        message: 'success',
        data: state
      });
    })
    .catch(err => {
      res.json({
        ret: '001',
        message: err,
        data: err
      });
    });
});
/* ================================= */
/* 将json文件内所有字段添加入数据表 */
/* user用户 */
router.get('/add', function (req, res, next) {
  userdata.forEach((ele) => {
    var user = new User(
      {
        "oid": ele._id.$oid,
        "Firstname": ele.Firstname,
        "Lastname": ele.Lastname,
        "Email": ele.Email,
        "password": ele.password
      })
    user.save({
      "oid": ele._id.$oid,
      "Firstname": ele.Firstname,
      "Lastname": ele.Lastname,
      "Email": ele.Email,
      "password": ele.password
    }, function (err, doc) {
      if (err) {
        res.send('Error');
        res.json({ 'result': err });
        return next();
      } else {
        console.log(doc)//新增数据成功
        // res.json({ 'result': '新增数据成功' });
      }
    });
  })
  res.json({ 'result': '新增数据成功' });
});

module.exports = router;
