
const express = require('express');
const authenticate = require('../middleware/authenticate');

const User = require('../models/User');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
    console.log(req.user)
    const user = await User.findOne({ _id: req.user });
    
    res.json({ message: 'Protected route accessed successfully', user: req.user, user });

    
});

module.exports = router;
