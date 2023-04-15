const crypto = require('crypto');
const { Buffer } = require('buffer');
// ase-128-cbc 加密算法要求key和iv长度都为16
// 密匙
const SECRET_KEY = 'Fn3L7EDzjqWjcaY2'
const key = Buffer.from(SECRET_KEY, 'utf8');
const iv = Buffer.from(SECRET_KEY, 'utf8');
// 加密函数
function genPassword(password) {
  let sign = '';
  const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
  sign += cipher.update(password, 'utf8', 'hex');
  sign += cipher.final('hex');
  return sign;
}
// 解密函数
function exportPassword(password) {
  let src = '';
  const cipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
  src += cipher.update(password, 'hex', 'utf8');
  src += cipher.final('utf8');
  return src;
}
module.exports = {
  genPassword,
  exportPassword
}