const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://faktury12d:muXFffCMUoDK78vO@cluster0.ruwdljx.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB Atlas');
}).catch((error) => {
    console.error('Could not connect to MongoDB Atlas', error);
});

const GallerySchema = new mongoose.Schema({
    gallery: {
        nameGallery: {
            type: String,
            default: ""
        },
        photos: [{
            namePhoto: {
                type: String,
                default: ""
            },
            smallGallery: {
                type: Boolean,
                default: false
            },
            photoUrl: {
                type: String,
                default: ""
            },
        }]
    }

})

module.exports = mongoose.model("Gallery", GallerySchema);
