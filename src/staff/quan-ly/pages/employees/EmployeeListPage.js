import React, { useState, useEffect } from 'react';
import './EmployeeListPage.css';
import {
    FiUsers, FiSearch, FiFilter, FiRefreshCw, FiEdit,
    FiTrash2, FiUserCheck, FiUserX, FiPlus
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { adminEmployeeAPI } from '../../../../services/staff/adminAPI';

const EmployeeListPage = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('');

    // Fetch employees
    const fetchEmployees = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminEmployeeAPI.getEmployees();

            if (response && response.data) {
                setEmployees(response.data);
            }
        } catch (err) {
            console.error('Error fetching employees:', err);
            setError(err.message || 'Không thể tải danh sách nhân viên');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    // Filter employees
    const filteredEmployees = employees.filter(emp => {
        const matchSearch = searchTerm === '' || 
            emp.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchRole = filterRole === '' || emp.roleType === filterRole;
        const matchStatus = filterStatus === '' || 
            (filterStatus === 'active' && emp.isActive) ||
            (filterStatus === 'inactive' && !emp.isActive);
        const matchDepartment = filterDepartment === '' || emp.departmentName === filterDepartment;

        return matchSearch && matchRole && matchStatus && matchDepartment;
    });

    // Get unique departments
    const departments = [...new Set(employees.map(e => e.departmentName).filter(Boolean))];

    // Role type mapping
    const getRoleLabel = (roleType) => {
        const roleMap = {
            'DOCTOR': 'Bác sĩ',
            'NURSE': 'Điều dưỡng',
            'RECEPTIONIST': 'Lễ tân',
            'LAB_TECH': 'Dược sĩ',
            'CASHIER': 'Kế toán',
            'MANAGER': 'Quản lý',
            'ADMIN': 'Admin'
        };
        return roleMap[roleType] || roleType;
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    // Loading state
    if (loading) {
        return (
            <div className="employee-list-page">
                <div className="loading-state">
                    <FiRefreshCw className="spin" />
                    <p>Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="employee-list-page">
                <div className="error-state">
                    <p>{error}</p>
                    <button onClick={fetchEmployees} className="btn-retry">
                        <FiRefreshCw /> Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="employee-list-page">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h2>Quản lý Nhân viên</h2>
                    <p>Danh sách tất cả nhân viên trong hệ thống</p>
                </div>
                <div className="header-actions">
                    <button className="btn-refresh" onClick={fetchEmployees}>
                        <FiRefreshCw /> Làm mới
                    </button>
                    <button className="btn-add" onClick={() => navigate('/staff/admin/employees/create')}>
                        <FiPlus /> Thêm nhân viên
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon blue">
                        <FiUsers />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Tổng nhân viên</span>
                        <span className="stat-value">{employees.length}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">
                        <FiUserCheck />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Đang hoạt động</span>
                        <span className="stat-value">{employees.filter(e => e.isActive).length}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon orange">
                        <FiUserX />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Ngừng hoạt động</span>
                        <span className="stat-value">{employees.filter(e => !e.isActive).length}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon purple">
                        <FiUsers />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Có tài khoản</span>
                        <span className="stat-value">{employees.filter(e => e.hasAccount).length}</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filter-section">
                <div className="search-box">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, mã NV, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                        <option value="">Tất cả vai trò</option>
                        <option value="DOCTOR">Bác sĩ</option>
                        <option value="NURSE">Điều dưỡng</option>
                        <option value="RECEPTIONIST">Lễ tân</option>
                        <option value="LAB_TECH">Dược sĩ</option>
                        <option value="CASHIER">Kế toán</option>
                        <option value="MANAGER">Quản lý</option>
                    </select>
                    <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}>
                        <option value="">Tất cả khoa</option>
                        {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="">Tất cả trạng thái</option>
                        <option value="active">Đang hoạt động</option>
                        <option value="inactive">Ngừng hoạt động</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="table-card">
                {filteredEmployees.length === 0 ? (
                    <div className="empty-state">
                        <FiUsers size={48} />
                        <p>Không tìm thấy nhân viên nào</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="employee-table">
                            <thead>
                                <tr>
                                    <th>Mã NV</th>
                                    <th>Họ và tên</th>
                                    <th>Chức vụ</th>
                                    <th>Vai trò</th>
                                    <th>Chuyên khoa</th>
                                    <th>Khoa</th>
                                    <th>Ngày vào làm</th>
                                    <th>Liên hệ</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.map((employee) => (
                                    <tr key={employee.id}>
                                        <td className="employee-code">{employee.employeeCode}</td>
                                        <td>
                                            <div className="employee-name">
                                                {employee.fullName}
                                                {employee.hasAccount && (
                                                    <span className="has-account-badge" title="Có tài khoản">
                                                        <FiUserCheck size={14} />
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>{employee.jobTitle || 'N/A'}</td>
                                        <td>
                                            <span className={`role-badge ${employee.roleType?.toLowerCase()}`}>
                                                {getRoleLabel(employee.roleType)}
                                            </span>
                                        </td>
                                        <td>{employee.specialization || 'N/A'}</td>
                                        <td>{employee.departmentName || 'N/A'}</td>
                                        <td>{formatDate(employee.hireDate)}</td>
                                        <td>
                                            <div className="contact-info">
                                                <div>{employee.phoneNumber || 'N/A'}</div>
                                                <div className="email">{employee.email || 'N/A'}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${employee.isActive ? 'active' : 'inactive'}`}>
                                                {employee.isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn-icon" title="Chỉnh sửa">
                                                    <FiEdit />
                                                </button>
                                                <button className="btn-icon danger" title="Xóa">
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Summary */}
            <div className="summary-section">
                <p>Hiển thị <strong>{filteredEmployees.length}</strong> / <strong>{employees.length}</strong> nhân viên</p>
            </div>
        </div>
    );
};

export default EmployeeListPage;

