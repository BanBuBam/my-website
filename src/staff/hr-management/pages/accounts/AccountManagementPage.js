import React, { useState, useEffect } from 'react';
import './AccountManagementPage.css';
import { hrAccountAPI } from '../../../../services/staff/hrAPI';
import { FiPlus, FiLock, FiUnlock, FiKey, FiSearch } from 'react-icons/fi';

const AccountManagementPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await hrAccountAPI.getAccounts();
      if (response.success) {
        setAccounts(response.data || []);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await hrAccountAPI.toggleAccountStatus(id);
      fetchAccounts();
    } catch (err) {
      alert('Lỗi khi thay đổi trạng thái tài khoản: ' + err.message);
    }
  };

  const handleResetPassword = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn reset mật khẩu cho tài khoản này?')) {
      try {
        await hrAccountAPI.resetPassword(id);
        alert('Reset mật khẩu thành công!');
      } catch (err) {
        alert('Lỗi khi reset mật khẩu: ' + err.message);
      }
    }
  };

  const filteredAccounts = accounts.filter(acc =>
    acc.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="account-management-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="account-management-page">
      <div className="page-header">
        <div>
          <h1>Quản lý Tài khoản Nhân viên</h1>
          <p className="page-subtitle">Quản lý tài khoản đăng nhập của nhân viên</p>
        </div>
        <button className="btn-primary">
          <FiPlus /> Tạo Tài khoản
        </button>
      </div>

      <div className="filter-section">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Tìm kiếm theo username, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>Lỗi: {error}</p>
        </div>
      )}

      <div className="table-container">
        <table className="account-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Họ và tên</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.length > 0 ? (
              filteredAccounts.map((account) => (
                <tr key={account.id}>
                  <td>{account.username || 'N/A'}</td>
                  <td>{account.email || 'N/A'}</td>
                  <td>{account.fullName || 'N/A'}</td>
                  <td>
                    <span className="role-badge">{account.role || 'N/A'}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${account.isActive ? 'active' : 'inactive'}`}>
                      {account.isActive ? 'Hoạt động' : 'Bị khóa'}
                    </span>
                  </td>
                  <td>{account.createdAt ? new Date(account.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className={`btn-icon ${account.isActive ? 'btn-lock' : 'btn-unlock'}`}
                        onClick={() => handleToggleStatus(account.id)}
                        title={account.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                      >
                        {account.isActive ? <FiLock /> : <FiUnlock />}
                      </button>
                      <button
                        className="btn-icon btn-reset"
                        onClick={() => handleResetPassword(account.id)}
                        title="Reset mật khẩu"
                      >
                        <FiKey />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">
                  Không tìm thấy tài khoản nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountManagementPage;

