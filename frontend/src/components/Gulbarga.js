import React, { useState } from 'react';
import GulbargaCombined from './GulbargaCombined';
import GulbargaVijay from './GulbargaVijay';
import GulbargaSuraj from './GulbargaSuraj';
import './gulbarga.css';

function Gulbarga() {
  const [view, setView] = useState('combined');

return (
  <div className="gulbarga-container">
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginBottom: '20px',
      }}
    >
      <button
        onClick={() => setView('combined')}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#1d4ed8'; // hover dark blue
          e.target.style.color = 'white';
        }}
        onMouseLeave={(e) => {
          if (view !== 'combined') {
            e.target.style.backgroundColor = '#bfdbfe'; // light blue
            e.target.style.color = 'black';
          }
        }}
        style={{
          padding: '10px 16px',
          backgroundColor: view === 'combined' ? '#1d4ed8' : '#bfdbfe',
          color: view === 'combined' ? 'white' : 'black',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease, color 0.3s ease',
        }}
      >
        Gulbarga
      </button>

      <button
        onClick={() => setView('vijay')}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#1d4ed8';
          e.target.style.color = 'white';
        }}
        onMouseLeave={(e) => {
          if (view !== 'vijay') {
            e.target.style.backgroundColor = '#bfdbfe';
            e.target.style.color = 'black';
          }
        }}
        style={{
          padding: '10px 16px',
          backgroundColor: view === 'vijay' ? '#1d4ed8' : '#bfdbfe',
          color: view === 'vijay' ? 'white' : 'black',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease, color 0.3s ease',
        }}
      >
        Vijay
      </button>

      <button
        onClick={() => setView('suraj')}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#1d4ed8';
          e.target.style.color = 'white';
        }}
        onMouseLeave={(e) => {
          if (view !== 'suraj') {
            e.target.style.backgroundColor = '#bfdbfe';
            e.target.style.color = 'black';
          }
        }}
        style={{
          padding: '10px 16px',
          backgroundColor: view === 'suraj' ? '#1d4ed8' : '#bfdbfe',
          color: view === 'suraj' ? 'white' : 'black',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease, color 0.3s ease',
        }}
      >
        Suraj
      </button>
    </div>

    {view === 'combined' && <GulbargaCombined />}
    {view === 'vijay' && <GulbargaVijay />}
    {view === 'suraj' && <GulbargaSuraj />}
  </div>
);

}

export default Gulbarga;
