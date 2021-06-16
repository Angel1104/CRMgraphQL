const mongoose = require('mongoose');

const ClientesSchema = mongoose.Schema({
    nombre:{
        type: String,
        required: true,
        trim: true
    },
    apellido:{
        type: String,
        required: true,
        trim: true
    },
    empresa:{
        type: String,
        trim: true,
        unique: true
    },
    celular:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        trim: true,
        unique:true
    },
    creado:{
        type: Date,
        default: Date.now()
    },
    vendedor:{
        type : mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'Usuario'
    }
});

module.exports = mongoose.model('Cliente', ClientesSchema);