
const mongoose = require('mongoose');

const gameHistorySchenma = new mongoose.Schema({
    // userId: { type: String, required: true},
    // transactionId: {type: String, required: true, unique: true},
    // status: {type: String, enum: ['PENDING', 'SUCCESS', 'FAILURE']},
    // amount: {type: Number},
    // approvedBy: {type: String},
    // version: { type: Number, default: 1 },

    gameId: {type: String, required: true},

    userId: {type: String, required: true},

    playedOptions: {
        type: {
            silver: {
                type: [String]
            },
            gold: {
                type: [String]
            },
            diamond: {
                type: [String]
            }
        }
    },
    
    totalAmount: {type: Number},
    

});

gameHistorySchenma.pre('save', function (next) {
    this.version++;
    next();
});

const GameHistory = mongoose.model('GameHistory', gameHistorySchenma);

module.exports = GameHistory;
