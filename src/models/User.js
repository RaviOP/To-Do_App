const mongoose = require('mongoose')
const validator = require('validator');
const Tasks = require('./Tasks')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is Invalid')
            }
        }
    },
    age: {
        type: Number,
        required: true,
        validate(value){
            if (value<0){
                throw new Error('Age Cannot be Negative')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        trim: true,
        validate(value){
            if (value.toLowerCase().includes('password')){
                throw new Error('Password Cannot contain "password"')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
},{
    timestamps: true
})


userSchema.virtual('tasks',{
    ref: 'Tasks',
    localField: '_id',
    foreignField: 'user'
})

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user=this
    const token = jwt.sign({_id: user._id.toString() },process.env.JWT_SECRET)

    //Saving Tokens in DataBase
    user.tokens = user.tokens.concat({ token: token})
    await user.save()

    return token
}

userSchema.statics.findByCredentials = async (email,password) => {
    const user = await User.findOne({email: email})
    if (!user) {
        throw new Error('Unable To Login')
    }
    const isMatched = await bcrypt.compare(password,user.password)
    if(!isMatched){
        throw new Error('Unable to Login')
    }

    return user;
}

//Hash The Plain text Password Before Saving
userSchema.pre('save',async function (next){
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,10)

    }
    next()
})

//Delete's User Tasks when user is deleted
userSchema.pre('remove',async function (next){
    const user = this
    await Tasks.deleteMany({ user: user._id})
    next()
})

const User = mongoose.model('User',userSchema)

module.exports = User