const mongoose = require('mongoose');
const initData = require('./data.js');
const listing = require('../models/listing.js');

const MONO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.log("Error connecting to MongoDB:", err);
})

async function main() {
    await mongoose.connect(MONO_URL);
}

const initDB = async () => {
    await listing.deleteMany({});
   initData.data = initData.data.map((obj) => ({
        ...obj, 
        owner: "691000513187c962d583e15f"
    }))
    await listing.insertMany(initData.data);
    console.log("Data Imported Successfully");
}


initDB();