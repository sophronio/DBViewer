import React from 'react';
import ReactDOM from 'react-dom/client'; // Using the new createRoot API from React 18
import App from './App'; // Import the main App component
import './styles/App.css'; // Import global styles (optional)

const root = ReactDOM.createRoot(document.getElementById('root')); // Get the root element from index.html
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
