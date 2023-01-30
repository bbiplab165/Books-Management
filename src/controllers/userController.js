userModel = require('../models/userModel')
const jwt = require("jsonwebtoken")

let createUser = async function (req, res) {
    try {
        const data = req.body;
        let { title, name, phone, email, password, address } = data;
        let emailRegex = /^([a-zA-Z0-9\._]+)@([a-zA-Z0-9])+.([a-z]+)(.[a-z]+)?$/;
        let phoneRegex = /^[0]?[6789]\d{9}$/;
        let nameRegex = /^[a-zA-Z ]+$/;
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "Request body cannot be empty" })
        }
        if (!title) {
            return res.status(400).send({ status: false, message: "title is mandatory" })
        }
        const isValidTitle = (title) => {
            const arr = 
                ["Mr", "Mrs", "Miss"]
            return arr.includes(title)
        }
        if (!isValidTitle(title)) {
            return res.status(400).send({ status: false, message: "title is invalid" })
        }
        if (!name) {
            return res.status(400).send({ status: false, message: "name is mandatory" });
        }
        if (name.length == 0 || !(nameRegex.test(name))) {
            return res.status(400).send({ status: false, message: "name should be valid name" })
        }
        if (!phone) {
            return res.status(400).send({ status: false, message: "phone is mandatory" })
        }
        if (!phoneRegex.test(phone)) {
            return res.status(400).send({ status: false, message: "phone no should be valid" })
        }
        const data1 = await userModel.findOne({ phone: phone });
        if (data1) {
            return res.status(400).send({ status: false, message: "phone number is already present in College DB" })
        }
        if (!email) {
            return res.status(400).send({ status: false, message: "email is mandatory" })
        }
        if (!emailRegex.test(email)) {
            return res.status(400).send({ status: false, message: "email is invalid" })
        }
        const data2 = await userModel.findOne({ email: email });
        if (data2) {
            return res.status(400).send({ status: false, message: "email is already present in College DB" })
        }
        if (!password) {
            return res.status(400).send({ status: false, message: "password is mandatory" })
        }
        if (!(password.length >= 8 && password.length <= 15)) {
            return res.status(400).send({ status: false, message: "password should be valid" })
        }
        
        const savedData = await userModel.create(data);
        return res.status(201).send({ status: true, data: savedData })
    } catch (error) {
        res.status(500).send({ msg: error.message });
    }
}


const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) { return false }
    if (typeof value === 'string' && value.trim().length == 0) { return false }
    return true
}

//              >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const loginUser = async function (req, res) {
    try {
        let data = req.body;
        let { email, password } = data


        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, msg: "User credentials body empty!!" })

        if (!isValid(email)) return res.status(400).send({ status: false, msg: "email !" })
        if (!isValid(password)) return res.status(400).send({ status: false, msg: "password !!" })

        let findUser = await userModel.findOne({ email, password })
        if (!findUser) return res.status(401).send({ status: false, msg: "Invalid login credentials" })

        let userId = findUser._id.toString()

        const token = jwt.sign({
            userId:userId
        }, 'booksManagementGroup32', { expiresIn: '1h' });


        return res.status(200).send({ status: true, msg: "User logged in succesfully", data: token})

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }


}


module.exports = { loginUser };


module.exports.createUser = createUser;




const authori=async function(req,res,next)
{
    const auth=req.decodedtoken.userId
    const userId=req.params.userId
    if(auth!==userId)
    {
        return res.status(400).send({status:false,msg:"Not authorised"})
    }
    else {
        next()
    }
}