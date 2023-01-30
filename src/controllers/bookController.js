const { isValidObjectId } = require("mongoose")
const moment = require("moment")
const bookModel = require("../models/bookModel")
const reviewModel=require("../models/reviewModel")

const isbnRegex = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/

const Regex = /^([A-Za-z ]+){3,}$/

const isValid = function (value) {
    if (typeof value === "undefined" || value === "null") return false;

    if (typeof value === 'string' && value.trim().length === 0) return false

    return true;
}


const createBook = async function (req, res) {
    try {
        const data = req.body
        let { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = data

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, msg: "No data provided" })
        }

        if (!isValid(title) || !Regex.test(title)) {
            return res.status(400).send({ status: false, msg: "please provide valid title" })
        }

        if (!isValid(excerpt)) {
            return res.status(400).send({ status: false, msg: "please provide valid excerpt" })
        }

        if (!isValidObjectId(userId) || !userId) {
            return res.status(400).send({ status: false, msg: "Please provide valid userId" })
        }

        if (!isValid(ISBN) || !isbnRegex.test(ISBN)) {
            return res.status(400).send({ status: false, msg: "please provide valid ISBN" })
        }

        if (!isValid(category) || !Regex.test(category)) {
            return res.status(400).send({ status: false, msg: "please provide valid category" })
        }

        if (!isValid(subcategory) || !Regex.test(subcategory)) {
            return res.status(400).send({ status: false, msg: "please provide valid subcategory" })
        }
        if (!releasedAt || !moment(releasedAt, "YYYY-MM-DD", true).isValid()) {
            return res.status(400).send({ status: false, msg: "date is not present or date format is not valid  " })
        }

        const duplicateData = await bookModel.findOne({ $or: [{ title: title }, { ISBN: ISBN }] })
        if (duplicateData) {
            return res.status(400).send({ status: false, msg: "title or ISBN is already given" })
        }

        const createData = await bookModel.create(data)

        return res.status(201).send({ status: true, msg: "Success", data: createData })
    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}

const getBooks = async function (req, res) {
    try {
        const data = req.query
        const { userId, category, subcategory } = data
        let filter = { isDeleted: false }

        if (category) { filter.category = category }
        if (userId) { filter.userId = userId }
        if (subcategory) { filter.subcategory = subcategory }

        const bookData = await bookModel.find(filter).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 }).sort({ title: 1 })
        if (bookData.length == 0) {
            return res.status(404).send({ status: false, msg: "No books found" })
        }

        return res.status(200).send({ status: true, msg: 'Success', data: bookData })
    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}

const updateBook = async function (req, res) {
    try {
        const bookId = req.params.bookId
        const data = req.body
        const { title, excerpt, ISBN, releasedAt } = data
        const updateObject = {}

        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, msg: "please provide valid Id" })
        }

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, msg: "No data is provided" })
        }

        const bookData = await bookModel.findById(bookId)

        if (!bookData) {
            return res.status(404).send({ status: false, msg: "There is no book with this Id" }) 
        }

        if (bookData.isDeleted == true) {
            return res.status(404).send({ status: false, msg: "could not find any book" })
        }

        if (title || ISBN) {
            const duplicateKey = await bookModel.findOne({ $or: [{ title: title }, { ISBN: ISBN }] })
            if (duplicateKey) {
                return res.status(400).send({ status: false, msg: " title or ISBN already exist" })
            }
        }

        if (title || title == "") {
            if (!isValid(title) || !Regex.test(title)) {
                return res.status(400).send({ status: false, msg: "please provide valid title" })
            }
            updateObject.title = title
        }

        if (excerpt || excerpt == "") {
            if (!isValid(excerpt)) {
                return res.status(400).send({ status: false, msg: "please provide valid excerpt" })
            }
            updateObject.excerpt = excerpt
        }

        if (ISBN || ISBN == "") {
            if (!isValid(ISBN) ) {
                return res.status(400).send({ status: false, msg: "please provide valid ISBN" })
            }
            updateObject.ISBN = ISBN
        }

        if (releasedAt || releasedAt == "") {
            if (!releasedAt || !moment(releasedAt, "YYYY-MM-DD", true).isValid()) {
                return res.status(400).send({ status: false, msg: "date format is not valid  " })  
            }
            updateObject.releasedAt = releasedAt
        }

        const updatedBook = await bookModel.findByIdAndUpdate(
            bookId,
            { $set: updateObject },
            { new: true }
        )
        return res.status(200).send({ status: true, msg: "Data is successfully updated", data: updatedBook })
    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}

const getBookById = async (req, res) => {  
    try {
        let id = req.params.bookId;

        if (!isValidObjectId(id))
            return res.status(400).send({ status: false, message: "-----Book id is not valid, Please try again----->" })

        let bookData = await bookModel.findOne({ _id: id, isDeleted: false }).select({ __v: 0 })

        if (!bookData)
            return res.status(404).send({ status: false, msg: "---no documents found---->" })

        let reviews = await reviewModel.find({bookId: id,isDeleted: false}).select({ _id: 0, __v: 0 })
        let result = bookData.toObject()
        result.reviewsData = reviews;

        res.send({ status: true, message: 'Book list', data: result});
    } catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
}


const deleteBook = async function (req, res) {
    try {
        let BookId = req.params.bookId;

        if (!isValidObjectId(BookId)) return res.status(400).send({ status: false, msg: "Please enter valid Book Id,it should be of 24 digits" })
        const id = await bookModel.findOne({ _id: BookId })
        if (!id) return res.status(403).send({ status: false, msg: "this book is not present!!" })

        let checkBook = await bookModel.findOne({ _id: BookId, isDeleted: false })
        if (!checkBook) return res.status(404).send({ status: false, msg: "No book present with this book Id or is already deleted" })

        await bookModel.findOneAndUpdate({ _id: BookId }, { isDeleted: true, deletedAt: new Date() }, { new: true })
        return res.status(200).send({ status: true, msg: "Book deleted successfully!!" })
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

module.exports = { createBook, getBooks, updateBook, getBookById, deleteBook,isValid }




