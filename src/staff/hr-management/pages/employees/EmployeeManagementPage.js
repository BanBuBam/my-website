import React, { useState, useEffect } from 'react';
import './EmployeeManagementPage.css';
import { hrEmployeeAPI } from '../../../../services/staff/hrAPI';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiUserX, FiUserCheck } from 'react-icons/fi';
import AddEmployeeModal from '../../components/AddEmployeeModal';
import EditEmployeeModal from '../../components/EditEmployeeModal';
import Pagination from '../../../../components/Pagination';

const EmployeeManagementPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCode, setSearchCode] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [stats, setStats] = useState({
    totalCount: 0,
    activeCount: 0,
    deletedCount: 0
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [isFirst, setIsFirst] = useState(true);
  const [isLast, setIsLast] = useState(true);

  useEffect(() => {
    fetchEmployees();
    fetchStats();
  }, [currentPage]); // Re-fetch when page changes

  const fetchStats = async () => {
    try {
      const response = await hrEmployeeAPI.getEmployeeStats();
      console.log('Stats response:', response);

      if (response.data) {
        setStats({
          totalCount: response.data.totalCount || 0,
          activeCount: response.data.activeCount || 0,
          deletedCount: response.data.deletedCount || 0
        });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if token exists
      const token = localStorage.getItem('hrAccessToken');
      if (!token) {
        setError('Vui lòng đăng nhập để xem danh sách nhân viên');
        setEmployees([]);
        setLoading(false);
        return;
      }

      const response = await hrEmployeeAPI.getEmployees('', currentPage, pageSize);
      console.log('Employees response:', response);

      // Handle different response structures
      if (response.data) {
        // If data is an array
        if (Array.isArray(response.data)) {
          setEmployees(response.data);
          setTotalElements(response.data.length);
          setTotalPages(1);
        }
        // If data is an object with items/content property (paginated)
        else if (response.data.items) {
          setEmployees(response.data.items);
          setTotalElements(response.data.totalElements || response.data.items.length);
          setTotalPages(response.data.totalPages || 1);
        } else if (response.data.content) {
          setEmployees(response.data.content);
          // Extract pagination metadata
          setTotalElements(response.data.totalElements || 0);
          setTotalPages(response.data.totalPages || 1);
          setIsFirst(response.data.first !== undefined ? response.data.first : true);
          setIsLast(response.data.last !== undefined ? response.data.last : true);
        } else {
          setEmployees([]);
          setTotalElements(0);
          setTotalPages(1);
        }
      } else if (Array.isArray(response)) {
        setEmployees(response);
        setTotalElements(response.length);
        setTotalPages(1);
      } else {
        setEmployees([]);
        setTotalElements(0);
        setTotalPages(1);
      }
    } catch (err) {
      const errorMessage = err.message || 'Không thể tải danh sách nhân viên';
      setError(errorMessage);
      console.error('Error fetching employees:', err);
      setEmployees([]);

      // If authentication error, suggest login
      if (errorMessage.includes('đăng nhập')) {
        setTimeout(() => {
          if (window.confirm('Phiên đăng nhập đã hết hạn. Bạn có muốn đăng nhập lại?')) {
            window.location.href = '/staff/login';
          }
        }, 1000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setShowAddModal(true);
  };

  const handleEditEmployee = (employee) => {
    console.log('Selected employee for edit:', employee);
    console.log('Employee ID:', employee.id);
    console.log('Employee ID type:', typeof employee.id);
    setSelectedEmployee(employee);
    setShowEditModal(true);
  };

  const handleDeleteEmployee = async (id) => {
    try {
      // Ensure ID is clean (remove any extra characters)
      const cleanId = typeof id === 'string' ? id.split(':')[0] : id;
      console.log('Deleting employee with ID:', cleanId);

      const response = await hrEmployeeAPI.deleteEmployee(cleanId);
      console.log('Delete response:', response);

      if (response.code === 200 || response.status === 'OK') {
        alert('Xóa nhân viên thành công!');
        fetchEmployees();
        fetchStats(); // Refresh stats after delete
        setShowEditModal(false);
      } else {
        alert('Không thể xóa nhân viên');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Lỗi khi xóa nhân viên: ' + err.message);
    }
  };

  const handleSaveEmployee = async (employeeData) => {
    try {
      // Extract clean ID (remove any extra characters)
      const employeeId = selectedEmployee.id;
      console.log('Raw employee ID:', employeeId);
      console.log('Employee ID type:', typeof employeeId);

      // Ensure ID is a clean number
      const cleanId = typeof employeeId === 'string' ? employeeId.split(':')[0] : employeeId;
      console.log('Clean employee ID:', cleanId);
      console.log('Update data:', employeeData);

      const response = await hrEmployeeAPI.updateEmployee(cleanId, employeeData);
      console.log('Update response:', response);

      if (response.code === 200 || response.status === 'OK') {
        alert('Cập nhật nhân viên thành công!');
        fetchEmployees();
        fetchStats(); // Refresh stats after update
        setShowEditModal(false);
      } else {
        alert('Không thể cập nhật nhân viên');
      }
    } catch (err) {
      console.error('Update error:', err);
      alert('Lỗi: ' + err.message);
      throw err;
    }
  };

  const handleSubmitNewEmployee = async (employeeData) => {
    try {
      const response = await hrEmployeeAPI.createEmployee(employeeData);
      if (response.code === 200 || response.code === 201) {
        alert('Thêm nhân viên thành công!');
      }
      fetchEmployees();
      fetchStats(); // Refresh stats after create
      setShowAddModal(false);
    } catch (err) {
      alert('Lỗi: ' + err.message);
      throw err;
    }
  };

  const handleToggleEmployee = async (employee) => {
    const cleanId = typeof employee.id === 'string' ? employee.id.split(':')[0] : employee.id;
    const isEmployeeActive = employee.isActive; // Check data.isActive

    const action = isEmployeeActive ? 'vô hiệu hóa' : 'kích hoạt';
    const confirmMsg = `Bạn có chắc muốn ${action} nhân viên ${employee.employeeCode}?`;

    if (!window.confirm(confirmMsg)) {
      return;
    }

    try {
      let response;
      if (isEmployeeActive) {
        // If employee is active, deactivate
        response = await hrEmployeeAPI.deactivateEmployee(cleanId);
      } else {
        // If employee is inactive, activate
        response = await hrEmployeeAPI.activateEmployee(cleanId);
      }

      console.log('Toggle employee response:', response);

      if (response.code === 200 || response.status === 'OK') {
        alert(`${action.charAt(0).toUpperCase() + action.slice(1)} nhân viên thành công!`);
        fetchEmployees();
        fetchStats();
      } else {
        alert(`Không thể ${action} nhân viên`);
      }
    } catch (err) {
      console.error('Toggle employee error:', err);
      alert(`Lỗi khi ${action} nhân viên: ` + err.message);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build search params
      const searchParams = {};
      if (searchTerm) searchParams.name = searchTerm;
      if (searchCode) searchParams.code = searchCode;
      if (filterDepartment) searchParams.departmentId = filterDepartment;
      if (filterRole) searchParams.roleType = filterRole;

      // If no search params, fetch all employees
      if (Object.keys(searchParams).length === 0) {
        await fetchEmployees();
        return;
      }

      try {
        let response;

        // If searching by code only, use searchByCode API
        if (searchCode && !searchTerm && !filterDepartment && !filterRole) {
          response = await hrEmployeeAPI.searchByCode(searchCode);
        }
        // If searching by name only, use searchByName API
        else if (searchTerm && !searchCode && !filterDepartment && !filterRole) {
          response = await hrEmployeeAPI.searchByName(searchTerm);
        }
        // If searching by role only, use searchByRole API
        else if (filterRole && !searchTerm && !searchCode && !filterDepartment) {
          response = await hrEmployeeAPI.searchByRole(filterRole);
        }
        // If searching by department only, use searchByDepartment API
        else if (filterDepartment && !searchTerm && !searchCode && !filterRole) {
          response = await hrEmployeeAPI.searchByDepartment(filterDepartment);
        }
        // Otherwise use advanced search
        else {
          response = await hrEmployeeAPI.advancedSearch(searchParams);
        }

        console.log('Search response:', response);

        // Handle response - can be single object or array
        if (response.data) {
          // If data is a single object (search by code returns single employee)
          if (response.data.id && response.data.employeeCode) {
            setEmployees([response.data]); // Wrap in array
          }
          // If data is an array
          else if (Array.isArray(response.data)) {
            setEmployees(response.data);
          }
          // If data is an object with items/content property
          else if (response.data.items) {
            setEmployees(response.data.items);
          } else if (response.data.content) {
            setEmployees(response.data.content);
          } else {
            setEmployees([]);
          }
        } else if (Array.isArray(response)) {
          setEmployees(response);
        } else {
          setEmployees([]);
        }
      } catch (apiError) {
        // If API search fails, fallback to client-side filtering
        console.warn('API search failed, using client-side filtering:', apiError);
        setError('API tìm kiếm gặp lỗi, đang sử dụng tìm kiếm cục bộ...');

        // Fetch all employees first if not already loaded
        if (employees.length === 0) {
          await fetchEmployees();
        }

        // Client-side filtering will be applied by filteredEmployees
        setTimeout(() => setError(null), 3000); // Clear error after 3s
      }
    } catch (err) {
      setError(err.message || 'Không thể tìm kiếm nhân viên');
      console.error('Error searching employees:', err);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSearchCode('');
    setFilterDepartment('');
    setFilterRole('');
    setCurrentPage(0); // Reset to first page
    fetchEmployees(); // Reload all employees
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top when changing page
  };

  const filteredEmployees = employees.filter(emp => {
    // Get name from different possible structures
    const fullName = emp.person ? `${emp.person.lastName} ${emp.person.firstName}` :
                     emp.fullName ||
                     emp.name ||
                     `${emp.lastName || ''} ${emp.firstName || ''}`.trim();
    const email = emp.person?.email || emp.email || '';
    const phone = emp.person?.phoneNumber || emp.phoneNumber || emp.phone || '';
    const employeeCode = emp.employeeCode || '';
    const roleType = emp.roleType || '';

    // Search by name, email, phone
    const matchesSearch = !searchTerm ||
                         fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         phone.includes(searchTerm);

    // Search by employee code
    const matchesCode = !searchCode ||
                       employeeCode.toLowerCase().includes(searchCode.toLowerCase());

    // Filter by role type (exact match, case-sensitive)
    const matchesRole = !filterRole ||
                       roleType === filterRole;

    // NOTE: Không filter theo department ở client-side vì:
    // 1. API searchByDepartment đã trả về đúng employees của department đó
    // 2. Response mới không có departmentId field, chỉ có departmentName
    // 3. User phải click "Tìm kiếm" để gọi API filter theo department

    return matchesSearch && matchesCode && matchesRole;
  });

  if (loading) {
    return (
      <div className="employee-management-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-management-page">
      <div className="page-header">
        <div>
          <h1>Quản lý Nhân viên</h1>
          <p className="page-subtitle">Quản lý thông tin nhân viên trong hệ thống</p>
        </div>
        <button className="btn-primary" onClick={handleAddEmployee}>
          <FiPlus /> Thêm Nhân viên
        </button>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stat-card stat-active">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-label">Đang hoạt động</div>
            <div className="stat-value">{stats.activeCount}</div>
          </div>
        </div>
        <div className="stat-card stat-inactive">
          <div className="stat-icon">🚫</div>
          <div className="stat-content">
            <div className="stat-label">Đã xóa</div>
            <div className="stat-value">{stats.deletedCount}</div>
          </div>
        </div>
        <div className="stat-card stat-total">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-label">Tổng số</div>
            <div className="stat-value">{stats.totalCount}</div>
          </div>
        </div>
      </div>

      <div className="filter-section">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Tìm theo mã nhân viên..."
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        <div className="filter-box">
          <FiFilter />
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
          >
            <option value="">Tất cả phòng ban</option>
            <option value="1">Khoa Nội</option>
            <option value="2">Khoa Ngoại</option>
            <option value="3">Khoa Sản</option>
            <option value="4">Khoa Nhi</option>
            <option value="5">Khoa Mắt</option>
            <option value="6">Khoa Tai Mũi Họng</option>
            <option value="7">Khoa Da Liễu</option>
            <option value="8">Phòng Xét nghiệm</option>
            <option value="9">Phòng Dược</option>
            <option value="10">Phòng Kế toán</option>
            <option value="11">Phòng Hành chính</option>
          </select>
        </div>

        <div className="filter-box">
          <FiFilter />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="">Tất cả vai trò</option>
            <option value="RECEPTIONIST">Lễ tân</option>
            <option value="DOCTOR">Bác sĩ</option>
            <option value="NURSE">Điều dưỡng</option>
            <option value="PHARMACIST">Dược sĩ</option>
            <option value="LAB_TECH">Kỹ thuật viên</option>
            <option value="CASHIER">Thu ngân</option>
          </select>
        </div>

        <button className="btn-search" onClick={handleSearch}>
          <FiSearch /> Tìm kiếm
        </button>

        <button className="btn-reset" onClick={handleResetFilters}>
          Đặt lại
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <div className="error-content">
            <strong>⚠️ Lỗi:</strong> {error}
          </div>
          {error.includes('đăng nhập') && (
            <button
              className="btn-login-redirect"
              onClick={() => window.location.href = '/staff/login'}
            >
              Đăng nhập ngay
            </button>
          )}
        </div>
      )}

      <div className="table-container">
        <table className="employee-table">
          <thead>
            <tr>
              <th>Mã NV</th>
              <th>Họ và tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Phòng ban</th>
              <th>Chức vụ</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => {
                // Extract data from different possible structures
                const person = employee.person || {};
                const fullName = person.firstName && person.lastName
                  ? `${person.lastName} ${person.firstName}`
                  : employee.name || 'N/A';
                const email = person.email || employee.email || 'N/A';
                const phone = person.phoneNumber || employee.phone || 'N/A';
                const department = employee.department?.name || employee.departmentName || 'N/A';
                const position = employee.jobTitle || employee.position || 'N/A';
                const isEmployeeActive = employee.isActive !== undefined ? employee.isActive : true; // data.isActive
                const isDeleted = employee.deletedAt !== null && employee.deletedAt !== undefined;
                const isAccountActive = employee.employeeAccount?.isActive; // employeeAccount.isActive

                // Determine status based on both isActive flags
                let statusClass = 'active';
                let statusText = 'Đang làm việc';

                if (isDeleted) {
                  statusClass = 'deleted';
                  statusText = 'Đã xóa';
                } else if (isEmployeeActive && isAccountActive) {
                  // Both active -> Đang hoạt động
                  statusClass = 'active';
                  statusText = 'Đang hoạt động';
                } else if (!isEmployeeActive && isAccountActive) {
                  // Employee inactive but account active -> Nghỉ việc
                  statusClass = 'inactive';
                  statusText = 'Nghỉ việc';
                } else if (!isEmployeeActive) {
                  // Employee inactive -> Nghỉ việc
                  statusClass = 'inactive';
                  statusText = 'Nghỉ việc';
                }

                return (
                  <tr key={employee.id || employee.employeeId}>
                    <td>{employee.employeeCode || 'N/A'}</td>
                    <td>{fullName}</td>
                    <td>{email}</td>
                    <td>{phone}</td>
                    <td>{department}</td>
                    <td>{position}</td>
                    <td>
                      <span className={`status-badge ${statusClass}`}>
                        {statusText}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEditEmployee(employee)}
                          title="Chỉnh sửa"
                        >
                          <FiEdit2 />
                        </button>
                        {!isDeleted && (
                          <button
                            className={`btn-icon ${isEmployeeActive ? 'btn-deactivate' : 'btn-activate'}`}
                            onClick={() => handleToggleEmployee(employee)}
                            title={isEmployeeActive ? 'Vô hiệu hóa nhân viên' : 'Kích hoạt nhân viên'}
                          >
                            {isEmployeeActive ? <FiUserX /> : <FiUserCheck />}
                          </button>
                        )}
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDeleteEmployee(employee.id || employee.employeeId)}
                          title="Xóa"
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
                  Không tìm thấy nhân viên nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        isFirst={isFirst}
        isLast={isLast}
      />

      <AddEmployeeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleSubmitNewEmployee}
      />

      {showEditModal && selectedEmployee && (
        <EditEmployeeModal
          employee={selectedEmployee}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEmployee(null);
          }}
          onSave={handleSaveEmployee}
          onDelete={handleDeleteEmployee}
        />
      )}
    </div>
  );
};

export default EmployeeManagementPage;

