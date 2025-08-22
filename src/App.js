import React from 'react';
import AppRoutes from './routes'; // Nhập cấu hình routes

function App() {
  // Không còn Header và Footer ở đây nữa
  return (
    <div className="App">
      <AppRoutes />
    </div>
  );
}

export default App;