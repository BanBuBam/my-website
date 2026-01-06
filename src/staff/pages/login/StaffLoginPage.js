import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StaffLoginPage.css';
import { staffAuthAPI } from '../../../services/api';
import { FiHeart, FiUserCheck, FiLock, FiEye, FiEyeOff, FiLogIn, FiActivity } from 'react-icons/fi';

const StaffLoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Role to route mapping
  const getRoleRoute = (roles) => {
    if (!roles || roles.length === 0) return '/staff/dashboard';

    const role = roles[0]; // Get first role
    const roleRoutes = {
      'DOCTOR': '/staff/bac-si/dashboard',
      'NURSE': '/staff/dieu-duong/dashboard',
      'LAB_TECH': '/staff/ky-thuat-vien/dashboard',
      'PHARMACIST': '/staff/duoc-si/dashboard',
      'RECEPTIONIST': '/staff/le-tan/dashboard',
      'CASHIER': '/staff/tai-chinh/dashboard',
      'MANAGER': '/staff/quan-ly/dashboard',
      // 'ADMIN': '/staff/hr/dashboard',
      'ADMIN': '/staff/admin/dashboard',
      'HR_MANAGER': '/staff/hr/dashboard'
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

        // Get the first role
        const role = claims.roles && claims.roles.length > 0 ? claims.roles[0] : null;

        // Store tokens based on role
        if (role === 'ADMIN' || role === 'HR_MANAGER') {
          // HR/Admin uses hrAccessToken
          localStorage.setItem('hrAccessToken', accesstoken);
          localStorage.setItem('hrRefreshToken', refreshtoken);
        } else if (role === 'CASHIER') {
          // Finance uses financeAccessToken
          localStorage.setItem('financeAccessToken', accesstoken);
          localStorage.setItem('financeRefreshToken', refreshtoken);
        } else if (role === 'LAB_TECH') {
          // Pharmacist uses pharmacistAccessToken
          localStorage.setItem('labtechAccessToken', accesstoken);
          localStorage.setItem('labtechRefreshToken', refreshtoken);
        } else if (role === 'PHARMACIST') {
          // Pharmacist uses pharmacistAccessToken
          localStorage.setItem('pharmacistAccessToken', accesstoken);
          localStorage.setItem('pharmacistRefreshToken', refreshtoken);
        } else {
          // Other roles use staffAccessToken
          localStorage.setItem('staffAccessToken', accesstoken);
          localStorage.setItem('staffRefreshToken', refreshtoken);
        }

        // Store user info and employeeAccountId
        localStorage.setItem('staffUserInfo', JSON.stringify(claims));
        localStorage.setItem('employeeAccountId', employeeAccountId);
        localStorage.setItem('employeeId', claims.employeeId);

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
      <div className="login-form-section">
        <div className="login-header">
          <div className="logo-container">
            <FiHeart className="logo-icon" />
          </div>
          <div className="logo-text">
            <h1 className="hospital-name">Trinitycare Hospital</h1>
          </div>
        </div>

        <div className="form-content">
          <div className="form-title">
            <h2>Đăng nhập</h2>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Tên đăng nhập</label>
              <div className="input-wrapper">
                <FiUserCheck className="input-icon" />
                <input
                  type="text"
                  id="username"
                  placeholder="Nhập tên đăng nhập"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Nhập mật khẩu"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              <FiLogIn className="button-icon" />
              <span>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</span>
            </button>
          </form>
        </div>

        <div className="login-footer">
          <p>© 2025 Trinitycare Hospital</p>
        </div>
      </div>
    </div>
  );
};

export default StaffLoginPage;