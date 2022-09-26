import { gql } from "apollo-server-core";

export const typeDefs = gql`
  type User {
    id: Int!
    email: String!
  }

  type Query {
    users: [User!]!
  }
`;