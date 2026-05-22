import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminScreen from './AdminScreen';
import DisplayScreen from './DisplayScreen';
import CashierScreen from './CashierScreen';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminScreen />} />
        <Route path="/cashier" element={<CashierScreen />} />
        <Route path="/" element={<DisplayScreen />} />
      </Routes>
    </BrowserRouter>
  );
}