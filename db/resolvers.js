const Usuario = require('../models/Usuarios')
const Producto = require('../models/Producto')
const Pedido = require('../models/Pedido')
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

        obtenerClientes: async ()=>{
            try {
                const clientes = await Cliente.find({});
                return clientes
            } catch (error) {
                console.log(error)   
            }
        },

        obtenerClientesVendedor: async (_,{},ctx)=>{
            try {
                const clientes = await Cliente.find({vendedor: ctx.usuario.id.toString() });
                return clientes
            } catch (error) {
                console.log(error)   
            } 
        },

        obtenerCliente: async (_,{id},ctx)=>{

            // revisar si el cliente existe o no
            const cliente = await Cliente.findById(id);
            if(!cliente){
                throw new Error ('Cliente no encontrado');
            }

            //quien lo creo puede verlo
            if(cliente.vendedor.toString() !== ctx.usuario.id){
                throw new Error ('No tiene las credenciales del cliente');
            }

            return cliente;
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
        },

        nuevoCliente: async (_,{input},ctx)=>{
            const {id}=input
            //verificar si el cliente esta registrado

            const cliente = await Cliente.findOne({id});
            if(cliente){
                throw new Error ('Ese cliente ya esta registrado');
            }

            const nuevoCliente = new Cliente(input);

            //asignar el vendedor
            nuevoCliente.vendedor= ctx.usuario.id;

            //guardarlo en la bd
            try {
            const resultado = await nuevoCliente.save();
            return resultado;

            } catch (error) {
                console.log(error)
            }
        },

        actualizarCliente:async (_,{id, input},ctx)=>{
            // revisar si el cliente existe o no
            let cliente = await Cliente.findById(id);
            if(!cliente){
                throw new Error ('Ese cliente no existe');
            }

            //verificar si el vendedor es quien edita
            if(cliente.vendedor.toString() !== ctx.usuario.id){
                throw new Error ('No tiene las credenciales del cliente');
            }

            //guardar en la bd
            cliente = await Cliente.findOneAndUpdate({_id:id }, input, {new: true});

            return cliente;
        },

        eliminarCliente:async (_,{id},ctx)=>{
            // revisar si el cliente existe o no
            let cliente = await Cliente.findById(id);
            if(!cliente){
                throw new Error ('Ese cliente no existe');
            }

            //verificar si el vendedor es quien edita
            if(cliente.vendedor.toString() !== ctx.usuario.id){
                throw new Error ('No tiene las credenciales del cliente');
            }

            //eliminar en la bd
            await Cliente.findOneAndDelete({_id:id})

            return "Cliente eliminado";
        },

        nuevoPedido : async (_,{input},ctx)=>{

            const {cliente}=input

            //verificar si el cliente existe o no
            let clienteExiste = await Cliente.findById(cliente);
            if(!clienteExiste){
                throw new Error ('Ese cliente no existe');
            }

            //verificar si el cliente es el del vendedor
            if(clienteExiste.vendedor.toString() !== ctx.usuario.id){
                throw new Error ('No tiene las credenciales del cliente');
            }

            //revisar que el stock este disponible 
            for await(const articulo of input.pedido){
                const {id}=articulo;

                const producto = await Producto.findById(id);

                if (articulo.cantidad > producto.existencia){
                    throw new Error (`El articulo : #{producto.nomre} excede la cantidad disponible`)
                }else{
                    //Restar la cantidad a lo disponible
                    producto.existencia = producto.existencia-articulo.cantidad;

                    await producto.save();
                }
            };
            //crear un nuevo pedido
            const nuevoPedido = new Pedido(input);

            //asignarle un vendedor
            nuevoPedido.vendedor = ctx.usuario.id;

            //guardarlo en la bd
            const resultado = await nuevoPedido.save();

            return resultado;
        }
    }
} 

module.exports=resolvers;