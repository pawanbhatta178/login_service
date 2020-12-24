const { gql } = require('apollo-server');
const typeDefs = gql`
  type User {
    name: String!
    email: String!
    id: Int
  }
  input UserCreateInput {
  email: String!
  name: String!
  password: String!
}
input UserLoginInput {
  email: String!
  password: String!
}
type AuthPayLoad {
  token: String!
}

  type Query {
    users: [User]
  }
  type Mutation{
    signupUser(data:UserCreateInput!): AuthPayLoad!
    loginUser(data:UserLoginInput!): AuthPayLoad!
  }
`;
module.exports = typeDefs;