const { ApolloServer, gql } = require('apollo-server');
const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const pool = require('./config/database');

const main = async () => {
    try {
        //making db connection
        const { rows } = await pool.query('SELECT NOW()');
        console.log("🚀  Pg running: Executing SELECT NOW() -> ", rows);

        const server = new ApolloServer(
            {
                typeDefs,
                resolvers,
                context: req => ({
                    pool,
                    headers:req.req.headers
                })
            });
        
        //running server 
        server.listen().then(({ url }) => {
            console.log(`🚀  Server ready at ${url}`);
        });
    }
    catch (err) {
        console.log("Sth wrong with db connection: ERROR: ", err);
    }
}
main();