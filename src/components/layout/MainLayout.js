import React from 'react';
import { Outlet } from 'react-router-dom';

// Import lại Header, Footer và Sidebar
import Header from './Header/Header'; 
import Footer from './Footer/Footer';
import Sidebar from './sidebar/SideBar'; 
import './MainLayout.css'; 

const MainLayout = () => {
  return (
    <div className="app-layout">
      {/* 1. Header ở trên cùng */}
      <Header />

      {/* 2. Phần thân chính của trang */}
      <div className="app-body">
        {/* Cột bên trái là Sidebar */}
        <Sidebar />
        
        {/* Cột bên phải là nội dung trang, sử dụng thẻ <main> cho ngữ nghĩa */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>

      {/* 3. Footer ở dưới cùng */}
      <Footer />
    </div>
  );
};

export default MainLayout;