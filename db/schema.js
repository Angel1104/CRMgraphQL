const {gql}=require('apollo-server');



//schema
const typeDefs = gql`

    type Usuario{
        id : ID
        nombre : String
        apellido: String
        email: String
        creado: String
    }

    type Token{
        token : String
    }

    type Producto{
        id:ID
        nombre : String
        existencia: Int
        precio: Float
        creado: String
    }

    type Cliente{
        id : ID
        nombre : String
        apellido: String
        empresa: String
        email: String
        celular: String
        creado: String
        vendedor: ID
    }

    input UsuarioInput {
        nombre : String!
        apellido: String!
        email: String!
        password: String!
    }

    input AutenticarInput{
        email: String!
        password : String!
    }

    input ProductoInput{
        nombre : String!
        existencia: Int!
        precio: Float!
    }

    input ClienteInput{
        nombre : String!
        apellido: String!
        empresa: String
        email: String
        celular: String!
    }

    type Query {

        #usuarios
        obtenerUsuario(token:String!): Usuario

        #productos
        obtenerProductos: [Producto]
        obtenerProducto(id:ID!): Producto
    }

    type Mutation {
        # Usuarios
        nuevoUsuario(input : UsuarioInput) : Usuario
        autenticarUsuario(input : AutenticarInput) : Token
        
        # Productos
        nuevoProducto(input: ProductoInput): Producto
        actualizarProducto(id:ID!, input: ProductoInput): Producto
        eliminarProducto(id:ID!): String

        # Clientes
        nuevoCliente(input : ClienteInput): Cliente
    }
`;

module.exports = typeDefs;