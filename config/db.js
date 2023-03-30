const mongoose = require('mongoose')

const connectDb = async()=>{
    const conn = await mongoose.connect("mongodb+srv://admin:password12345@cluster0.piptomc.mongodb.net/?retryWrites=true&w=majority"
        ,  
        {
            useNewUrlParser: true,
            useCreateIndex:true,
            useUnifiedTopology:false,
            useFindAndModify: true
        })

        console.log(`MongoDB connected : ${conn.connection.host}`.cyan.bold)
}

module.exports = connectDb;