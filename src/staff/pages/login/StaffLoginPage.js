import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // --- BƯỚC 1: Import hook cần thiết ---
import './StaffLoginPage.css';

import logo from '../../../assets/images/logo-boxdoc.png';
import illustration from '../../../assets/images/medic-illustration.png';

const StaffLoginPage = () => {
  // --- BƯỚC 2: Tạo state để quản lý input và navigation ---
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // --- BƯỚC 3: Thêm logic đăng nhập giả lập ---
  const handleSubmit = (event) => {
    event.preventDefault();

    // Giả lập: Kiểm tra nếu username là 'letan' và password là '123'
    if (username === 'letan' && password === '123') {
      // Trong một ứng dụng thật, bạn sẽ nhận được thông tin user và token từ API
      // và lưu chúng vào Context hoặc Redux.
      
      // Ở đây, chúng ta chỉ cần điều hướng đến trang dashboard của lễ tân
      console.log('Đăng nhập thành công với vai trò Lễ tân!');
      navigate('/staff/le-tan/dashboard');

    } else {
      // Thông báo lỗi nếu đăng nhập sai
      alert('Tên đăng nhập hoặc mật khẩu không đúng!');
    }
  };

  return (
    <div className="staff-login-page">
      {/* --- Cột bên trái --- */}
      <div className="login-promo-section">
        <div className="promo-content">
          <img src={logo} alt="Boxdoc Logo" className="logo" />
          <h1>LOREM IPSUM</h1>
          <h2>Trust Family</h2>
          <p>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum
            has been the industry's standard dummy text ever since the 1500s.
          </p>
        </div>
        <img src={illustration} alt="Medical Illustration" className="illustration" />
      </div>

      {/* --- Cột bên phải (Form đăng nhập) --- */}
      <div className="login-form-section">
        <div className="login-card">
          <h2>Sign In</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Enter your Username</label>
              {/* --- BƯỚC 4: Kết nối state với các thẻ input --- */}
              <input 
                type="text" 
                id="username" 
                placeholder="Username" 
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Enter your Password</label>
              <input 
                type="password" 
                id="password" 
                placeholder="Password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="login-button">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StaffLoginPage;