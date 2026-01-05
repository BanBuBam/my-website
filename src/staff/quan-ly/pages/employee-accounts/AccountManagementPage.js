import React, { useState, useEffect } from 'react';
import './AccountManagementPage.css';
import { adminAccountAPI } from '../../../../services/staff/adminAPI';
import { FiPlus, FiLock, FiKey, FiSearch, FiEye, FiEdit2, FiTrash2, FiFilter, FiUserCheck, FiUserX, FiX, FiCheckCircle, FiUsers } from 'react-icons/fi';
import AddEmployeeAccountModal from '../../components/AddEmployeeAccountModal';
import EditEmployeeAccountModal from '../../components/EditEmployeeAccountModal';
import ViewEmployeeAccountModal from '../../components/ViewEmployeeAccountModal';

const AccountManagementPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [allAccounts, setAllAccounts] = useState([]); // Lưu toàn bộ accounts cho statistics
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [usePagination, setUsePagination] = useState(true);

  useEffect(() => {
    fetchAccounts();
    fetchAllAccountsForStats(); // Fetch toàn bộ cho statistics
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, usePagination]);

  const fetchAllAccountsForStats = async () => {
    try {
      const response = await adminAccountAPI.getAccounts();
      console.log('📊 All accounts for stats:', response);

      if (response && response.data) {
        setAllAccounts(response.data);
      }
    } catch (err) {
      console.error('Error fetching all accounts for stats:', err);
    }
  };

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (usePagination) {
        // Sử dụng API pagination
        response = await adminAccountAPI.getAccountsPage(currentPage, pageSize);
        console.log('📊 Paginated accounts response:', response);

        if (response && response.data) {
          setAccounts(response.data.content || []);
          setTotalPages(response.data.totalPages || 0);
          setTotalElements(response.data.totalElements || 0);
        } else {
          setAccounts([]);
        }
      } else {
        // Lấy tất cả
        response = await adminAccountAPI.getAccounts();
        console.log('📊 All accounts response:', response);

        if (response && response.data) {
          setAccounts(response.data);
          setTotalElements(response.data.length);
        } else {
          setAccounts([]);
        }
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching accounts:', err);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (account) => {
    if (window.confirm(`Bạn có chắc chắn muốn kích hoạt tài khoản của ${account.fullName}?`)) {
      try {
        await adminAccountAPI.activateAccount(account.id);
        alert('Kích hoạt tài khoản thành công!');
        await fetchAccounts();
        await fetchAllAccountsForStats();
      } catch (err) {
        alert('Lỗi khi kích hoạt tài khoản: ' + err.message);
      }
    }
  };

  const handleDeactivate = async (account) => {
    if (window.confirm(`Bạn có chắc chắn muốn vô hiệu hóa tài khoản của ${account.fullName}?`)) {
      try {
        await adminAccountAPI.deactivateAccount(account.id);
        alert('Vô hiệu hóa tài khoản thành công!');
        await fetchAccounts();
        await fetchAllAccountsForStats();
      } catch (err) {
        alert('Lỗi khi vô hiệu hóa tài khoản: ' + err.message);
      }
    }
  };

  const handleResetPassword = async (account) => {
    const newPassword = prompt('Nhập mật khẩu mới (tối thiểu 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt):');

    if (newPassword) {
      // Validate password
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        alert('Mật khẩu không hợp lệ! Phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.');
        return;
      }

      try {
        await adminAccountAPI.resetPassword(account.id, newPassword);
        alert('Reset mật khẩu thành công!');
      } catch (err) {
        alert('Lỗi khi reset mật khẩu: ' + err.message);
      }
    }
  };

  const handleDelete = async (account) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản của ${account.fullName}? Hành động này không thể hoàn tác!`)) {
      try {
        await adminAccountAPI.deleteAccount(account.id);
        alert('Xóa tài khoản thành công!');
        await fetchAccounts();
        await fetchAllAccountsForStats();
      } catch (err) {
        alert('Lỗi khi xóa tài khoản: ' + err.message);
      }
    }
  };

  const handleViewDetails = async (account) => {
    try {
      const response = await adminAccountAPI.getAccountById(account.id);
      if (response && response.data) {
        setSelectedAccount(response.data);
        setShowViewModal(true);
      }
    } catch (err) {
      alert('Lỗi khi tải thông tin tài khoản: ' + err.message);
    }
  };

  const handleAddAccount = async (accountData) => {
    try {
      console.log('📝 Creating account');
      console.log('📝 Account data:', accountData);

      // Kiểm tra username đã tồn tại chưa
      const existingAccount = allAccounts.find(acc =>
        acc.username && acc.username.toLowerCase() === accountData.username.toLowerCase()
      );
      if (existingAccount) {
        alert(`Username "${accountData.username}" đã được sử dụng bởi ${existingAccount.fullName}. Vui lòng chọn username khác.`);
        throw new Error('Username đã tồn tại');
      }

      // Tạo tài khoản cho nhân viên
      console.log('🔄 Calling createAccountForExistingEmployee API...');
      const response = await adminAccountAPI.createAccountForExistingEmployee(accountData);
      console.log('✅ Create account response:', response);

      if (response && response.status === 'OK') {
        alert('Tạo tài khoản thành công!');
      } else {
        throw new Error(response?.message || 'Không thể tạo tài khoản');
      }

      // Refresh cả 2: paginated data và all accounts for stats
      await fetchAccounts();
      await fetchAllAccountsForStats();
    } catch (err) {
      console.error('❌ Error creating account:', err);
      console.error('❌ Error details:', {
        message: err.message,
        stack: err.stack,
        accountData: accountData
      });

      // Chỉ hiển thị alert nếu chưa hiển thị
      if (!err.message.includes('Username đã tồn tại')) {
        alert('Lỗi khi tạo tài khoản: ' + err.message);
      }
      throw err; // Re-throw để modal không đóng
    }
  };

  const handleEditAccount = async (accountId, accountData) => {
    try {
      console.log('✏️ Updating account with ID:', accountId);
      console.log('✏️ Account data:', accountData);
      console.log('✏️ Selected account object:', selectedAccount);

      // Tìm account để lấy employeeId
      const account = accounts.find(acc => acc.id === accountId) || selectedAccount;

      if (!account) {
        throw new Error('Không tìm thấy thông tin tài khoản');
      }

      console.log('✏️ Found account:', account);
      console.log('✏️ Employee ID from account:', account.employeeId);
      console.log('✏️ Current username:', account.username);
      console.log('✏️ New username:', accountData.username);

      // ✅ Kiểm tra username duplicate khi update (exclude account hiện tại)
      if (accountData.username && accountData.username.trim() !== account.username) {
        const existingAccount = allAccounts.find(acc =>
          acc.id !== accountId && // ✅ Exclude current account
          acc.username &&
          acc.username.toLowerCase() === accountData.username.trim().toLowerCase()
        );

        if (existingAccount) {
          alert(`Username "${accountData.username}" đã được sử dụng bởi ${existingAccount.fullName}. Vui lòng chọn username khác.`);
          throw new Error('Username đã tồn tại');
        }
      }

      // Sử dụng employeeId từ account object
      const employeeId = account.employeeId || accountId;

      const response = await adminAccountAPI.updateAccount(employeeId, accountData);
      console.log('✅ Update account response:', response);

      alert('Cập nhật tài khoản thành công!');
      await fetchAccounts();
      await fetchAllAccountsForStats();
    } catch (err) {
      console.error('❌ Error updating account:', err);

      // Chỉ hiển thị alert nếu chưa hiển thị
      if (!err.message.includes('Username đã tồn tại')) {
        alert('Lỗi khi cập nhật tài khoản: ' + err.message);
      }
      throw err; // Re-throw để modal không đóng
    }
  };

  // Filter accounts
  const filteredAccounts = accounts.filter(acc => {
    const matchSearch =
      acc.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchRole = !filterRole || (acc.roles && acc.roles.includes(filterRole));
    const matchStatus = !filterStatus ||
      (filterStatus === 'active' && acc.isActive && !acc.locked) ||
      (filterStatus === 'inactive' && !acc.isActive) ||
      (filterStatus === 'locked' && acc.locked);
    const matchDepartment = !filterDepartment || acc.department === filterDepartment;

    return matchSearch && matchRole && matchStatus && matchDepartment;
  });

  // Get unique roles and departments for filters
  const uniqueRoles = [...new Set(accounts.flatMap(acc => acc.roles || []))];
  const uniqueDepartments = [...new Set(accounts.map(acc => acc.department).filter(Boolean))];

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
          <p className="page-subtitle">Quản lý tài khoản đăng nhập của nhân viên ({accounts.length} tài khoản)</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <FiPlus /> Tạo Tài khoản
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-cards">
        <div className="stat-card active">
          <div className="stat-icon">
            <FiUserCheck />
          </div>
          <div className="stat-info">
            <h3>{allAccounts.filter(a => a.isActive && !a.locked).length}</h3>
            <p>Tài khoản hoạt động</p>
          </div>
        </div>
        <div className="stat-card inactive">
          <div className="stat-icon">
            <FiUserX />
          </div>
          <div className="stat-info">
            <h3>{allAccounts.filter(a => !a.isActive).length}</h3>
            <p>Tài khoản bị vô hiệu hóa</p>
          </div>
        </div>
        <div className="stat-card locked">
          <div className="stat-icon">
            <FiLock />
          </div>
          <div className="stat-info">
            <h3>{allAccounts.filter(a => a.locked).length}</h3>
            <p>Tài khoản bị khóa</p>
          </div>
        </div>
      </div>

      {/* FILTER SECTION - New design matching InventoryTransactionsPage */}
      <div style={{
        background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
        padding: '2rem',
        borderRadius: '16px',
        marginBottom: '1.5rem',
        boxShadow: '0 10px 30px rgba(14, 165, 233, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(30%, -30%)',
          pointerEvents: 'none'
        }}></div>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              padding: '0.75rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <FiFilter size={20} style={{ color: '#fff' }} />
            </div>
            <div>
              <h3 style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#fff',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                Bộ lọc tìm kiếm
              </h3>
              <p style={{
                margin: 0,
                fontSize: '0.85rem',
                color: 'rgba(255, 255, 255, 0.9)',
                marginTop: '0.25rem'
              }}>
                Tìm kiếm và lọc tài khoản theo các tiêu chí
              </p>
            </div>
          </div>

          {/* Filter Status Badge */}
          {(searchTerm || filterRole || filterStatus || filterDepartment) ? (
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              color: '#28a745',
              padding: '0.5rem 1rem',
              borderRadius: '25px',
              fontSize: '0.9rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              <FiCheckCircle size={16} />
              <span>Đang áp dụng bộ lọc</span>
            </div>
          ) : (
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              color: '#0ea5e9',
              padding: '0.5rem 1rem',
              borderRadius: '25px',
              fontSize: '0.9rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              <FiUsers size={16} />
              <span>Tất cả tài khoản</span>
            </div>
          )}
        </div>

        {/* Filter Content Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Search Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '2px solid #f0f0f0'
            }}>
              <FiSearch size={18} style={{ color: '#0ea5e9' }} />
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#2d3748' }}>
                Tìm kiếm
              </h4>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                <FiSearch size={14} style={{ color: '#0ea5e9' }} />
                Tìm theo tên, username, mã nhân viên
              </label>
              <input
                type="text"
                placeholder="Nhập từ khóa tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Filter Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '2px solid #f0f0f0'
            }}>
              <FiFilter size={18} style={{ color: '#0ea5e9' }} />
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#2d3748' }}>
                Phân loại
              </h4>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                  <FiUserCheck size={14} style={{ color: '#0ea5e9' }} />
                  Vai trò
                </label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">-- Tất cả vai trò --</option>
                  {uniqueRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                  <FiUserCheck size={14} style={{ color: '#0ea5e9' }} />
                  Trạng thái
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">-- Tất cả trạng thái --</option>
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Bị vô hiệu hóa</option>
                  <option value="locked">Bị khóa</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                  <FiUsers size={14} style={{ color: '#0ea5e9' }} />
                  Phòng ban
                </label>
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">-- Tất cả phòng ban --</option>
                  {uniqueDepartments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {(searchTerm || filterRole || filterStatus || filterDepartment) && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              paddingTop: '1rem',
              borderTop: '2px solid #f0f0f0'
            }}>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterRole('');
                  setFilterStatus('');
                  setFilterDepartment('');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: '#fff',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  color: '#4a5568',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <FiX size={16} />
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>⚠️ Lỗi: {error}</p>
        </div>
      )}

      <div className="table-container">
        <table className="account-table">
          <thead>
            <tr>
              <th>Mã NV</th>
              <th>Họ và tên</th>
              <th>Username</th>
              <th>Phòng ban</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Đăng nhập cuối</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.length > 0 ? (
              filteredAccounts.map((account) => {
                const isActive = account.isActive && !account.locked;
                const statusClass = account.locked ? 'locked' : (account.isActive ? 'active' : 'inactive');
                const statusText = account.locked ? 'Bị khóa' : (account.isActive ? 'Hoạt động' : 'Bị vô hiệu hóa');

                return (
                  <tr key={account.id}>
                    <td>
                      <span className="employee-code">{account.employeeCode || 'N/A'}</span>
                    </td>
                    <td>
                      <div className="employee-info">
                        <strong>{account.fullName || 'N/A'}</strong>
                        {account.specialization && (
                          <span className="specialization">{account.specialization}</span>
                        )}
                      </div>
                    </td>
                    <td>{account.username || 'N/A'}</td>
                    <td>{account.department || 'N/A'}</td>
                    <td>
                      <div className="roles-container">
                        {account.roles && account.roles.length > 0 ? (
                          account.roles.map((role, idx) => (
                            <span key={idx} className="role-badge">{role}</span>
                          ))
                        ) : (
                          <span className="role-badge">N/A</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${statusClass}`}>
                        {statusText}
                      </span>
                    </td>
                    <td>
                      {account.lastLogin ? (
                        <span className="last-login">
                          {new Date(account.lastLogin).toLocaleString('vi-VN')}
                        </span>
                      ) : (
                        <span className="no-login">Chưa đăng nhập</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-view"
                          onClick={() => handleViewDetails(account)}
                          title="Xem chi tiết"
                        >
                          <FiEye style={{ color: '#1976d2', width: '20px', height: '20px', strokeWidth: '2px', display: 'block' }} />
                        </button>
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => {
                            setSelectedAccount(account);
                            setShowEditModal(true);
                          }}
                          title="Chỉnh sửa"
                        >
                          <FiEdit2 />
                        </button>
                        {isActive ? (
                          <button
                            className="btn-icon btn-deactivate"
                            onClick={() => handleDeactivate(account)}
                            title="Vô hiệu hóa tài khoản"
                          >
                            <FiUserX />
                          </button>
                        ) : (
                          <button
                            className="btn-icon btn-activate"
                            onClick={() => handleActivate(account)}
                            title="Kích hoạt tài khoản"
                          >
                            <FiUserCheck />
                          </button>
                        )}
                        <button
                          className="btn-icon btn-reset"
                          onClick={() => handleResetPassword(account)}
                          title="Reset mật khẩu"
                        >
                          <FiKey />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(account)}
                          title="Xóa tài khoản"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="no-data">
                  {searchTerm || filterRole || filterStatus || filterDepartment
                    ? '🔍 Không tìm thấy tài khoản nào phù hợp với bộ lọc'
                    : '📭 Chưa có tài khoản nào'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {usePagination && totalPages > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            <span>
              Hiển thị {filteredAccounts.length > 0 ? (currentPage * pageSize + 1) : 0} - {Math.min((currentPage + 1) * pageSize, totalElements)} trong tổng số {totalElements} tài khoản
            </span>
          </div>

          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(0)}
              disabled={currentPage === 0}
            >
              ««
            </button>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
            >
              «
            </button>

            {/* Page numbers */}
            <div className="page-numbers">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (currentPage < 3) {
                  pageNum = i;
                } else if (currentPage > totalPages - 3) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
            </div>

            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage >= totalPages - 1}
            >
              »
            </button>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(totalPages - 1)}
              disabled={currentPage >= totalPages - 1}
            >
              »»
            </button>
          </div>

          <div className="page-size-selector">
            <label>Hiển thị:</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(0);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddEmployeeAccountModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddAccount}
      />

      <EditEmployeeAccountModal
        account={selectedAccount}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedAccount(null);
        }}
        onSubmit={handleEditAccount}
      />

      <ViewEmployeeAccountModal
        account={selectedAccount}
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedAccount(null);
        }}
      />
    </div>
  );
};

export default AccountManagementPage;


