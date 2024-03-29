const express = require('express');

const registerRoute = require('./routes/register');
const loginRoute = require('./routes/login');

const jwt = require('jsonwebtoken');
const User = require('./models/User');


const db = require('./db');
const authenticate = require('./middleware/authenticate');

const app = express();
const port = 3000;


app.use(express.json());



app.use('/register', registerRoute);
app.use('/login', loginRoute);


app.get('/test', authenticate, async (req, res) => {

    const user = await User.findOne({ _id: req.user.id });
    console.log(req.user.id)

    console.log(user)

    res.json({ message: 'Protected route accessed successfully', user: req.user, userDetails: user });
});

app.get('/', (req, res)=>{
  res.send("This api is for testing.");
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});