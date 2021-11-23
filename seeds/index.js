const mongoose = require('mongoose');
const Campground = require('../models/campground')
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers')


//connect to mongo db
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true,
    //useCreateIndex: true,
    useUnifiedTopology: true
});

//Error handeling on the mongo db
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () => {
    console.log("Database connected")
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 20) + 10;

        const camp = new Campground({
            author: '6160bedfdb05e85150356455',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Basic text goes here',
            price,
            geometry: {
                "type": "Point",
                coordinates: [cities[random1000].longitude,
                cities[random1000].latitude],
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dhnvfvapo/image/upload/v1633900972/YelpCamp/pj7fyhm0gq5bnextbpm9.jpg',
                    filename: 'YelpCamp/pj7fyhm0gq5bnextbpm9',
                },
                {
                    url: 'https://res.cloudinary.com/dhnvfvapo/image/upload/v1633900973/YelpCamp/fa0k74d5rg1izofwfthr.jpg',
                    filename: 'YelpCamp/fa0k74d5rg1izofwfthr',
                },
                {
                    url: 'https://res.cloudinary.com/dhnvfvapo/image/upload/v1633900973/YelpCamp/yzbfcq3lblyyljszwmfl.jpg',
                    filename: 'YelpCamp/yzbfcq3lblyyljszwmfl',
                },
                {
                    url: 'https://res.cloudinary.com/dhnvfvapo/image/upload/v1633900973/YelpCamp/epecz5gr84uwmrcwakfv.jpg',
                    filename: 'YelpCamp/epecz5gr84uwmrcwakfv',
                },
                {
                    url: 'https://res.cloudinary.com/dhnvfvapo/image/upload/v1633900974/YelpCamp/z96cohbzhnvfqwxnqzzw.jpg',
                    filename: 'YelpCamp/z96cohbzhnvfqwxnqzzw',
                }
            ],
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})