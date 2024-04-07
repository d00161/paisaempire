
const mongoose = require('mongoose');

const gameHistorySchenma = new mongoose.Schema({

    gameId: {type: String, required: true},

    userId: {type: String, required: true},

    playedOptions: {
        type: {
            silver: {
                type: [Number]
            },
            gold: {
                type: [Number]
            },
            diamond: {
                type: [Number]
            }
        }
    },
    
    totalAmount: {type: Number},

    status: {type: String}

});

gameHistorySchenma.pre('save', function (next) {
    this.version++;
    next();
});

const GameHistory = mongoose.model('GameHistory', gameHistorySchenma);

module.exports = GameHistory;
