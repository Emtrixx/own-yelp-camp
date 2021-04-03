const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require('./review');

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload','/upload/w_200');
})

const options = { toJSON: {virtuals: true}};

const CampgroundSchema = new Schema({
    title: String,
    images: [ ImageSchema ],
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
}, options);

CampgroundSchema.virtual('properties.popUpText').get(function () {
    return `<h5>${this.title}</h5><p><strong>${this.price}€ per night</strong><p>${this.description.substring(0,100)}...</p></p><a class='btn btn-sm btn-info' href='/campgrounds/${this._id}'>View</a>`;
})

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        });
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);