import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/login/LoginPage';
import RegisterPage from '../pages/RegisterPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      {/* Bạn có thể thêm các routes khác ở đây */}
    </Routes>
  );
};

export default AppRoutes;