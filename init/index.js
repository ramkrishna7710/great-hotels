const mongoose = require("mongoose");
const initData = require("./data")
const Listing = require("../models/listing");

main()
    .then(()=>{
        console.log("✅ MongoDB Connected");
    })
    .catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/great_hotels');
}

const initDB = async()=>{
    await Listing.deleteMany({});

    initData.data = initData.data.map((obj)=> ({...obj, owner: '69a1e3ef56fc9a15a569d0e4'}))

    await Listing.insertMany(initData.data);
    console.log("data was initialized");
};
// initDB();