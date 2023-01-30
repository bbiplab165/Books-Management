const express = require('express');
const router = express.Router();
const aws= require("aws-sdk")
const userController = require("../controllers/userController")
const bookController = require("../controllers/bookController")
const reviewController=require('../controllers/reviewController')
const mw=require('../middlewares/auth')

router.post('/register', userController.createUser)
router.post('/login', userController.loginUser)
router.post("/books",mw.authentication, bookController.createBook)
router.get("/books",mw.authentication,bookController.getBooks)
router.put("/books/:bookId",mw.authentication,mw.authorization,bookController.updateBook)
router.get('/books/:bookId',mw.authentication,bookController.getBookById)
router.delete("/books/:bookId",mw.authentication,mw.authorization,bookController.deleteBook)
router.post('/books/:bookId/review',reviewController.createReview)
router.put('/books/:bookId/review/:reviewId', reviewController.updateReview)
router.delete('/books/:bookId/review/:reviewId', reviewController.deleteReview)


aws.config.update({
    accessKeyId: "AKIAY3L35MCRZNIRGT6N",
    secretAccessKey:"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",
    region: "ap-south-1"
})

let uploadFile= async ( file) =>{
   return new Promise( function(resolve, reject) {
    let s3= new aws.S3({apiVersion: '2006-03-01'});

    var uploadParams= {
        ACL: "public-read",
        Bucket: "classroom-training-bucket",  //HERE
        Key: "abc/" + file.originalname, //HERE 
        Body: file.buffer
    }


    s3.upload( uploadParams, function (err, data ){
        if(err) {
            return reject({"error": err})
        }
        console.log(data)
        console.log("file uploaded succesfully")
        return resolve(data.Location)
    })
})
}

router.post("/write-file-aws", async function(req, res){

    try{
        let files= req.files
        if(files && files.length>0){
            let uploadedFileURL= await uploadFile( files[0] )
            res.status(201).send({msg: "file uploaded succesfully", data: uploadedFileURL})
        }
        else{
            res.status(400).send({ msg: "No file found" })
        }
        
    }
    catch(err){
        res.status(500).send({msg: err})
    }
    
})

router.all("/*", function (req, res) {
    return res.status(404).send({ status: false, message: "Page Not Found" })  
})

module.exports = router; 