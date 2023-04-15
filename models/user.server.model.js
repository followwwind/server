var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    oid: String,
    Firstname: String,
    Lastname: String,
    state: String,
    Email: String,
    password: String,
    description: String,
    datetime: String,
});

module.exports = UserSchema;