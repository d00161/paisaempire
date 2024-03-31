
const mongoose = require('mongoose');

const rechargeSchenma = new mongoose.Schema({
    userId: { type: String, required: true},
    transactionId: {type: String, required: true, unique: true},
    status: {type: String, enum: ['PENDING', 'SUCCESS', 'FAILURE']},
    amount: {type: Number},
    version: { type: Number, default: 1 }
});

rechargeSchenma.pre('save', function (next) {
    this.version++;
    next();
});

const Recharge = mongoose.model('Recharge', rechargeSchenma);

module.exports = Recharge;
