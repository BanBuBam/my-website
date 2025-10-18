import React, { useEffect } from 'react';
import AppRoutes from './routes'; // Nhập cấu hình routes
import { setupTokenRefresh } from './utils/tokenRefresh';

function App() {
  // Setup auto refresh token khi app khởi động
  useEffect(() => {
    const cleanup = setupTokenRefresh();

    // Cleanup khi component unmount
    return cleanup;
  }, []);

  return (
    <div className="App">
      <AppRoutes />
    </div>
  );
}

export default App;