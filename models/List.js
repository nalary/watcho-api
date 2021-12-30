const mongoose = require('mongoose');

const ListSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true,
        },
        isSeries: { 
            type: Boolean,
            default: false,
        },
        genre: { type: String },
        content: { type: Array },
    }, 
    { timestamps: true }
);

module.exports = mongoose.model("List", ListSchema);