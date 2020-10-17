const express = require('express');
require('./db/mongoose')
const userRoute = require('./routes/user')
const taskRoute = require('./routes/tasks')
const indexRoute = require('./routes/index')
const path = require('path')
const hbs = require('hbs')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.urlencoded({ extended: false}));
app.use(express.json())

const viewsPath = path.join(__dirname,'../templates/views')
const publicPath  = path.join(__dirname,'../public')

app.use(express.static(publicPath))

app.set('view engine','hbs')
app.set('views',viewsPath)

app.use(indexRoute)
app.use('/users',userRoute)
app.use('/tasks',taskRoute)

app.listen(PORT,()=>{
    console.log(`Server is Up and Running on Port ${PORT}`)
})