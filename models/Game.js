
const mongoose = require('mongoose');

const gameSchenma = new mongoose.Schema({

    gameId: {type: String, required: true},
    startTime: {type: String, required: true},
    endTime: {type: String, required: true},
    status: {type: String, enum: ["ACTIVE", "STOPPED", "CLOSED"]},
    result: {type: [Number]},
    ticketAmount: {
        type: {
            "silver": {type: Number, required: true},
            "gold": {type: Number, required: true},
            "diamond": {type: Number, required: true}
        },
        required: true
    },
    winners: {type: [
        {
            "gameType": {type: String, enum: ["SILVER", "GOLD", "PLATINUM"]},
            "winner": {type: String}
        }
    ]},

});

gameSchenma.pre('save', function (next) {
    this.version++;
    next();
});

const Game = mongoose.model('Game', gameSchenma);

module.exports = Game;
