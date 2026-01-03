import React, { useState, useEffect } from 'react';
import './AuditLogsPage.css';
import {
    FiFileText, FiSearch, FiRefreshCw, FiAlertCircle, FiActivity,
    FiBarChart2, FiClock, FiUser, FiLogIn, FiShield, FiFilter, FiX
} from 'react-icons/fi';
import { adminAuditAPI } from '../../../../services/staff/adminAPI';

const AuditLogsPage = () => {
    const [activeView, setActiveView] = useState('search'); // 'search', 'recent', 'logins', 'failed', 'statistics', 'dashboard'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Search state
    const [searchParams, setSearchParams] = useState({
        username: '',
        action: '',
        module: '',
        entityType: '',
        entityId: '',
        startDate: '',
        endDate: '',
        ipAddress: '',
    });
    const [searchResults, setSearchResults] = useState([]);
    const [pagination, setPagination] = useState({ page: 0, size: 20, totalPages: 0, totalElements: 0 });

    // Recent activity state
    const [recentActivities, setRecentActivities] = useState([]);
    const [recentLimit, setRecentLimit] = useState(50);
    const [recentHours, setRecentHours] = useState(24);

    // Login history state
    const [loginHistory, setLoginHistory] = useState([]);
    const [loginFilters, setLoginFilters] = useState({
        username: '',
        status: '',
        action: '',
        startDate: '',
        endDate: '',
    });
    const [loginPagination, setLoginPagination] = useState({ page: 0, size: 20, totalPages: 0, totalElements: 0 });

    // Failed logins state
    const [failedLogins, setFailedLogins] = useState([]);
    const [failedHours, setFailedHours] = useState(24);
    const [minAttempts, setMinAttempts] = useState(3);

    // Statistics state
    const [statistics, setStatistics] = useState(null);
    const [statsDateRange, setStatsDateRange] = useState({ startDate: '', endDate: '' });

    // Dashboard state
    const [dashboard, setDashboard] = useState(null);

    useEffect(() => {
        fetchData();
    }, [activeView]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            if (activeView === 'search') {
                // Search will be triggered by button click
                setLoading(false);
            } else if (activeView === 'recent') {
                await fetchRecentActivity();
            } else if (activeView === 'logins') {
                await fetchLoginHistory();
            } else if (activeView === 'failed') {
                await fetchFailedLogins();
            } else if (activeView === 'statistics') {
                await fetchStatistics();
            } else if (activeView === 'dashboard') {
                await fetchDashboard();
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.message || 'Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (page = 0) => {
        try {
            setLoading(true);
            setError(null);

            // Filter out empty params
            const filteredParams = Object.fromEntries(
                Object.entries(searchParams).filter(([_, value]) => value !== '')
            );

            const response = await adminAuditAPI.searchAuditLogs(filteredParams, page, pagination.size);
            
            if (response && response.data) {
                setSearchResults(response.data.content || []);
                setPagination({
                    page: response.data.pageable?.pageNumber || 0,
                    size: response.data.pageable?.pageSize || 20,
                    totalPages: response.data.totalPages || 0,
                    totalElements: response.data.totalElements || 0,
                });
            }
        } catch (err) {
            console.error('Error searching audit logs:', err);
            setError(err.message || 'Không thể tìm kiếm nhật ký kiểm toán');
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentActivity = async () => {
        const response = await adminAuditAPI.getRecentActivity(recentLimit, recentHours);
        if (response && response.data) {
            setRecentActivities(response.data.content || response.data || []);
        }
    };

    const fetchLoginHistory = async (page = 0) => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                ...loginFilters,
                page,
                size: loginPagination.size,
            };

            const response = await adminAuditAPI.getLoginHistory(params);
            if (response && response.data) {
                setLoginHistory(response.data.content || []);
                setLoginPagination({
                    page: page,
                    size: loginPagination.size,
                    totalPages: response.data.totalPages || 0,
                    totalElements: response.data.totalElements || 0,
                });
            }
        } catch (err) {
            setError(err.message || 'Không thể tải lịch sử đăng nhập');
            setLoginHistory([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchFailedLogins = async () => {
        const response = await adminAuditAPI.getFailedLoginAttempts(failedHours, minAttempts);
        if (response && response.data) {
            setFailedLogins(response.data || []);
        }
    };

    const fetchStatistics = async () => {
        const response = await adminAuditAPI.getAuditStatistics(
            statsDateRange.startDate || null,
            statsDateRange.endDate || null
        );
        if (response && response.data) {
            setStatistics(response.data);
        }
    };

    const fetchDashboard = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await adminAuditAPI.getAuditDashboard();
            if (response && response.data) {
                setDashboard(response.data);
            }
        } catch (err) {
            setError(err.message || 'Không thể tải dữ liệu bảng điều khiển');
            setDashboard(null);
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const clearSearchFilters = () => {
        setSearchParams({
            username: '',
            action: '',
            module: '',
            entityType: '',
            entityId: '',
            startDate: '',
            endDate: '',
            ipAddress: '',
        });
        setSearchResults([]);
    };

    const clearLoginFilters = () => {
        setLoginFilters({
            username: '',
            status: '',
            action: '',
            startDate: '',
            endDate: '',
        });
    };

    const renderActionBadge = (action) => {
        const colors = {
            CREATE: 'success',
            UPDATE: 'warning',
            DELETE: 'danger',
            VIEW: 'info',
            LOGIN_SUCCESS: 'success',
            LOGIN_FAILED: 'danger',
            LOGOUT: 'info',
        };
        const labels = {
            CREATE: 'Tạo mới',
            UPDATE: 'Cập nhật',
            DELETE: 'Xóa',
            VIEW: 'Xem',
            LOGIN_SUCCESS: 'Đăng nhập thành công',
            LOGIN_FAILED: 'Đăng nhập thất bại',
            LOGOUT: 'Đăng xuất',
        };
        return <span className={`badge badge-${colors[action] || 'secondary'}`}>{labels[action] || action}</span>;
    };

    const renderStatusBadge = (status) => {
        const label = status === 'SUCCESS' ? 'Thành công' : status === 'FAILED' ? 'Thất bại' : status;
        return <span className={`badge badge-${status === 'SUCCESS' ? 'success' : 'danger'}`}>{label}</span>;
    };

    return (
        <div className="audit-logs-page">
            {/* Page Header */}
            <div className="page-header">
                <div className="header-left">
                    <FiFileText className="page-icon" />
                    <div>
                        <h1>Nhật ký Kiểm toán</h1>
                        <p>Theo dõi và kiểm tra lịch sử hoạt động hệ thống</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button
                        className="btn-refresh"
                        onClick={fetchData}
                        disabled={loading}
                    >
                        <FiRefreshCw className={loading ? 'spinning' : ''} />
                        Làm mới
                    </button>
                </div>
            </div>

            {/* View Tabs */}
            <div className="view-tabs">
                <button
                    className={`tab ${activeView === 'search' ? 'active' : ''}`}
                    onClick={() => setActiveView('search')}
                >
                    <FiSearch /> Tìm kiếm Nhật ký
                </button>
                <button
                    className={`tab ${activeView === 'recent' ? 'active' : ''}`}
                    onClick={() => setActiveView('recent')}
                >
                    <FiClock /> Hoạt động Gần đây
                </button>
                <button
                    className={`tab ${activeView === 'logins' ? 'active' : ''}`}
                    onClick={() => setActiveView('logins')}
                >
                    <FiLogIn /> Lịch sử Đăng nhập
                </button>
                <button
                    className={`tab ${activeView === 'failed' ? 'active' : ''}`}
                    onClick={() => setActiveView('failed')}
                >
                    <FiShield /> Đăng nhập Thất bại
                </button>
                <button
                    className={`tab ${activeView === 'statistics' ? 'active' : ''}`}
                    onClick={() => setActiveView('statistics')}
                >
                    <FiBarChart2 /> Thống kê
                </button>
                <button
                    className={`tab ${activeView === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveView('dashboard')}
                >
                    <FiActivity /> Bảng điều khiển
                </button>
            </div>

            {/* Error State */}
            {error && (
                <div className="error-message">
                    <FiAlertCircle />
                    <span>{error}</span>
                    <button onClick={fetchData}>Thử lại</button>
                </div>
            )}

            {/* Loading State */}
            {loading && !error && (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Đang tải dữ liệu...</p>
                </div>
            )}

            {/* Search View */}
            {!loading && !error && activeView === 'search' && (
                <div className="content-section">
                    <div className="search-filters">
                        <h3><FiFilter /> Bộ lọc tìm kiếm</h3>
                        <div className="filters-grid">
                            <div className="filter-item">
                                <label>Tên đăng nhập</label>
                                <input
                                    type="text"
                                    placeholder="Nhập tên đăng nhập..."
                                    value={searchParams.username}
                                    onChange={(e) => setSearchParams({...searchParams, username: e.target.value})}
                                />
                            </div>
                            <div className="filter-item">
                                <label>Hành động</label>
                                <select
                                    value={searchParams.action}
                                    onChange={(e) => setSearchParams({...searchParams, action: e.target.value})}
                                >
                                    <option value="">Tất cả</option>
                                    <option value="CREATE">Tạo mới</option>
                                    <option value="UPDATE">Cập nhật</option>
                                    <option value="DELETE">Xóa</option>
                                    <option value="VIEW">Xem</option>
                                </select>
                            </div>
                            <div className="filter-item">
                                <label>Mô-đun</label>
                                <select
                                    value={searchParams.module}
                                    onChange={(e) => setSearchParams({...searchParams, module: e.target.value})}
                                >
                                    <option value="">Tất cả</option>
                                    <option value="PATIENT">Bệnh nhân</option>
                                    <option value="BOOKING">Đặt lịch</option>
                                    <option value="PRESCRIPTION">Đơn thuốc</option>
                                    <option value="EMPLOYEE">Nhân viên</option>
                                    <option value="INPATIENT">Nội trú</option>
                                </select>
                            </div>
                            <div className="filter-item">
                                <label>Loại đối tượng</label>
                                <input
                                    type="text"
                                    placeholder="Nhập loại đối tượng..."
                                    value={searchParams.entityType}
                                    onChange={(e) => setSearchParams({...searchParams, entityType: e.target.value})}
                                />
                            </div>
                            <div className="filter-item">
                                <label>Mã đối tượng</label>
                                <input
                                    type="text"
                                    placeholder="Nhập mã đối tượng..."
                                    value={searchParams.entityId}
                                    onChange={(e) => setSearchParams({...searchParams, entityId: e.target.value})}
                                />
                            </div>
                            <div className="filter-item">
                                <label>Địa chỉ IP</label>
                                <input
                                    type="text"
                                    placeholder="Nhập địa chỉ IP..."
                                    value={searchParams.ipAddress}
                                    onChange={(e) => setSearchParams({...searchParams, ipAddress: e.target.value})}
                                />
                            </div>
                            <div className="filter-item">
                                <label>Ngày bắt đầu</label>
                                <input
                                    type="datetime-local"
                                    value={searchParams.startDate}
                                    onChange={(e) => setSearchParams({...searchParams, startDate: e.target.value})}
                                />
                            </div>
                            <div className="filter-item">
                                <label>Ngày kết thúc</label>
                                <input
                                    type="datetime-local"
                                    value={searchParams.endDate}
                                    onChange={(e) => setSearchParams({...searchParams, endDate: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="filter-actions">
                            <button className="btn-search" onClick={() => handleSearch(0)}>
                                <FiSearch /> Tìm kiếm
                            </button>
                            <button className="btn-clear" onClick={clearSearchFilters}>
                                <FiX /> Xóa bộ lọc
                            </button>
                        </div>
                    </div>

                    {searchResults.length > 0 && (
                        <div className="results-section">
                            <div className="results-header">
                                <h3>Kết quả tìm kiếm ({pagination.totalElements} nhật ký)</h3>
                                <span>Trang {pagination.page + 1} / {pagination.totalPages}</span>
                            </div>
                            <div className="logs-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Mã nhật ký</th>
                                            <th>Thời gian</th>
                                            <th>Người dùng</th>
                                            <th>Hành động</th>
                                            <th>Mô-đun</th>
                                            <th>Đối tượng</th>
                                            <th>Mô tả</th>
                                            <th>IP</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {searchResults.map((log) => (
                                            <tr key={log.logId}>
                                                <td>{log.logId}</td>
                                                <td>{formatDateTime(log.createdAt)}</td>
                                                <td>
                                                    <div className="user-info">
                                                        <strong>{log.username}</strong>
                                                        <small>{log.employeeName}</small>
                                                    </div>
                                                </td>
                                                <td>{renderActionBadge(log.action)}</td>
                                                <td><span className="badge badge-secondary">{log.module}</span></td>
                                                <td>
                                                    <div className="entity-info">
                                                        <small>{log.entityType}</small>
                                                        <strong>#{log.entityId}</strong>
                                                    </div>
                                                </td>
                                                <td>{log.description}</td>
                                                <td className="ip-address">{log.ipAddress}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {pagination.totalPages > 1 && (
                                <div className="pagination">
                                    <button
                                        onClick={() => handleSearch(pagination.page - 1)}
                                        disabled={pagination.page === 0}
                                    >
                                        Trước
                                    </button>
                                    <span>Trang {pagination.page + 1} / {pagination.totalPages}</span>
                                    <button
                                        onClick={() => handleSearch(pagination.page + 1)}
                                        disabled={pagination.page >= pagination.totalPages - 1}
                                    >
                                        Sau
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Recent Activity View */}
            {!loading && !error && activeView === 'recent' && (
                <div className="content-section">
                    <div className="section-header">
                        <h3>Hoạt động gần đây</h3>
                        <div className="filters-inline">
                            <label>Giới hạn:</label>
                            <select value={recentLimit} onChange={(e) => setRecentLimit(Number(e.target.value))}>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <label>Số giờ:</label>
                            <select value={recentHours} onChange={(e) => setRecentHours(Number(e.target.value))}>
                                <option value={1}>1 giờ</option>
                                <option value={6}>6 giờ</option>
                                <option value={24}>24 giờ</option>
                                <option value={72}>72 giờ</option>
                            </select>
                            <button className="btn-apply" onClick={fetchRecentActivity}>Áp dụng</button>
                        </div>
                    </div>
                    <div className="activity-list">
                        {recentActivities.map((activity, index) => (
                            <div key={index} className="activity-item">
                                <div className="activity-time">{formatDateTime(activity.createdAt)}</div>
                                <div className="activity-content">
                                    <div className="activity-header">
                                        <span className="activity-user">{activity.username}</span>
                                        {renderActionBadge(activity.action)}
                                        <span className="activity-module">{activity.module}</span>
                                    </div>
                                    <div className="activity-description">{activity.description}</div>
                                    <div className="activity-meta">
                                        <span>IP: {activity.ipAddress}</span>
                                        <span>Đối tượng: {activity.entityType} #{activity.entityId}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Login History View */}
            {!loading && !error && activeView === 'logins' && (
                <div className="content-section">
                    <div className="search-filters">
                        <h3><FiFilter /> Bộ lọc Lịch sử Đăng nhập</h3>
                        <div className="filters-grid">
                            <div className="filter-item">
                                <label>Tên đăng nhập</label>
                                <input
                                    type="text"
                                    placeholder="Nhập tên đăng nhập..."
                                    value={loginFilters.username}
                                    onChange={(e) => setLoginFilters({...loginFilters, username: e.target.value})}
                                />
                            </div>
                            <div className="filter-item">
                                <label>Trạng thái</label>
                                <select
                                    value={loginFilters.status}
                                    onChange={(e) => setLoginFilters({...loginFilters, status: e.target.value})}
                                >
                                    <option value="">Tất cả</option>
                                    <option value="SUCCESS">Thành công</option>
                                    <option value="FAILED">Thất bại</option>
                                </select>
                            </div>
                            <div className="filter-item">
                                <label>Hành động</label>
                                <select
                                    value={loginFilters.action}
                                    onChange={(e) => setLoginFilters({...loginFilters, action: e.target.value})}
                                >
                                    <option value="">Tất cả</option>
                                    <option value="LOGIN_SUCCESS">Đăng nhập thành công</option>
                                    <option value="LOGIN_FAILED">Đăng nhập thất bại</option>
                                    <option value="LOGOUT">Đăng xuất</option>
                                </select>
                            </div>
                            <div className="filter-item">
                                <label>Ngày bắt đầu</label>
                                <input
                                    type="datetime-local"
                                    value={loginFilters.startDate}
                                    onChange={(e) => setLoginFilters({...loginFilters, startDate: e.target.value})}
                                />
                            </div>
                            <div className="filter-item">
                                <label>Ngày kết thúc</label>
                                <input
                                    type="datetime-local"
                                    value={loginFilters.endDate}
                                    onChange={(e) => setLoginFilters({...loginFilters, endDate: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="filter-actions">
                            <button className="btn-search" onClick={() => fetchLoginHistory(0)}>
                                <FiSearch /> Tìm kiếm
                            </button>
                            <button className="btn-clear" onClick={clearLoginFilters}>
                                <FiX /> Xóa bộ lọc
                            </button>
                        </div>
                    </div>

                    {loginHistory.length > 0 && (
                        <div className="results-section">
                            <div className="results-header">
                                <h3>Lịch sử đăng nhập ({loginPagination.totalElements} nhật ký)</h3>
                                <span>Trang {loginPagination.page + 1} / {loginPagination.totalPages}</span>
                            </div>
                            <div className="logs-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Mã nhật ký</th>
                                            <th>Thời gian</th>
                                            <th>Người dùng</th>
                                            <th>Nhân viên</th>
                                            <th>Hành động</th>
                                            <th>Trạng thái</th>
                                            <th>Địa chỉ IP</th>
                                            <th>Trình duyệt</th>
                                            <th>Mã phiên</th>
                                            <th>Lý do thất bại</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loginHistory.map((log) => (
                                            <tr key={log.logId}>
                                                <td>{log.logId}</td>
                                                <td>{formatDateTime(log.createdAt)}</td>
                                                <td className="username"><strong>{log.username}</strong></td>
                                                <td>
                                                    {log.employeeName ? (
                                                        <div className="user-info">
                                                            <strong>{log.employeeName}</strong>
                                                            <small>ID: {log.employeeId}</small>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted">N/A</span>
                                                    )}
                                                </td>
                                                <td>{renderActionBadge(log.action)}</td>
                                                <td>{renderStatusBadge(log.status)}</td>
                                                <td className="ip-address">{log.ipAddress}</td>
                                                <td className="user-agent" title={log.userAgent}>
                                                    {log.userAgent ? (
                                                        <span>{log.userAgent.substring(0, 30)}...</span>
                                                    ) : (
                                                        <span className="text-muted">N/A</span>
                                                    )}
                                                </td>
                                                <td className="session-id">{log.sessionId || 'N/A'}</td>
                                                <td className="failure-reason">
                                                    {log.failureReason ? (
                                                        <span className="text-danger">{log.failureReason}</span>
                                                    ) : (
                                                        <span>-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {loginPagination.totalPages > 1 && (
                                <div className="pagination">
                                    <button
                                        onClick={() => fetchLoginHistory(loginPagination.page - 1)}
                                        disabled={loginPagination.page === 0}
                                    >
                                        Trước
                                    </button>
                                    <span>Trang {loginPagination.page + 1} / {loginPagination.totalPages}</span>
                                    <button
                                        onClick={() => fetchLoginHistory(loginPagination.page + 1)}
                                        disabled={loginPagination.page >= loginPagination.totalPages - 1}
                                    >
                                        Sau
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {loginHistory.length === 0 && !loading && (
                        <div className="empty-state">
                            <FiLogIn />
                            <p>Không tìm thấy lịch sử đăng nhập</p>
                        </div>
                    )}
                </div>
            )}

            {/* Failed Logins View */}
            {!loading && !error && activeView === 'failed' && (
                <div className="content-section">
                    <div className="section-header">
                        <h3>Đăng nhập Thất bại</h3>
                        <div className="filters-inline">
                            <label>Số giờ:</label>
                            <select value={failedHours} onChange={(e) => setFailedHours(Number(e.target.value))}>
                                <option value={6}>6 giờ</option>
                                <option value={24}>24 giờ</option>
                                <option value={72}>72 giờ</option>
                            </select>
                            <label>Số lần tối thiểu:</label>
                            <select value={minAttempts} onChange={(e) => setMinAttempts(Number(e.target.value))}>
                                <option value={3}>3</option>
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                            </select>
                            <button className="btn-apply" onClick={fetchFailedLogins}>Áp dụng</button>
                        </div>
                    </div>
                    <div className="failed-logins-grid">
                        {failedLogins.map((item, index) => (
                            <div key={index} className={`failed-login-card ${item.accountLocked ? 'locked' : ''}`}>
                                <div className="card-header">
                                    <FiUser />
                                    <strong>{item.username}</strong>
                                    {item.accountLocked && <span className="badge badge-danger">Đã khóa</span>}
                                </div>
                                <div className="card-body">
                                    <div className="stat-row">
                                        <span>Số lần thất bại:</span>
                                        <strong className="danger-text">{item.failedAttempts}</strong>
                                    </div>
                                    <div className="stat-row">
                                        <span>Lần thử cuối:</span>
                                        <span>{formatDateTime(item.lastAttempt)}</span>
                                    </div>
                                    <div className="stat-row">
                                        <span>Địa chỉ IP:</span>
                                        <div className="ip-list">
                                            {item.ipAddresses.map((ip, i) => (
                                                <span key={i} className="ip-tag">{ip}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Statistics View */}
            {!loading && !error && activeView === 'statistics' && statistics && (
                <div className="content-section">
                    <div className="section-header">
                        <h3>Thống kê Nhật ký Kiểm toán</h3>
                        <div className="filters-inline">
                            <label>Ngày bắt đầu:</label>
                            <input
                                type="date"
                                value={statsDateRange.startDate}
                                onChange={(e) => setStatsDateRange({...statsDateRange, startDate: e.target.value})}
                            />
                            <label>Ngày kết thúc:</label>
                            <input
                                type="date"
                                value={statsDateRange.endDate}
                                onChange={(e) => setStatsDateRange({...statsDateRange, endDate: e.target.value})}
                            />
                            <button className="btn-apply" onClick={fetchStatistics}>Áp dụng</button>
                        </div>
                    </div>

                    {/* Login Statistics */}
                    <div className="stats-section">
                        <h4>📊 Thống kê Đăng nhập</h4>
                        <div className="stats-grid-small">
                            <div className="stat-card-small">
                                <div className="stat-label">Tổng đăng nhập hôm nay</div>
                                <div className="stat-value-large">{statistics.todayLoginTotal || 0}</div>
                            </div>
                            <div className="stat-card-small success">
                                <div className="stat-label">Đăng nhập thành công</div>
                                <div className="stat-value-large">{statistics.todayLoginSuccess || 0}</div>
                            </div>
                            <div className="stat-card-small danger">
                                <div className="stat-label">Đăng nhập thất bại</div>
                                <div className="stat-value-large">{statistics.todayLoginFailed || 0}</div>
                            </div>
                            <div className="stat-card-small info">
                                <div className="stat-label">Tỷ lệ thành công</div>
                                <div className="stat-value-large">
                                    {statistics.todayLoginTotal > 0
                                        ? ((statistics.todayLoginSuccess / statistics.todayLoginTotal) * 100).toFixed(1)
                                        : 0}%
                                </div>
                            </div>
                        </div>

                        {/* Login by Action */}
                        {statistics.loginByAction && statistics.loginByAction.length > 0 && (
                            <div className="chart-section">
                                <h5>Đăng nhập theo Hành động</h5>
                                <div className="bar-chart">
                                    {statistics.loginByAction.map((item, index) => (
                                        <div key={index} className="bar-item">
                                            <div className="bar-label">
                                                <span>{item.actionDisplayName || item.action}</span>
                                                <strong>{item.count}</strong>
                                            </div>
                                            <div className="bar-container">
                                                <div
                                                    className="bar-fill"
                                                    style={{
                                                        width: `${(item.count / statistics.todayLoginTotal) * 100}%`,
                                                        background: item.action.includes('SUCCESS') ? '#10b981' : '#ef4444'
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Activity Statistics */}
                    <div className="stats-section">
                        <h4>📈 Thống kê Hoạt động</h4>
                        <div className="stats-grid-small">
                            <div className="stat-card-small">
                                <div className="stat-label">Tổng hoạt động hôm nay</div>
                                <div className="stat-value-large">{statistics.todayActivityTotal || 0}</div>
                            </div>
                        </div>

                        {/* Activity by Action */}
                        {statistics.activityByAction && statistics.activityByAction.length > 0 && (
                            <div className="chart-section">
                                <h5>Hoạt động theo Hành động</h5>
                                <div className="bar-chart">
                                    {statistics.activityByAction.map((item, index) => {
                                        const maxCount = Math.max(...statistics.activityByAction.map(a => a.count));
                                        const colors = {
                                            CREATE: '#10b981',
                                            UPDATE: '#f59e0b',
                                            DELETE: '#ef4444',
                                            VIEW: '#3b82f6'
                                        };
                                        return (
                                            <div key={index} className="bar-item">
                                                <div className="bar-label">
                                                    <span>{item.actionDisplayName || item.action}</span>
                                                    <strong>{item.count}</strong>
                                                </div>
                                                <div className="bar-container">
                                                    <div
                                                        className="bar-fill"
                                                        style={{
                                                            width: `${(item.count / maxCount) * 100}%`,
                                                            background: colors[item.action] || '#6b7280'
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Activity by Module */}
                        {statistics.activityByModule && statistics.activityByModule.length > 0 && (
                            <div className="chart-section">
                                <h5>Hoạt động theo Mô-đun</h5>
                                <div className="bar-chart">
                                    {statistics.activityByModule.map((item, index) => {
                                        const maxCount = Math.max(...statistics.activityByModule.map(m => m.count));
                                        return (
                                            <div key={index} className="bar-item">
                                                <div className="bar-label">
                                                    <span>{item.moduleDisplayName || item.module}</span>
                                                    <strong>{item.count}</strong>
                                                </div>
                                                <div className="bar-container">
                                                    <div
                                                        className="bar-fill"
                                                        style={{
                                                            width: `${(item.count / maxCount) * 100}%`,
                                                            background: '#8b5cf6'
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Empty state for activities */}
                        {(!statistics.activityByAction || statistics.activityByAction.length === 0) &&
                         (!statistics.activityByModule || statistics.activityByModule.length === 0) && (
                            <div className="empty-state-small">
                                <p>Chưa có hoạt động nào trong khoảng thời gian này</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Dashboard View */}
            {!loading && !error && activeView === 'dashboard' && dashboard && (
                <div className="content-section">
                    <div className="section-header">
                        <h3>Dashboard Tổng quan</h3>
                        <button className="btn-refresh" onClick={fetchDashboard}>
                            <FiRefreshCw /> Làm mới
                        </button>
                    </div>

                    <div className="dashboard-grid">
                        {/* Current Stats */}
                        <div className="dashboard-card stats-card">
                            <h4>📊 Thống kê hiện tại</h4>
                            <div className="stats-list">
                                <div className="stat-item">
                                    <span>Người dùng Online:</span>
                                    <strong className="text-blue">{dashboard.currentOnlineUsers || 0}</strong>
                                </div>
                                <div className="stat-item">
                                    <span>Đăng nhập hôm nay:</span>
                                    <strong className="text-green">{dashboard.todayLogins || 0}</strong>
                                </div>
                                <div className="stat-item">
                                    <span>Đăng nhập thất bại hôm nay:</span>
                                    <strong className="text-red">{dashboard.todayFailedLogins || 0}</strong>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activities */}
                        <div className="dashboard-card">
                            <h4>🕐 Hoạt động gần đây</h4>
                            {dashboard.recentActivities && dashboard.recentActivities.length > 0 ? (
                                <div className="recent-list">
                                    {dashboard.recentActivities.slice(0, 5).map((activity, index) => (
                                        <div key={index} className="recent-item">
                                            <div className="recent-time">{formatDateTime(activity.createdAt)}</div>
                                            <div className="recent-desc">
                                                <strong>{activity.username}</strong>
                                                {activity.action && <span className="badge badge-secondary">{activity.action}</span>}
                                                {activity.module && <span className="module-tag">{activity.module}</span>}
                                                {activity.description && <p>{activity.description}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state-small">
                                    <p>Chưa có hoạt động gần đây</p>
                                </div>
                            )}
                        </div>

                        {/* Suspicious Activities */}
                        <div className={`dashboard-card ${dashboard.suspiciousActivities && dashboard.suspiciousActivities.length > 0 ? 'alert' : ''}`}>
                            <h4>⚠️ Hoạt động đáng ngờ</h4>
                            {dashboard.suspiciousActivities && dashboard.suspiciousActivities.length > 0 ? (
                                <div className="suspicious-list">
                                    {dashboard.suspiciousActivities.map((item, index) => (
                                        <div key={index} className="suspicious-item">
                                            <div className="suspicious-type">
                                                {item.type === 'MULTIPLE_FAILED_LOGINS' && '🔒 Nhiều lần đăng nhập thất bại'}
                                                {item.type === 'SUSPICIOUS_IP' && '🌐 Địa chỉ IP đáng ngờ'}
                                                {item.type === 'UNUSUAL_ACTIVITY' && '⚡ Hoạt động bất thường'}
                                                {!['MULTIPLE_FAILED_LOGINS', 'SUSPICIOUS_IP', 'UNUSUAL_ACTIVITY'].includes(item.type) && item.type}
                                            </div>
                                            <div className="suspicious-details">
                                                <span>Người dùng: <strong>{item.username}</strong></span>
                                                <span>Số lần: <strong className="text-red">{item.count}</strong></span>
                                                <span>Lần cuối: {formatDateTime(item.lastOccurrence)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state-small success">
                                    <p>✅ Không có hoạt động đáng ngờ</p>
                                </div>
                            )}
                        </div>

                        {/* System Health */}
                        <div className="dashboard-card health-card">
                            <h4>💚 Tình trạng Hệ thống</h4>
                            {dashboard.systemHealth ? (
                                <div className="stats-list">
                                    <div className="stat-item">
                                        <span>Trạng thái:</span>
                                        <span className={`badge badge-${dashboard.systemHealth.status === 'HEALTHY' ? 'success' : 'danger'}`}>
                                            {dashboard.systemHealth.status === 'HEALTHY' ? 'Khỏe mạnh' : dashboard.systemHealth.status}
                                        </span>
                                    </div>
                                    {dashboard.systemHealth.lastBackup && (
                                        <div className="stat-item">
                                            <span>Sao lưu lần cuối:</span>
                                            <span>{formatDateTime(dashboard.systemHealth.lastBackup)}</span>
                                        </div>
                                    )}
                                    {dashboard.systemHealth.databaseSize && (
                                        <div className="stat-item">
                                            <span>Kích thước CSDL:</span>
                                            <strong>{dashboard.systemHealth.databaseSize}</strong>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="empty-state-small">
                                    <p>Không có thông tin tình trạng hệ thống</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Empty state for Dashboard */}
            {!loading && !error && activeView === 'dashboard' && !dashboard && (
                <div className="empty-state">
                    <FiBarChart2 />
                    <p>Không có dữ liệu bảng điều khiển</p>
                    <button className="btn-retry" onClick={fetchDashboard}>
                        <FiRefreshCw /> Thử lại
                    </button>
                </div>
            )}
        </div>
    );
};

export default AuditLogsPage;

