const jwt = require("jsonwebtoken")
const bookModel = require("../models/bookModel")
const { isValidObjectId } = require("mongoose")

const authentication = function (req, res, next) {
    try {
        let token = req.headers["x-api-key"]
        if (!token)
            return res.status(400).send({ status: false, msg: "Token must be present" })
        jwt.verify(token, "booksManagementGroup32", (error, decodedToken) => {
            if (error) {
                const msg = error.message === "jwt expired" ? "JWT is expired" : "invalid JWT"
                return res.status(403).send({ status: false, msg: msg })
            }
            req.decodedToken = decodedToken
            next()
        }
        )
    } catch (err) {
        return res.status(500).send({ msg: err.message })
    }
}

const authorization = async function (req, res, next) {
    try {
        const authorId = req.decodedToken.userId
        const bookId = req.params.bookId
        if (bookId) {
            if (!isValidObjectId(bookId)) {
                return res.status(400).send({ status: false, msg: "bookId is not valid" })
            }
            const bookData = await bookModel.findById(bookId)
            if (!bookData)
                return res.status(400).send({ status: false, msg: "invalid bookId" })
            const booksAutherId = bookData.userId.toString()
            if (booksAutherId !== authorId) {
                return res.status(400).send({ status: false, msg: "Not authorized" })
            }
            next()
        }

        if (!bookId) {
            if (req.body.userId !== authorId) {
                return res.status(400).send({ status: false, msg: "Not authorized" })
            }
            next()
        }
    } catch (err) {
        return res.status(500).send({ msg: err.message })
    }
}

module.exports = { authentication, authorization }
