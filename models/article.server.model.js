var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var article = new Schema({
    title: String,
    description: String,
    mainpng: String,
    uid: String,
    datetime: String,
});
module.exports = article;