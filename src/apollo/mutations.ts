import { gql } from '@apollo/client';

export const CREATE_USER = gql`
  mutation CreateUser($name: String!, $email: String!) {
    createUser(name: $name, email: $email) {
      id
      name
      email
    }
  }
`;

export const CREATE_JSON = gql`
  mutation CreateJson($json: String!) {
    createJson(json: $json)
  }
`;