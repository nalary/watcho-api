const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true,
        },
        desc: { type: String },
        img: {
            type: String,
            default: ""
        },
        imgSm: {
            type: String,
            default: ""
        },
        trailer: {
            type: String,
            default: ""
        },
        video: {
            type: String,
            default: ""
        },
        duration: {type: Number },
        year: { type: Number },
        rated: { 
            type: String,
            default: "G",
        },
        genre: { 
            type: String,
            default: "Action"
        },
        isSeries: {
            type: Boolean,
            default: false,
        },
    }, 
    { timestamps: true }
);

module.exports = mongoose.model("Movie", MovieSchema);