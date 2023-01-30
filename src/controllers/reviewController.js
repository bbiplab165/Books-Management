const { isValidObjectId } = require("mongoose");
const reviewModel = require("../models/reviewModel");
const moment = require('moment');
const bookModel = require("../models/bookModel");

const {isValid}=require("../controllers/bookController")
//=================================================== Creating Reviews ================================================= 

const createReview = async (req, res) => {
    try {

        let bookId = req.params.bookId
        let data = req.body
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, msg: "Please Provide Some Data" })
        }

        if (!bookId) {
            return res.status(400).send({ status: false, msg: "Please Provide BookId" })
        }
        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, msg: "Invalid BookId" })
        }
        let bookexist = await bookModel.findById(bookId)
        if (!bookexist) { return res.status(404).send({ status: false, msg: "No Book Found" }) }
        if (bookexist['isDeleted'] === true) { return res.status(400).send({ status: false, msg: "Book Has been Deleted" }) }

        data['bookId'] = bookId

        if (!data.rating) {
            return res.status(400).send({ status: false, msg: "Please Provide some rating" })

        }
        if (isNaN(data.rating)) {
            return res.status(400).send({ status: false, msg: "Please Enter Only Number in rating" })

        }
        if (data.rating < 1 || data.rating > 5) {
            return res.status(400).send({ status: false, msg: "Please rating btwn 1-5" })

        }
        if (!data.reviewedBy) {
            let reviewedBy = "Guest"
            data['reviewedby'] = reviewedBy
        }
        if (!data.review) {
            return res.status(400).send({ status: false, msg: "Please Tell Us About Ur Review For This Book" })
        }

        let date = Date.now()
        let reviewedAt = moment(date).format("YYYY-MM-DD, hh:mm:ss")
        data['reviewedAt'] = reviewedAt

        const reviewes = await reviewModel.create(data)
        const bookReviwes = await bookModel.findOneAndUpdate({ _id: data.bookId }, { $inc: { reviews: +1 } }, { new: true })

        let result = bookReviwes.toObject()
        result.reviewData = reviewes
        return res.status(201).send({ status: true, msg: "Reviewes Added Succesfully", data: result })

    } catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
}

const deleteReview = async function (req, res) {
    try {
        const bookId = req.params.bookId
        const reviewId = req.params.reviewId


        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, msg: "please provide valid book id" })
        }

        if (!isValidObjectId(reviewId)) {
            return res.status(400).send({ status: false, msg: "please provide valid review id" })
        }

        const reviewData = await reviewModel.findOne({ _id: reviewId, isDeleted: false })

        if (!reviewData) {
            return res.status(404).send({ status: false, msg: "could not find  any review" })
        }

        const bookData = await bookModel.findOne({ bookId: bookId, isDeleted: false })

        if (!bookData) {
            return res.status(404).send({ status: false, msg: "could not find any book" })
        }

        const deletedReview = await reviewModel.findByIdAndUpdate(
            reviewId,
            { $set: { isDeleted: true } }
        )

        const updatedBookByReview = await bookModel.findByIdAndUpdate(
            bookId,
            { $inc: { reviews: -1 } }
        )

        return res.status(200).send({ status: true, msg: "review is succesfully deleted" })
    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}
const updateReview = async function (req, res) {

    try {
        let bId = req.params.bookId;
        let rId = req.params.reviewId;
        let data = req.body;
        let { review, rating, reviewedBy } = data;
        let obj = {}

        if (!isValidObjectId(bId)) return res.status(400).send({ status: false, msg: "Invalid Book id in path params,book id shouls be of 24 digits" })

        let checkBook = await bookModel.findById(bId)
        if (!checkBook) return res.status(404).send({ status: false, msg: "No book found for this book id!!" })

        if (checkBook.isDeleted == true) return res.status(400).send({ status: false, msg: "Can't update review for this book as it is already deleted!" })

        if (!isValidObjectId(rId)) return res.status(400).send({ status: false, msg: "Invalid review id in path params,review id should be of 24 digits" })

        let checkReview = await reviewModel.findById(rId)
        if (!checkReview) return res.status(404).send({ status: false, msg: "No review found for the fiven book id!!" })

        if (checkReview.isDeleted == true) return res.status(400).send({ status: false, msg: "Cann't update review for this book as it is already deleted!" })

        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, msg: "Invalid parameters! Please provide data in request body to update review" })

        if (review) {
            if (!isValid(review)) return res.status(400).send({ status: false, msg: "Review is required and should be a valid string" })
            obj['review'] = review;   //  use for bracket notation
        }

        if (rating) {
            if (isNaN(rating)) return res.status(400).send({ status: false, msg: "Rating is mandatory and should be a valid integer value" })

            const rat = /^[1-5]$/.test(rating)
            if (rat == false) return res.status(400).send({ status: false, msg: "Rating should be in between 1 to 5" })
            obj.rating = rating;   // use for (. dot) notetion
        }


        if (reviewedBy) {
            if (!isValid(reviewedBy)) return res.status(400).send({ status: false, msg: "Reviewd by value should be present and a valid string" })
            obj.reviewedBy = reviewedBy;
        }


        let updatedReview = await reviewModel.findByIdAndUpdate({ _id: rId }, { $set: obj }, { new: true }).select({ __v: 0, isDeleted: 0 })

        let final = checkBook.toObject()
        final.rviewsData = updatedReview;

        return res.status(200).send({ status: true, msg: "Review updated successfully!", data: final })

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}


module.exports = {createReview,updateReview,deleteReview}
