
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobile: {type: String},
    balance: {type: Number},
    version: { type: Number, default: 1 }
});

userSchema.pre('save', function (next) {
    this.version++;
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
