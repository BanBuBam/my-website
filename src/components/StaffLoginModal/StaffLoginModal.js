import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StaffLoginModal.css';
import { staffAuthAPI } from '../../services/api';
import { FiX, FiUser, FiLock, FiAlertCircle } from 'react-icons/fi';

const StaffLoginModal = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Role to route mapping (same as StaffLoginPage)
  const getRoleRoute = (roles) => {
    if (!roles || roles.length === 0) return '/staff/dashboard';

    const role = roles[0]; // Get first role
    const roleRoutes = {
      'DOCTOR': '/staff/bac-si/dashboard',
      'NURSE': '/staff/dieu-duong/dashboard',
      'LAB_TECH': '/staff/ky-thuat-vien/dashboard',
      'PHARMACIST': '/staff/duoc-si/dashboard',
      'RECEPTIONIST': '/staff/le-tan/dashboard',
      'CASHIER': '/staff/ke-toan/dashboard',
      'MANAGER': '/staff/quan-ly/dashboard',
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
          localStorage.setItem('hrAccessToken', accesstoken);
          localStorage.setItem('hrRefreshToken', refreshtoken);
        } else if (role === 'CASHIER') {
          localStorage.setItem('financeAccessToken', accesstoken);
          localStorage.setItem('financeRefreshToken', refreshtoken);
        } else if (role === 'LAB_TECH') {
          localStorage.setItem('labtechAccessToken', accesstoken);
          localStorage.setItem('labtechRefreshToken', refreshtoken);
        } else if (role === 'PHARMACIST') {
          localStorage.setItem('pharmacistAccessToken', accesstoken);
          localStorage.setItem('pharmacistRefreshToken', refreshtoken);
        } else {
          localStorage.setItem('staffAccessToken', accesstoken);
          localStorage.setItem('staffRefreshToken', refreshtoken);
        }

        // Store user info and employeeAccountId
        localStorage.setItem('staffUserInfo', JSON.stringify(claims));
        localStorage.setItem('employeeAccountId', employeeAccountId);

        // Close modal and navigate to appropriate dashboard
        onClose();
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

  const handleClose = () => {
    setUsername('');
    setPassword('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="staff-login-modal-overlay" onClick={handleClose}>
      <div className="staff-login-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="staff-login-modal-header">
          <h2>Đăng nhập nhân viên</h2>
          <button className="close-btn" onClick={handleClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="staff-login-form">
          {error && (
            <div className="error-message">
              <FiAlertCircle />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="staff-username">
              <FiUser /> Tên đăng nhập
            </label>
            <input
              type="text"
              id="staff-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="staff-password">
              <FiLock /> Mật khẩu
            </label>
            <input
              type="password"
              id="staff-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="staff-login-footer">
          <p>Dành cho nhân viên bệnh viện</p>
        </div>
      </div>
    </div>
  );
};

export default StaffLoginModal;

