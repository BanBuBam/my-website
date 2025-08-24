import React from 'react';
import './StaffLoginPage.css';

import logo from '../../../assets/images/logo-boxdoc.png';
import illustration from '../../../assets/images/medic-illustration.png';

const StaffLoginPage = () => {
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Form submitted');
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
              <input type="text" id="username" placeholder="Username" required />
            </div>
            <div className="form-group">
              <label htmlFor="password">Enter your Password</label>
              <input type="password" id="password" placeholder="Password" required />
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