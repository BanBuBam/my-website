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
      {/* Left Section: Login Form */}
      <div className="login-form-section">
        {/* Header/Logo */}
        <div className="login-header">
          <div className="logo-container">
            <FiHeart className="logo-icon" />
          </div>
          <div className="logo-text">
            <h1 className="hospital-name">Trinity Care</h1>
            <p className="hospital-subtitle">HOSPITAL</p>
          </div>
        </div>

        {/* Form Content */}
        <div className="form-content">
          <div className="form-title">
            <h2>Staff Portal</h2>
            <p>Secure access for medical professionals & staff.</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            {/* Employee ID Input */}
            <div className="form-group">
              <label htmlFor="username">Employee ID</label>
              <div className="input-wrapper">
                <FiUserCheck className="input-icon" />
                <input
                  type="text"
                  id="username"
                  placeholder="Ex: MD-8492"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="••••••••"
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

            {/* Submit Button */}
            <button type="submit" className="login-button" disabled={loading}>
              <FiLogIn className="button-icon" />
              <span>{loading ? 'Đang đăng nhập...' : 'Sign In securely'}</span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <p>© 2025 Trinity Care</p>
        </div>
      </div>

      {/* Right Section: Visual / Branding */}
      <div className="login-visual-section">
        {/* Abstract Background */}
        <div className="visual-background">
          <div className="gradient-blob gradient-blob-1"></div>
          <div className="gradient-blob gradient-blob-2"></div>
          <div className="gradient-blob gradient-blob-3"></div>
        </div>

        {/* Glassmorphism Card */}
        <div className="visual-content">
          <div className="glass-card">
            <div className="card-icon">
              <FiActivity />
            </div>

            <div className="card-text">
              <h2>Advanced Healthcare, Compassionate Touch.</h2>
              <p>
                Access patient records, shift schedules, and hospital resources efficiently.
                Securely serving over 5,000 staff members across all Trinity Care departments.
              </p>
            </div>

            {/* Stats */}
            <div className="card-stats">
              <div className="stat-item">
                <p className="stat-value">24/7</p>
                <p className="stat-label">System Support</p>
              </div>
              <div className="stat-item">
                <p className="stat-value">100%</p>
                <p className="stat-label">Data Encrypted</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffLoginPage;