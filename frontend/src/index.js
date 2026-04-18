import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Toaster } from 'react-hot-toast';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          borderRadius: '12px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          fontWeight: '500',
        },
        success: { style: { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' } },
        error:   { style: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' } },
      }}
    />
  </React.StrictMode>
);
