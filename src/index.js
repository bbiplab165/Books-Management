const express = require('express');
const route = require("./routes/route")
const mongoose  = require('mongoose');

const multer=require("multer")
const app = express();


app.use(express.json())

app.use(multer().any())


mongoose.connect("mongodb+srv://izazsarkar11:pQ1xcwJzAI5R7SC6@izazlithium.7ghyokt.mongodb.net/project32Database", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )

app.use('/', route);



app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});
