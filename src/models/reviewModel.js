const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const reviewSchema = new mongoose.Schema(
    {
        bookId: {
            type: ObjectId,
            ref: 'Book',
            required: true
        },
        reviewedBy: {
            type: String,
            default: 'Guest',
            required: true,
            trim: true
        },
        reviewedAt: {
            type: Date,
            default: Date.now(),
            required: true
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        },
        review: {
            type: String
        },
        isDeleted: {
            type: Boolean,
            default: false
        },

    }, { timestamps: true })

module.exports = mongoose.model("review", reviewSchema)  
