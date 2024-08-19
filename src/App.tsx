import { gql, useLazyQuery } from '@apollo/client';
import React, { useState } from 'react';

// Define GraphQL query
const IS_EVEN_OR_ODD = gql`
  query IsEvenOrOdd($number: Int!) {
    isEvenOrOdd(number: $number)
  }
`;

// Define TypeScript interfaces (Add these at the top of your file)
interface IsEvenOrOddData {
    isEvenOrOdd: string;
}

interface IsEvenOrOddVars {
    number: number;
}

const App: React.FC = () => {
    const [number, setNumber] = useState<number>(0);

    // Use useLazyQuery with types
    const [getNumberInfo, { loading, data, error }] = useLazyQuery<IsEvenOrOddData, IsEvenOrOddVars>(IS_EVEN_OR_ODD);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        getNumberInfo({ variables: { number } });
    };

    return (
        <div className="App">
            <h1>Check if a number is Even or Odd</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="number"
                    value={number}
                    onChange={(e) => setNumber(Number(e.target.value))}
                />
                <button type="submit">Check</button>
            </form>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error.message}</p>}
            {data && <p>The number is {data.isEvenOrOdd}.</p>}
        </div>
    );
};

export default App;
