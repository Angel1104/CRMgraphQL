const mongoose = require('mongoose');
require('dotenv').config({path:'variables.env'});

const conectarDB = async ()=>{
    try {
        await mongoose.connect(process.env.DB_MONGO,{
            useNewUrlParser:true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex:true
        })
        console.log('DB coectada')
    } catch (error) {
        console.log('hubo un error en la coneccion con la DB');
        console.log(error);
        process.exit(1); // detener app
    }
}

module.exports = conectarDB;