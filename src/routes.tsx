import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom'; 

import Home from './pages/Home';
import CreatePoint from './pages/CreatePoint';

const AppRoutes: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Home />} path="/" />
                <Route element={<CreatePoint />} path="/create-point"/> 
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;
