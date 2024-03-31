// routes/login.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authenticate = require('../middleware/authenticate');

const mongoose = require('mongoose');
const Recharge = require('../models/Recharge');

const router = express.Router();

// router.post('/', authenticate, async (req, res) => {

//     const session = await mongoose.startSession();
//     session.startTransaction({ readConcern: { level: 'snapshot' }, writeConcern: { w: 'majority' } });
//     try {

//         let user = await User.findOne({_id: req.user.id}).session(session)
    
//         let receiver = await User.findOne({username: req.body.receiver}).session(session)

//         const amount = req.body.amount;

//         if(user.balance<amount){
//             throw error("user balance is not sufficient");
//         }


//         user.balance-=amount;
//         receiver.balance+=amount;
       
//         let uu = new User(user);
//         user = await uu.save();

//         uu = new User(receiver)
//         receiver = await uu.save();


//         await session.commitTransaction();
//         await session.endSession();


//         console.log(user);
//         console.log(receiver);


//         res.json(user)
//     } catch (error) {


//         console.log(error)
//         console.log("error aborting transaction")
//         await session.abortTransaction();
//         await session.endSession();
//         res.status(500).json({ message: 'Error logging in' });
//     }
// });



router.post('/', authenticate, async (req, res) => {

    const session = await mongoose.startSession();
    session.startTransaction({ readConcern: { level: 'snapshot' }, writeConcern: { w: 'majority' } });
    try {

        let user = await User.findOne({_id: req.user.id}).session(session)
    
        let recharge = new Recharge({
            userId: user._id,
            transactionId: req.body.transactionId,
            status: "PENDING",
            amount: req.body.amount
        });

        await recharge.save();

        await session.commitTransaction();

        await session.endSession();

        res.json(user)
    } catch (error) {


        await session.abortTransaction();
        await session.endSession();
        res.status(500).json({ message: 'Error logging in' });
    }
});

router.post('/approveTransaction', authenticate, async (req, res) => {


    const session = await mongoose.startSession();
    session.startTransaction({ readConcern: { level: 'snapshot' }, writeConcern: { w: 'majority' } });

    try {



        let user = await User.findOne({_id: req.user.id}).session(session);
        let recharge = await Recharge.findOne({_id: req.body.rechargeId});

        if(recharge.status != "PENDING"){
            throw error("can not approve this recharge");
        }

        recharge.status = "SUCCESS";
        recharge.approvedBy = user._id;
        let receiver = await User.findOne({_id: recharge.userId});
        receiver.balance += recharge.amount;


    

        console.log(recharge)

        await recharge.save();

        await receiver.save();



        await session.commitTransaction();

        await session.endSession();

        res.json(user)
    } catch (error) {


        await session.abortTransaction();
        await session.endSession();

        console.log(error)
        res.status(500).json({ message: 'Error logging in' });
    }
})

module.exports = router;
