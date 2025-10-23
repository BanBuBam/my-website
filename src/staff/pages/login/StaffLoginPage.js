import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StaffLoginPage.css';
import { staffAuthAPI } from '../../../services/api';

import logo from '../../../assets/images/logo-boxdoc.png';
import illustration from '../../../assets/images/medic-illustration.png';

const StaffLoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Role to route mapping
  const getRoleRoute = (roles) => {
    if (!roles || roles.length === 0) return '/staff/dashboard';

    const role = roles[0]; // Get first role
    const roleRoutes = {
      'DOCTOR': '/staff/bac-si/dashboard',
      'NURSE': '/staff/dieu-duong/dashboard',
      'LAB_TECH': '/staff/duoc-si/dashboard',
      'RECEPTIONIST': '/staff/le-tan/dashboard',
      'CASHIER': '/staff/ke-toan/dashboard',
      'MANAGER': '/staff/quan-ly/dashboard',
    };

    return roleRoutes[role] || '/staff/dashboard';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await staffAuthAPI.login(username, password);

      if (response && response.data) {
        const { accesstoken, refreshtoken, claims, employeeAccountId } = response.data;

        // Store tokens in localStorage
        localStorage.setItem('staffAccessToken', accesstoken);
        localStorage.setItem('staffRefreshToken', refreshtoken);

        // Store user info and employeeAccountId
        localStorage.setItem('staffUserInfo', JSON.stringify(claims));
        localStorage.setItem('employeeAccountId', employeeAccountId);

        // Navigate to appropriate dashboard based on role
        const route = getRoleRoute(claims.roles);
        navigate(route);
      } else {
        setError('Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Tên đăng nhập hoặc mật khẩu không đúng!');
    } finally {
      setLoading(false);
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

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Enter your Username</label>
              <input
                type="text"
                id="username"
                placeholder="Username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
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
                disabled={loading}
              />
            </div>
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StaffLoginPage;