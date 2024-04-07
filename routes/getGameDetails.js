
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
    const userDetails = await User.findOne({_id: req.user.id})
    const gameHistory = await GameHistory.findOne({userId: req.user.id, gameId: game.id}) 
    
    res.json({ game, gameHistory, userDetails });

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



router.post('/createGame', authenticate, async (req, res)=>{


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

router.post('/getLatestGames', async (req, res)=>{
    const games = await Game.find().sort({$natural:-1}).limit(10);
    res.send({games})
})

router.post('/stopGame', async (req, res)=>{

    let game = await Game.findOne({_id:req.body.gameId});
    game.status="STOPPED"
    game = await game.save();
    res.send(game)
})


router.post('/closeGame', async (req, res)=>{

    let game = await Game.findOne({_id:req.body.gameId});
    if(game){

        game.status="CLOSED";

        const gameHistory = await GameHistory.find({gameId: game._id})

        console.log(gameHistory.length)
        let silverPlayed = new Array(10).fill(0);
        let goldPlayed = new Array(10).fill(0);
        let diamondPlayed = new Array(10).fill(0);





        for (const history of Object.values(gameHistory)){
            for(let i in history.playedOptions.silver){
                silverPlayed[i]+=history.playedOptions.silver[i]
            }
            for(let i in history.playedOptions.gold){
                goldPlayed[i]+=history.playedOptions.gold[i]
            }
            for(let i in history.playedOptions.diamond){
                diamondPlayed[i]+=history.playedOptions.diamond[i]
            }
        }




        let silverWinner = 0, goldWinner=0, diamondWinner =0
        for(let i in silverPlayed){
            if(silverPlayed[silverWinner]>silverPlayed[i]){
                silverWinner=i
            }
        }
        for(let i in goldPlayed){
            if(goldPlayed[goldWinner]>goldPlayed[i]){
                goldWinner=i
            }
        }
        for(let i in diamondPlayed){
            if(diamondPlayed[diamondWinner]>diamondPlayed[i]){
                diamondWinner=i
            }
        }


        for (const history of Object.values(gameHistory)){

            if(history.status==="UPDATED"){
                continue;
            }
            

            let amount = history.playedOptions.silver[silverWinner]*game.ticketAmount.silver
            amount+=history.playedOptions.gold[goldWinner]*game.ticketAmount.gold
            amount+=history.playedOptions.diamond[diamondWinner]*game.ticketAmount.diamond
            

            

            // TODO: add a check if the result has been updated for the user. it can fail in case of running this second times



            try{
                let user = await User.findOne({_id: history.userId})
                user.balance+=amount
                history.status="UPDATED"
                await history.save()
                user.save()
            } catch(e){

                console.log("failed to save for user : " + history.userId)
            }

        }





        for (const history of Object.values(gameHistory)){
            console.log(history)
        }



        game = await game.save();
        res.send({game, silverPlayed, goldPlayed, diamondPlayed, gameHistory})
    }
    else{
        res.send("invalid game");
    }
    
})




module.exports = router;