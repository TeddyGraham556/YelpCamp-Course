const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;


const ImageSchema = new Schema({
    url: String,
    filename: String,
})

// the virtual allows us to grab the url from the DB and change the string but it is not stored in the db*it is just retrieved from the db and altered and not stored*
//'thumbnail' is a new property now
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
})

const opts = { toJSON: { virtuals: true } }

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        }
    },
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    reviews: [
        // This object ID is coming from the review.js file we created to create in our MongoDB
        // This will be used to link the two
        {
            // Create Object ID to use between models
            type: Schema.Types.ObjectId,
            // ref is set to Review because this is the model in our DB
            ref: 'Review'
        }
    ]

}, opts)

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<a href="/campgrounds/${this.id}" target="_blank"><b>${this.title}</b></a>
    <p>${this.description.substring(0, 25)}...</p > `
})


// Deleting the Campground when the Delete button is pressed for Campground
//Middleware
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('campground', CampgroundSchema);