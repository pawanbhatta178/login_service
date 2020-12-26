const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { decodedToken } = require('./decodedToken');

    
    const resolvers = {
    Query: {
        users: async (root, args, {headers }) => { 
            const decoded = decodedToken(headers);
            return 
            [
                { ...decoded }
            ];
            
            },
        },
    Mutation: {
            signupUser: async (root, args,{headers}) => {
                const { data: { email, name, password } } = args;
                const newUser = {
                    email,
                    name,
                    password
                }
                return {token : jwt.sign(newUser, "supersecret")};
            },
            loginUser: async (root, args, { headers }) => {
                console.log(headers);
              const { data: { email, password } } = args;
            //   const [ theUser ] = await prisma.users({
            //     where: {
            //       email
            //     }
            //   })
            //   if (!theUser) throw new Error('Unable to Login');
            //   const isMatch = bcrypt.compareSync(password, theUser.password);
            //   if (!isMatch) throw new Error('Unable to Login');
                const theUser = {
                    email,
                    password
                }
              return {token : jwt.sign(theUser, "supersecret")};
            }
          }
    };
  module.exports = resolvers;