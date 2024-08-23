import { gql } from '@apollo/client';

export const IS_EVEN_OR_ODD = gql`
  query IsEvenOrOdd($number: Int!) {
    evenOrOdd(num: $number)
  }
`;