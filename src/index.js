import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import Loyalty from './Loyalty';
import Visualization from './Visualization.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" Component={App} />
        <Route path="/loyalty" Component={Loyalty} />
        <Route path="/visualization" Component={Visualization} />
      </Routes>
    </Router>
  </React.StrictMode>
);


