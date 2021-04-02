const mongoose = require("mongoose");
const Campground = require("../models/campground.js");
const Review = require("../models/review.js");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

mongoose.connect("mongodb://localhost:27017/yelp-camp", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connected to mongodb");
    }).catch(() => {
        console.log("ERROR - Could not connect to mongodb");
    })

const sample = arr => arr[Math.floor(Math.random() * arr.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    await Review.deleteMany({});
    for (let i = 0; i < 100; i++) {
        const rand1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            title: `${sample(descriptors)} ${sample(places)}`,
            author: "6059fcbaa4c7d02934443ceb",
            images: [
                {
                        "url" : "https://res.cloudinary.com/bfcloudstorage/image/upload/v1615308199/YelpCamp/petn7ow2cjelrq776oks.jpg",
                        "filename" : "YelpCamp/petn7ow2cjelrq776oks"
                },
                {
                        "url" : "https://res.cloudinary.com/bfcloudstorage/image/upload/v1615308200/YelpCamp/livuienxc0lixfvalbkc.jpg",
                        "filename" : "YelpCamp/livuienxc0lixfvalbkc"
                }
                    ],
            description: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Magni, cupiditate laborum? Repellendus laboriosam consequuntur atque necessitatibus sequi, magni velit ducimus corrupti, officiis architecto tempore vitae repellat nulla similique. Eum, cupiditate?Possimus maiores delectus minus repellendus iste soluta quo perspiciatis sint eum repudiandae commodi quas aperiam nobis cumque laudantium, ipsa ut praesentium sapiente earum porro, illum, iure modi debitis est? Nostrum. Aspernatur maxime quas suscipit natus debitis expedita ipsam repellat provident minus! Facilis, officia culpa? Nihil nemo iure mollitia minus deserunt sequi nesciunt quis. Placeat iure laborum atque perferendis debitis. Doloremque.',
            price: Math.floor(Math.random() * 90) + 10,
            location: `${cities[rand1000].city}, ${cities[rand1000].state}`,
            geometry: {
                type: 'Point',
                coordinates: [cities[rand1000].longitude,cities[rand1000].latitude]
            },

        })
        await camp.save();
    }
}


seedDB().then(() => {
    mongoose.connection.close()
});

