import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CongressProvider } from './context/congressContext';
import App from './App';
import './index.css';
import { defineElement } from 'lord-icon-element';
import lottie from 'lottie-web';
defineElement(lottie.loadAnimation);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <CongressProvider>
        <App />
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </CongressProvider>
    </BrowserRouter>
  </React.StrictMode>
);
