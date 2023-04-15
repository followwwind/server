var express = require('express');
var router = express.Router();
//创建model，这个地方的ch_user对应mongodb数据库中ch_users的conllection。
//mongoose会自动改成复数，如模型名：xx―>xxes, kitten―>kittens, money还是money
var mongoose = require('mongoose');
var articleSchema = require('../models/article.server.model');
var article = mongoose.model('article', articleSchema);//创建mongoose下model对象
var UserSchema = require('../models/user.server.model');
var User = mongoose.model('User', UserSchema);//创建mongoose下model对象
var userdata = require('./../public/userlist.json');
var moment = require('moment');
/* 文件上传 */
var { uploadFile } = require('./../middles/uploadFile');
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});
/* 查询所有数据 */
router.get('/find', function (req, res, next) {
  article.find(function (err, docs) {
    if (err) {
      console.log('Error:');
      return next();
    }
    res.json(docs);
  });
});
/* 查询指定用户文章数据 */
router.post('/finduserArticle', function (req, res, next) {

  article.find(
    {
      id: req.body._id
    }, function (err, docs) {
      if (err) {
        console.log('Error:');
        return next();
      }
      res.json(docs);
    });
});
/* 查询指定文章数据 */
router.post('/findArticle', function (req, res, next) {

  article.findOne(
    {
      _id: req.body._id
    }, function (err, docs) {
      if (err) {
        console.log('Error:');
        return next();
      }
      res.json(docs);
    });
});
/* 添加文章 */
/* 增 */
router.post('/addarticle', uploadFile, function (req, res, next) {
  var list = new article({
    title: req.body.title,
    description: req.body.description,
    uid: req.body.uid,
    mainpng: req.body.photo,
    datetime: moment().format('YYYY-MM-DD'),
  });
  list.save({
    title: req.body.title,
    description: req.body.description,
    uid: req.body.uid,
    mainpng: req.body.photo,
    datetime: moment().format('YYYY-MM-DD'),
  }, function (err, doc) {
    if (err) {
      // console.log('Error:');
      // return next();
      res.json({
        ret: '001',
        message: 'add article fail',
        data: err
      });
    } else {
      res.json({
        ret: '000',
        message: 'success',
        data: doc
      });
    }
  });
  // res.json({'result':'无结果'});
});
/* 查询指定id用户的文章信息和用户信息 */
router.post('/articleUserData', function (req, res, next) {
  article.aggregate([
    { $match: { uid: req.body._id } },
    {
      $lookup: {
        from: "users",
        let: { uid: { $toObjectId: "$uid" } },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$uid"] } } },
          { $project: { oid: 1, Firstname: 1, Lastname: 1, Email: 1 } }
        ],
        as: "user_data"
      }
    }
  ], function (err, result) {
    console.log(result);
    res.json(result);
  });

});
/* 查询所有文章信息 */
router.get('/articleList', function (req, res, next) {
  article.aggregate([
    {
      $lookup: {
        from: "users",
        let: { uid: { $toObjectId: "$uid" } },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$uid"] } } },
          { $project: { oid: 1, Firstname: 1, Lastname: 1, Email: 1 } }
          // { $project: { oid: 1, Firstname: 1, Lastname: 1, Email: 1, password: 1, description: 1, datetime: 1 } }
        ],
        as: "user_data"
      }
    }
  ], function (err, result) {
    if (err) throw err; // 错误处理

    console.log(result);
    res.json(result);
  });

});
/* 删除商品 */
router.delete("/articleDelete", (req, res) => {
  console.log(req.body._id)
  article.findOneAndDelete({ _id: req.body._id })
    .then(state => {
      res.json({
        ret: '000',
        message: 'deleted success',
        data: state
      });
    })
    .catch(err => {
      res.json({
        ret: '001',
        message: 'deleted error',
        data: err
      });
    });
});
/* 修改文章 */
router.put("/articleChange", uploadFile, (req, res) => {
  console.log(req.body._id)

  const changedata = {
    title: req.body.title,
    description: req.body.description
  }
  if (req.body.photo != '') {
    changedata.mainpng = req.body.photo;
  }
  article.findOneAndUpdate(
    { _id: req.body.uid },
    {
      $set: changedata
    },
    {
      new: true
    }
  )
    .then(state => res.json({ 'result': state }))
    .catch(err => res.json(err));
});

/* =============================== */


/* =============================== */
/* 付款 */
router.post('/pay', function (req, res, next) {
  let data = JSON.parse(req.body.goods);
  console.log(data)
  data.forEach((ele) => {
    article.findOneAndUpdate(
      //   { _id: req.params.id },
      { _id: ele.uid },
      {
        $set: {
          stock: ele.stock - ele.sum,
        }
      }
    )
      .then(state => {
        console.log('success')
      })
      .catch(err => {
        console.log('error')
      });
  })

  res.json({ code: '000', 'result': 'success' });
});
/* 初始化增加数据到数据库 */
router.get('/add', function (req, res, next) {
  userdata.forEach((ele) => {
    var article = new article(
      {
        "title": ele.title,
        "brand": ele.brand,
        "image": ele.image,
        "stock": ele.stock,
        "seller": ele.seller,
        "price": ele.price,
        "reviews": JSON.stringify(ele.reviews),
        "disabled": ele.disabled,
      })
    article.save({
      "title": ele.title,
      "brand": ele.brand,
      "image": ele.image,
      "stock": ele.stock,
      "seller": ele.seller,
      "reviews": JSON.stringify(ele.reviews)
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
