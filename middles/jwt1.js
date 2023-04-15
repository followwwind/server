var { unless } = require("express-unless");
const jwt = require("jsonwebtoken");/* 用于生成JWT字符串 */
const key = 'hello'
function getUserState (req, res, next) {
  console.log('req', req.headers.authorization)
  let userinfo = jwt.decode(req.headers.authorization, key);
  console.log(userinfo)
  // 这次错误是由 token 解析失败导致的
  if (err.name === "UnauthorizedError") {
    // next();
    return res.json({ ret: 401, message: '登录信息有误，请重新登录' });
  } else {
    next();
  }
  // res.send({
  //   status: 500,
  //   message: "未知的错误",
  // });
}
module.exports = {
  getUserState: getUserState
};