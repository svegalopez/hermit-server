import { gql } from "apollo-server-core";

export const typeDefs = gql`
  type User {
    id: Int!
    email: String!
  }

  input UserInput {
    email: String!
  }

  type Query {
    users: [User!]!
  }

  type Mutation {
    createUser(user: UserInput!): User!
  }
`;