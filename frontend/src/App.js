import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './Dashboard';
import BarChartView from './components/BarChartView';
import Bidar from './components/Bidar';
import Shahapur from './components/Shahapur';
import './App.css'; // Make sure you import your CSS
import Gulbarga from './components/Gulbarga';
import EV from './components/EV';

function App() {
  const location = useLocation();

  return (
    <div className="app">
      <header className="header">
        Manickbag Gulbarga Dashboard
      </header>

      <div className="main-content">
        <nav className="navbar">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Data</Link>
          <Link to="/bar-chart" className={location.pathname === '/bar-chart' ? 'active' : ''}>Green Form</Link>
          <Link to="/gulbarga" className={location.pathname === '/gulbarga' ? 'active' : ''}>Gulbarga</Link>
          <Link to="/bidar" className={location.pathname === '/bidar' ? 'active' : ''}>Bidar</Link>
          <Link to="/shahapur" className={location.pathname === '/shahapur' ? 'active' : ''}>Shahapur</Link>
          <Link to="/ev" className={location.pathname === '/ev' ? 'active' : ''}>EV</Link>
        </nav>

        <div className="routes-container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/bar-chart" element={<BarChartView />} />
            <Route path="/gulbarga" element={<Gulbarga />} />
            <Route path="/bidar" element={<Bidar />} />
            <Route path="/shahapur" element={<Shahapur />} />
            <Route path="/ev" element={<EV />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
