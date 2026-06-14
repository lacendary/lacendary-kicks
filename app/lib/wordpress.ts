import { GraphQLClient } from "graphql-request";

export const client = new GraphQLClient(
  "https://cms.lacendarykicks.com/graphql"
);