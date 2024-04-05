const express = require('express');

const registerRoute = require('./routes/register');
const loginRoute = require('./routes/login');
const rechargeRoute = require('./routes/recharge')
const gameHistoryRoute = require('./routes/getGameDetails')

const jwt = require('jsonwebtoken');
const User = require('./models/User');
var cors = require('cors')

const db = require('./db');
const authenticate = require('./middleware/authenticate');

const app = express();
app.use(cors());


const port = 3000;


app.use(express.json());






app.use('/register', registerRoute);
app.use('/login', loginRoute);
app.use('/recharge', rechargeRoute)
app.use('/', gameHistoryRoute)


app.get('/test', authenticate, async (req, res) => {

    const user = await User.findOne({ _id: req.user.id });
    console.log(req.user.id)

    console.log(user)

    res.json({ message: 'Protected route accessed successfully', user: req.user, userDetails: user });
});

app.get('/testget', (req, res)=>{
  res.send("This api is for testing get  request.");
});

app.post('/testpost', (req, res) => {
  const userDetails = {
    username: "testuser",
    mobile: "testmobile"
  }
  res.send(userDetails);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});