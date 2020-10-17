 const express = require('express')
 const router = express.Router()
 const User = require('../models/User')
 const auth = require('../middleware/auth')
 const sharp = require('sharp')
 const multer = require('multer')

//All CRUD Operations

//SIGN-UP USERS
router.post('/',async(req,res)=>{
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201)
        res.send({user,token})
    } catch (error) {
        res.status(400)
        res.send(error)
    }
})

//LOGIN-USER
router.post('/login',async (req,res)=>{
    try {
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        
        res.send({user,token})
    } catch (error) {
        res.status(400).send(error.message)
    }
})

//LOGOUT-USER
router.post('/logout',auth,async (req,res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()

        res.status(200).send('Succesfully Logged Out')
    } catch (error) {
        res.status(500).send(error)
    }
})

//LOGOUT FROM ALL DEVICES
router.post('/logoutAll',auth,async(req,res)=>{
    try {
        req.user.tokens = []
        await req.user.save()

        res.status(200).send('Succesfully Logged Out From All Devices')
    } catch (error) {
        res.status(500).send(error)
    }
})

//READ USER
router.get('/me',auth,async(req,res)=>{
    res.send(req.user)
})

//UPDATE USER
router.patch('/me',auth,async(req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','email','password','age']
    const isValidOperation = updates.every((update)=>{
        return allowedUpdates.includes(update)
    })
    if (!isValidOperation){
        return res.status(400).send({
            Error: 'Invalid Updates'
        })
    }
    try {
        const user = await User.findById(req.user._id)
        updates.forEach((update)=>{
            user[update]=req.body[update]
        })
        await user.save()
        res.send(user)
    } catch (error) {
        res.status(500).send(error)
    }
})

//DELETE USER
router.delete('/me',auth,async(req,res)=>{
    try {
        const user = await User.findById(req.user._id)
        await user.remove()
        res.send(user)
    } catch (error) {
        res.status(500).send(error)
    }
})

//MULTER

const upload = multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter(req,file,cb){
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please Upload an Image'))
        }

        cb(undefined,true)
    }
})

router.post('/me/avatar',auth ,upload.single('avatar'),async (req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({width: 250,height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({Error: error.message})
})

router.delete('/me/avatar',auth,async(req,res)=>{
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.send('Deleted Profile picture Successfully')
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/:id/avatar',async (req,res)=>{
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar){
            throw new Error('Not Found')
        }
        res.set('Content-Type','image/png')
        res.send(user.avatar)
    } catch (error) {
        res.status(404).send(error)
    }
})

module.exports = router