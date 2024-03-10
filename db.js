const mongoose = require('mongoose');
const { ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://dheeraj001:Mongodb16199@cluster0.xp7ljg7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


mongoose.connect(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
});