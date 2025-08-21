import React from 'react';
import Footer from './components/layout/Footer/Footer';
import Header from './components/layout/Header/Header';
import AppRoutes from './routes'; // Nhập cấu hình routes

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        {/* Nội dung trang sẽ được render ở đây */}
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
}

export default App;