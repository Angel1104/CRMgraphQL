const { ApolloServer}=require('apollo-server');
const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');

const conectarDB = require('./config/db')

// conectar a la ddb
conectarDB() 

// servidor
const server = new ApolloServer({
    typeDefs,
    resolvers,
    
});

// arracar server
server.listen().then( ({url})=> {
    console.log(`Servidor listo en la URL ${url}`)
})