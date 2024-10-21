import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './styles/App.css';

const App = () => {
    return (
        <Router>
            <div className="App">
                <Routes>
                    {/* Route for login */}
                    <Route path="/login" element={<Login />} />

                    {/* Route for dashboard */}
                    <Route path="/" element={<Dashboard />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
