import React from 'react';
import { Outlet } from 'react-router-dom';
import Footer from './Footer/Footer';
import Header from './Header/Header';

const MainLayout = () => {
  return (
    <>
      <Header />
      <main>
        {/* Nội dung của các trang con sẽ được render ở đây */}
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default MainLayout;