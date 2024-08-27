import {useLazyQuery, useMutation, useQuery} from '@apollo/client';
import React, {useCallback, useState} from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import {IS_EVEN_OR_ODD} from "./apollo/queries";
import {IsEvenOrOddQuery, QueryIsEvenOrOddArgs} from './apollo/types';  // The generated types

import HomePage from "./pages/HomePage/HomePage";
import {CREATE_JSON} from "./apollo/mutations";
import KVQI from "./pages/HomePage/KVQI_Vail_CO_88-5";

const App: React.FC = () => {
    const [number, setNumber] = useState<number>(0);

    // Use useLazyQuery with types
    const [getNumberInfo, { loading, data, error }] = useLazyQuery<IsEvenOrOddQuery, QueryIsEvenOrOddArgs>(IS_EVEN_OR_ODD);
    const [createJson] = useMutation(CREATE_JSON);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        getNumberInfo({ variables: { number:number } });
    };

    const [dataLoaded, setDataLoaded] = useState<boolean>(false);
    const handleDataUpdate = useCallback((data: string) => {
        setDataLoaded(true);
        createJson({ variables: { json:"hi" } });
    }, []);

    return (
        <Router>
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

                <KVQI onDataLoaded={handleDataUpdate}></KVQI>
                <p>{dataLoaded ? "Loaded" : "Not Loaded"}</p>
            </div>
            <Routes>
                <Route path="/home" element={<HomePage />} />
            </Routes>
        </Router>
    );
};

export default App;
