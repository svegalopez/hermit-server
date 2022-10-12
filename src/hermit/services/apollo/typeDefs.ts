import { gql } from "apollo-server-core";

export const typeDefs = gql`
  type User {
    id: Int!
    email: String!
    roles: [Role!]
  }

  type Role {
    name: String!
  }

  input UserInput {
    email: String!
    password: String!
  }

  type Query {
    users: [User!]!
    currentUser: User!
  }

  type Mutation {
    createUser(user: UserInput!): User!
  }
`;