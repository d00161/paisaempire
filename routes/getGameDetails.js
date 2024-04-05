
const express = require('express');
const authenticate = require('../middleware/authenticate');

const User = require('../models/User');
const Game = require('../models/Game');
const GameHistory = require('../models/GameHistory');

const router = express.Router();

router.post('/getGameDetails', authenticate, async (req, res) => {
    console.log(req.user)

    const game = await Game.findOne({status: "ACTIVE"})
    const gameHistory = await GameHistory.findOne({userId: req.user.username, gameId: game.id}) 
    
    res.json({ game, gameHistory });

});

router.post('/playGame', authenticate, async(req, res) => {
    const { username, gameId, playedOptions } = req.body;
    
    const previousGame = await GameHistory.findOne({userId: username, gameId})
    const user = await User.findOne({userId: username});
    const game = await Game.findOne({_id:gameId});

    if(!game){

        res.send("no game available");
    }

    const totalAmount = 0.0;
    totalAmount+=playedOptions.silver.length*(game.ticketAmount.silver)
    totalAmount+=playedOptions.gold.length*(game.ticketAmount.gold)
    totalAmount+=playedOptions.diamond.length*(game.ticketAmount.diamond)

    const remainingAmount = totalAmount-previousGame.totalAmount;
    let userDetails, gameHistory;
    if(remainingAmount<user.balance){
        user.balance-=remainingAmount;

        const gameHistory = new GameHistory({
            gameId,
            userId: username,
            playedOptions,
            totalAmount: totalAmount
        });

        // TODO: to persist this using transaction
        userDetails=await user.save();
        gameHistory = await gameHistory.save();
    }
    res.send({userDetails, gameHistory});

})



router.post('/createGame', async (req, res)=>{

    console.log(req.body);

    const activeGame = await Game.findOne({status: "ACTIVE"});
    if(activeGame!=null){
        activeGame.status = "CLOSED";
        activeGame.save();
    }

    console.log("activeGame")
    console.log(activeGame);
    // console.log()
    
    const {gameId, startTime, endTime, ticketAmount} = req.body;
    const game = new Game({
        gameId,
        startTime,
        endTime,
        status: "ACTIVE",
        ticketAmount: ticketAmount
    });
    const activegame = await game.save();
    res.send(activegame);
});


module.exports = router;