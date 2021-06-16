const Usuario = require('../models/Usuarios')
const Producto = require('../models/Producto')
const Cliente = require('../models/Clientes')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config({path:'variables.env'});

const crearToken =(usuario, secreta, expiresIn)=>{
    const {id, email, nombre, apellido} = usuario;
    
    return jwt.sign({id, email, nombre, apellido}, secreta, {expiresIn} )
}
//resolvers
const resolvers = {
    Query:{
        obtenerUsuario: async (_,{token})=> {
            const usuarioId = await jwt.verify(token, process.env.SECRETA)

            return usuarioId
        },

        obtenerProductos: async ()=>{
            try {
                const productos = await Producto.find({});
                return productos
            } catch (error) {
                console.log(error)   
            }
        },

        obtenerProducto: async (_,{id})=>{

            // revisar si el producto existe o no
            const producto = await Producto.findById(id);
            if(!producto){
                throw new Error ('Prodcuto no encontrado');
            }
            return producto;
        },
    },
    Mutation:{
        nuevoUsuario: async (_,{input})=> {

            const {email,password} = input;
            
            //Revisar si el usuario ya esta registrado
            const existeUsuario = await Usuario.findOne({email});
            if(existeUsuario){
                throw new Error('El usuario ya esta registrado')
            }

            //Hashear su password
            const salt = await bcryptjs.genSalt(10);
            input.password = await bcryptjs.hash(password, salt);

            try {
                //Guardarlo en la bd
                const usuario = new Usuario(input);
                usuario.save(); // guardarlo
                return usuario;

            } catch (error) {
                console.log(error)
            }
        },

        autenticarUsuario:async(_,{input})=>{

            const{email,password} = input

            //si el usuario existe
            const existeUsuario = await Usuario.findOne({email});
            if(!existeUsuario){
                throw new Error('El usuario no esta registrado');
            }

            //revisar password correcto
            const passwordCorrecto = await bcryptjs.compare(password, existeUsuario.password);
            if(!passwordCorrecto){
                throw new Error('La contrasena es incorrecta');
            }

            //crear el token
            return{
                token: crearToken(existeUsuario, process.env.SECRETA, '48h')
            }
        },

        nuevoProducto: async (_,{input})=>{
            try {
                const producto = new Producto(input);

                //almacenar bd
                const resultado = await producto.save();

                return resultado;
            } catch (error) {
                console.log(error)
            }
        },

        actualizarProducto: async (_,{id, input})=>{
            // revisar si el producto existe o no
            let producto = await Producto.findById(id);
            if(!producto){
                throw new Error ('Prodcuto no encontrado');
            }

            //guardar en la bd
            producto = await Producto.findOneAndUpdate({_id:id }, input, {new: true});

            return producto;
        },

        eliminarProducto: async(_,{id})=>{
            // revisar si el producto existe o no
            let producto = await Producto.findById(id);
            if(!producto){
                throw new Error ('Prodcuto no encontrado');
            }

            //eliminar producto
            await Producto.findOneAndDelete({_id:id})

            return "Producto eliminado";
        }
    }
} 

module.exports=resolvers;