const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
})
mongoose.connection.once('open',()=>{
    console.log(`Connection has been made`)
}).on('error',(error)=>{
    console.log(`Error is : ${error}`)
})