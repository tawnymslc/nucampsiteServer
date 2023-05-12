const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    admin: {
        type: Boolean,
        default: false
    }
});

// handles the user and password, removed from above schema
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);