
const express = require('express');
const authenticate = require('../middleware/authenticate');

const User = require('../models/User');
const Game = require('../models/Game');
const GameHistory = require('../models/GameHistory');

const router = express.Router();

router.post('/getGameDetails', authenticate, async (req, res) => {

    const game = await Game.findOne({status: "ACTIVE"})
    console.log(req.user)
    console.log(game)
    const gameHistory = await GameHistory.findOne({userId: req.user.id, gameId: game.id}) 
    
    res.json({ game, gameHistory });

});

router.post('/playGame', authenticate, async(req, res) => {

    try{

        let { gameId, playedOptions } = req.body;
        let user = await User.findOne({ _id: req.user.id });
        let gameHistory = await GameHistory.findOne({userId: user.id, gameId})
        let game = await Game.findOne({_id:gameId});

        if(!game){
            res.send("no game available");
        }

        let totalAmount = 0.0;
        playedOptions.silver.forEach(element => {
            console.log(element)
            totalAmount+=element*game.ticketAmount.silver
        });
        playedOptions.gold.forEach(element => {
            totalAmount+=element*game.ticketAmount.gold
        });
        playedOptions.diamond.forEach(element => {
            totalAmount+=element*game.ticketAmount.diamond
        });    
        let remainingAmount = totalAmount;
        if(gameHistory!=null){
            remainingAmount-=gameHistory.totalAmount
        }else{
            gameHistory = new GameHistory({
                gameId,
                playedOptions,
                userId: user.id,
                totalAmount
            });
        }
        
        if((user.balance-remainingAmount)>=0){
            user.balance-=remainingAmount;
            gameHistory.totalAmount=totalAmount;
            gameHistory.playedOptions=playedOptions

            // TODO: to persist this using transaction
            const updatedUser=await user.save();
            const updatedGameHistory = await gameHistory.save();
            res.send({game, updatedGameHistory});
        }else{

            res.send("insufficient balance");
        }

    }catch(e){
        res.send(e)
    }

})



router.post('/createGame', async (req, res)=>{


    const activeGame = await Game.findOne({status: "ACTIVE"});
    if(activeGame!=null){
        activeGame.status = "CLOSED";
        activeGame.save();
    }
    
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