import React, { useState, useEffect } from 'react';
import './AuditLogsPage.css';
import {
    FiFileText, FiSearch, FiRefreshCw, FiAlertCircle, FiActivity,
    FiBarChart2, FiClock, FiUser, FiLogIn, FiShield, FiFilter, FiX,
    FiCheckCircle, FiXCircle, FiTrendingUp, FiList
} from 'react-icons/fi';
import { adminAuditAPI } from '../../../../services/staff/adminAPI';

const AuditLogsPage = () => {
    // State quản lý view active
    const [activeView, setActiveView] = useState('recent'); // Mặc định hiển thị Recent
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- STATES CHO DASHBOARD ---
    const [dashboardData, setDashboardData] = useState(null);

    // --- STATES CHO RECENT ACTIVITY ---
    const [recentData, setRecentData] = useState({
        activities: [],
        logins: [],
        limit: 50
    });
    const [recentLimit, setRecentLimit] = useState(50);
    const [recentHours, setRecentHours] = useState(24);

    // --- STATES CHO TÌM KIẾM ---
    const [searchParams, setSearchParams] = useState({
        username: '', action: '', module: '', entityType: '',
        entityId: '', startDate: '', endDate: '', ipAddress: '',
    });
    const [searchResults, setSearchResults] = useState([]);
    const [pagination, setPagination] = useState({ page: 0, size: 20, totalPages: 0, totalElements: 0 });

    // --- STATES CHO LOGIN HISTORY ---
    const [loginHistory, setLoginHistory] = useState([]);
    const [loginFilters, setLoginFilters] = useState({ username: '', status: '', action: '', startDate: '', endDate: '' });
    const [loginPagination, setLoginPagination] = useState({ page: 0, size: 20, totalPages: 0, totalElements: 0 });

    // --- STATES CHO FAILED LOGINS ---
    const [failedLogins, setFailedLogins] = useState([]);
    const [failedPagination, setFailedPagination] = useState({ page: 0, size: 20, totalPages: 0, totalElements: 0 });
    const [failedHours, setFailedHours] = useState(24);
    const [minAttempts, setMinAttempts] = useState(3);

    // --- STATES THỐNG KÊ CHI TIẾT ---
    const [statistics, setStatistics] = useState(null);
    const [statsDateRange, setStatsDateRange] = useState({ startDate: '', endDate: '' });

    // ==================== EFFECTS ====================
    useEffect(() => {
        fetchData();
    }, [activeView]);

    // ==================== DATA FETCHING ====================
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            if (activeView === 'dashboard') await fetchDashboard();
            else if (activeView === 'recent') await fetchRecentActivity();
            else if (activeView === 'search') setLoading(false);
            else if (activeView === 'logins') await fetchLoginHistory();
            else if (activeView === 'failed') await fetchFailedLogins();
            else if (activeView === 'statistics') await fetchStatistics();

        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.message || 'Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    // 1. Fetch Dashboard
    const fetchDashboard = async () => {
        try {
            const response = await adminAuditAPI.getAuditDashboard();
            if (response && response.status === 'OK' && response.data) {
                setDashboardData(response.data);
            } else {
                throw new Error(response?.message || 'Lỗi tải dữ liệu Dashboard');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    // 2. Fetch Recent Activity
    const fetchRecentActivity = async () => {
        try {
            const response = await adminAuditAPI.getRecentActivity(recentLimit, recentHours);
            if (response && response.status === 'OK' && response.data) {
                setRecentData({
                    activities: response.data.recentActivities || [],
                    logins: response.data.recentLogins || [],
                    limit: response.data.limit
                });
            } else {
                throw new Error(response?.message || "Lỗi tải hoạt động gần đây");
            }
        } catch (err) {
            setError(err.message);
        }
    };

    // 3. Fetch Search
    const handleSearch = async (page = 0) => {
        try {
            setLoading(true);
            setError(null);
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
            setError(err.message || 'Không thể tìm kiếm');
        } finally {
            setLoading(false);
        }
    };

    // 4. Fetch Login History
    const fetchLoginHistory = async (page = 0) => {
        setLoading(true);
        try {
            const params = { ...loginFilters, page, size: loginPagination.size };
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
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 5. Fetch Failed Logins
    const fetchFailedLogins = async (page = 0) => {
        setLoading(true);
        try {
            const response = await adminAuditAPI.getFailedLoginAttempts(page, failedPagination.size);
            if (response && response.status === 'OK' && response.data) {
                setFailedLogins(response.data.content || []);
                setFailedPagination({
                    page: response.data.pageable?.pageNumber || 0,
                    size: response.data.pageable?.pageSize || 20,
                    totalPages: response.data.totalPages || 0,
                    totalElements: response.data.totalElements || 0,
                });
            } else {
                setFailedLogins([]);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 6. Fetch Statistics (UPDATED)
    const fetchStatistics = async () => {
        try {
            const response = await adminAuditAPI.getAuditStatistics(statsDateRange.startDate || null, statsDateRange.endDate || null);
            if (response && response.status === 'OK' && response.data) {
                setStatistics(response.data);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    // ==================== HELPERS ====================
    const formatDateTime = (dateString) => dateString ? new Date(dateString).toLocaleString('vi-VN') : 'N/A';
    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('vi-VN') : 'N/A';

    const calculatePercentage = (value, total) => {
        if (!total || total === 0) return 0;
        return ((value / total) * 100).toFixed(1);
    };

    const renderActionBadge = (action) => {
        const colors = {
            CREATE: 'success', UPDATE: 'warning', DELETE: 'danger', VIEW: 'info',
            LOGIN_SUCCESS: 'success', LOGIN_FAILED: 'danger', LOGOUT: 'secondary',
            SETTLE: 'primary', CANCEL: 'danger', APPROVE: 'success'
        };
        return <span className={`badge badge-${colors[action] || 'secondary'}`}>{action}</span>;
    };

    const renderStatusBadge = (status) => {
        const color = status === 'SUCCESS' ? 'success' : 'danger';
        return <span className={`badge badge-${color}`}>{status}</span>;
    };

    const clearSearchFilters = () => {
        setSearchParams({ username: '', action: '', module: '', entityType: '', entityId: '', startDate: '', endDate: '', ipAddress: '' });
        setSearchResults([]);
    };

    const clearLoginFilters = () => {
        setLoginFilters({ username: '', status: '', action: '', startDate: '', endDate: '' });
    };

    // ==================== RENDER VIEWS ====================

    // --- DASHBOARD VIEW ---
    const renderDashboardView = () => {
        if (!dashboardData) return <div className="empty-state"><p>Không có dữ liệu dashboard</p></div>;
        const { summary, trends, distributions, topPerformers, meta } = dashboardData;

        return (
            <div className="content-section">
                <div className="section-header">
                    <div>
                        <h3>Tổng quan Hệ thống</h3>
                        <p style={{fontSize: '0.9rem', color: '#666', marginTop: '4px'}}>
                            Dữ liệu từ {formatDateTime(meta.from)} đến {formatDateTime(meta.to)}
                        </p>
                    </div>
                    <button className="btn-refresh" onClick={fetchDashboard} disabled={loading}>
                        <FiRefreshCw className={loading ? 'spinning' : ''} /> Làm mới
                    </button>
                </div>

                <div className="dashboard-grid">
                    {/* 1. Summary Stats */}
                    <div className="dashboard-card stats-card">
                        <h4>📊 Thống kê chung</h4>
                        <div className="stats-list">
                            <div className="stat-item">
                                <span><FiLogIn/> Tổng lượt đăng nhập:</span>
                                <strong className="text-blue">{summary.totalLogins}</strong>
                            </div>
                            <div className="stat-item">
                                <span><FiCheckCircle/> Đăng nhập thành công:</span>
                                <strong className="text-green">{summary.successfulLogins}</strong>
                            </div>
                            <div className="stat-item">
                                <span><FiXCircle/> Đăng nhập thất bại:</span>
                                <strong className="text-red">{summary.failedLogins}</strong>
                            </div>
                            <div className="stat-item">
                                <span><FiTrendingUp/> Tỷ lệ thành công:</span>
                                <strong className="text-blue">{summary.loginSuccessRate}%</strong>
                            </div>
                            <div className="stat-item" style={{borderTop: '1px solid #eee', paddingTop: '8px'}}>
                                <span><FiActivity/> Tổng hoạt động:</span>
                                <strong>{summary.totalActivities}</strong>
                            </div>
                        </div>
                    </div>

                    {/* 2. Login Trends Chart */}
                    <div className="dashboard-card">
                        <h4>📅 Xu hướng Đăng nhập (30 ngày)</h4>
                        <div className="bar-chart" style={{height: '300px', overflowY: 'auto'}}>
                            {trends.auth.slice().reverse().map((day, index) => (
                                <div key={index} className="bar-item">
                                    <div className="bar-label">
                                        <span>{formatDate(day.date)}</span>
                                        <div style={{fontSize: '0.8rem'}}>
                                            <span className="text-green" title="Thành công">{day.success}</span> / 
                                            <span className="text-red" title="Thất bại"> {day.failed}</span>
                                        </div>
                                    </div>
                                    <div className="bar-container">
                                        <div className="bar-fill" style={{ width: `${day.total > 0 ? (day.success / day.total) * 100 : 0}%`, background: '#10b981', float: 'left', height: '100%' }}></div>
                                        <div className="bar-fill" style={{ width: `${day.total > 0 ? (day.failed / day.total) * 100 : 0}%`, background: '#ef4444', float: 'left', height: '100%' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 3. Top Performers (Most Logins) */}
                    <div className="dashboard-card">
                        <h4>🏆 Top Đăng nhập nhiều nhất</h4>
                        <div className="recent-list">
                            {topPerformers.mostLogins.map((user, index) => (
                                <div key={index} className="recent-item">
                                    <div className="recent-desc" style={{flex: 1}}>
                                        <strong>{user.displayName || user.username}</strong>
                                        <p>{user.username}</p>
                                    </div>
                                    <div className="recent-time"><span className="badge badge-info">{user.count} lần</span></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4. Top Performers (Most Active) */}
                    <div className="dashboard-card">
                        <h4>⚡ Top Hoạt động tích cực nhất</h4>
                         <div className="recent-list">
                            {topPerformers.mostActive.map((user, index) => (
                                <div key={index} className="recent-item" style={{borderLeftColor: '#f59e0b'}}>
                                    <div className="recent-desc" style={{flex: 1}}>
                                        <strong>{user.displayName || user.username || 'N/A'}</strong>
                                        <p>{user.username || 'Unknown'}</p>
                                    </div>
                                    <div className="recent-time"><span className="badge badge-warning">{user.count} actions</span></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 5. Distribution by Action */}
                    <div className="dashboard-card">
                        <h4>🧩 Phân bố theo Hành động</h4>
                        <div className="bar-chart">
                            {Object.entries(distributions.activityByAction).map(([action, count], index) => (
                                <div key={index} className="bar-item">
                                    <div className="bar-label"><span>{action}</span><strong>{count}</strong></div>
                                    <div className="bar-container">
                                        <div className="bar-fill" style={{ width: `${calculatePercentage(count, summary.totalActivities)}%`, background: '#8b5cf6' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 6. Distribution by Module */}
                    <div className="dashboard-card">
                        <h4>📦 Phân bố theo Module</h4>
                        <div className="bar-chart">
                            {Object.entries(distributions.activityByModule).map(([module, count], index) => (
                                <div key={index} className="bar-item">
                                    <div className="bar-label"><span>{module}</span><strong>{count}</strong></div>
                                    <div className="bar-container">
                                        <div className="bar-fill" style={{ width: `${calculatePercentage(count, summary.totalActivities)}%`, background: '#3b82f6' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // --- RECENT VIEW ---
    const renderRecentView = () => (
        <div className="content-section">
            <div className="section-header">
                <h3>Hoạt động gần đây</h3>
                <div className="filters-inline">
                    <select value={recentLimit} onChange={e=>setRecentLimit(Number(e.target.value))}>
                        <option value={20}>20 dòng</option><option value={50}>50 dòng</option><option value={100}>100 dòng</option>
                    </select>
                    <select value={recentHours} onChange={e=>setRecentHours(Number(e.target.value))}>
                        <option value={1}>1 giờ qua</option><option value={24}>24 giờ qua</option><option value={72}>3 ngày qua</option>
                    </select>
                    <button className="btn-apply" onClick={fetchRecentActivity}>Áp dụng</button>
                </div>
            </div>
            
            <div className="recent-layout-grid">
                {/* Cột 1: Danh sách Hoạt động (SETTLE, UPDATE...) */}
                <div className="activity-column">
                    <h4 className="column-title"><FiList /> Nhật ký thao tác ({recentData.activities.length})</h4>
                    {recentData.activities.length > 0 ? (
                        <div className="activity-list">
                            {recentData.activities.map((act) => (
                                <div key={act.logId} className="activity-item">
                                    <div className="activity-time">
                                        {formatDateTime(act.createdAt)}
                                    </div>
                                    <div className="activity-content">
                                        <div className="activity-header">
                                            <div className="user-group">
                                                <span className="activity-user">{act.username}</span>
                                                {act.employeeName && <span className="employee-name">({act.employeeName})</span>}
                                            </div>
                                            <span className="module-tag">{act.moduleDisplayName || act.module}</span>
                                            {renderActionBadge(act.action)}
                                        </div>
                                        <div className="activity-description">
                                            {act.description}
                                        </div>
                                        <div className="activity-meta">
                                            <span>IP: {act.ipAddress}</span>
                                            {act.entityType && (
                                                <>
                                                    <span className="divider">•</span>
                                                    <span>Đối tượng: {act.entityType} 
                                                        <strong> #{act.entityId}</strong> 
                                                        {act.entityName && <span className="entity-name"> ({act.entityName})</span>}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state-small"><p>Không có hoạt động thao tác nào trong khoảng thời gian này.</p></div>
                    )}
                </div>

                {/* Cột 2: Danh sách Đăng nhập (LOGIN_SUCCESS...) */}
                <div className="logins-column">
                    <h4 className="column-title"><FiLogIn /> Đăng nhập gần đây ({recentData.logins.length})</h4>
                    {recentData.logins.length > 0 ? (
                        <div className="recent-logins-list">
                            {recentData.logins.map((login) => (
                                <div key={login.logId} className="mini-login-item">
                                    <div className="mini-login-header">
                                        <strong>{login.username}</strong>
                                        <small>{formatDateTime(login.createdAt)}</small>
                                    </div>
                                    <div className="mini-login-meta">
                                        <span>{login.employeeName}</span>
                                        <span className="ip-tag">{login.ipAddress}</span>
                                    </div>
                                    <div style={{marginTop:'4px'}}>
                                        {renderStatusBadge(login.status)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state-small"><p>Không có lượt đăng nhập nào.</p></div>
                    )}
                </div>
            </div>
        </div>
    );

    // ==================== MAIN RENDER ====================
    return (
        <div className="audit-logs-page">
            <div className="page-header">
                <div className="header-left">
                    <FiFileText className="page-icon" />
                    <div>
                        <h1>Nhật ký hoạt động</h1>
                        <p>Theo dõi và kiểm tra lịch sử hoạt động hệ thống</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn-refresh" onClick={fetchData} disabled={loading}>
                        <FiRefreshCw className={loading ? 'spinning' : ''} /> Làm mới
                    </button>
                </div>
            </div>

            <div className="view-tabs">
                <button className={`tab ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveView('dashboard')}><FiActivity /> Dashboard</button>
                <button className={`tab ${activeView === 'search' ? 'active' : ''}`} onClick={() => setActiveView('search')}><FiSearch /> Tìm kiếm</button>
                <button className={`tab ${activeView === 'logins' ? 'active' : ''}`} onClick={() => setActiveView('logins')}><FiLogIn /> Lịch sử Đăng nhập</button>
                <button className={`tab ${activeView === 'failed' ? 'active' : ''}`} onClick={() => setActiveView('failed')}><FiShield /> Đăng nhập Thất bại</button>
                <button className={`tab ${activeView === 'recent' ? 'active' : ''}`} onClick={() => setActiveView('recent')}><FiClock /> Hoạt động gần đây</button>
                <button className={`tab ${activeView === 'statistics' ? 'active' : ''}`} onClick={() => setActiveView('statistics')}><FiBarChart2 /> Thống kê chi tiết</button>
            </div>

            {error && <div className="error-message"><FiAlertCircle /> <span>{error}</span><button onClick={fetchData}>Thử lại</button></div>}
            
            {loading && !dashboardData && activeView === 'dashboard' && (
                <div className="loading-container"><div className="spinner"></div><p>Đang tải dữ liệu...</p></div>
            )}

            {!loading && !error && (
                <>
                    {activeView === 'dashboard' && renderDashboardView()}
                    {activeView === 'recent' && renderRecentView()}
                    
                    {/* SEARCH VIEW */}
                    {activeView === 'search' && (
                        <div className="content-section">
                            <div className="search-filters">
                                <h3><FiFilter /> Bộ lọc tìm kiếm</h3>
                                <div className="filters-grid">
                                    <div className="filter-item"><label>User</label><input type="text" value={searchParams.username} onChange={e=>setSearchParams({...searchParams,username:e.target.value})} placeholder="Username..."/></div>
                                    <div className="filter-item"><label>Action</label><select value={searchParams.action} onChange={e=>setSearchParams({...searchParams,action:e.target.value})}><option value="">All</option><option value="CREATE">CREATE</option><option value="UPDATE">UPDATE</option><option value="DELETE">DELETE</option><option value="SETTLE">SETTLE</option></select></div>
                                    <div className="filter-item"><label>Module</label><select value={searchParams.module} onChange={e=>setSearchParams({...searchParams,module:e.target.value})}><option value="">All</option><option value="DEPOSIT">DEPOSIT</option><option value="PATIENT">PATIENT</option><option value="PRESCRIPTION">PRESCRIPTION</option></select></div>
                                    <div className="filter-item"><label>Entity ID</label><input type="text" value={searchParams.entityId} onChange={e=>setSearchParams({...searchParams,entityId:e.target.value})}/></div>
                                    <div className="filter-item"><label>IP</label><input type="text" value={searchParams.ipAddress} onChange={e=>setSearchParams({...searchParams,ipAddress:e.target.value})}/></div>
                                    <div className="filter-item"><label>Start</label><input type="datetime-local" value={searchParams.startDate} onChange={e=>setSearchParams({...searchParams,startDate:e.target.value})}/></div>
                                    <div className="filter-item"><label>End</label><input type="datetime-local" value={searchParams.endDate} onChange={e=>setSearchParams({...searchParams,endDate:e.target.value})}/></div>
                                </div>
                                <div className="filter-actions">
                                    <button className="btn-search" onClick={()=>handleSearch(0)}><FiSearch /> Tìm kiếm</button>
                                    <button className="btn-clear" onClick={clearSearchFilters}><FiX /> Xóa lọc</button>
                                </div>
                            </div>
                            {searchResults.length > 0 && (
                                <div className="results-section">
                                    <div className="results-header"><h3>Kết quả ({pagination.totalElements})</h3><span>Trang {pagination.page + 1}/{pagination.totalPages}</span></div>
                                    <div className="logs-table">
                                        <table>
                                            <thead><tr><th>ID</th><th>Time</th><th>User</th><th>Action</th><th>Module</th><th>Target</th><th>Desc</th><th>IP</th></tr></thead>
                                            <tbody>
                                                {searchResults.map(log => (
                                                    <tr key={log.logId}>
                                                        <td>{log.logId}</td><td>{formatDateTime(log.createdAt)}</td><td><strong>{log.username}</strong><br/><small>{log.employeeName}</small></td>
                                                        <td>{renderActionBadge(log.action)}</td><td>{log.module}</td><td>{log.entityType} #{log.entityId}</td><td>{log.description}</td><td>{log.ipAddress}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="pagination">
                                        <button onClick={()=>handleSearch(pagination.page-1)} disabled={pagination.page===0}>Prev</button>
                                        <span>Page {pagination.page+1} of {pagination.totalPages}</span>
                                        <button onClick={()=>handleSearch(pagination.page+1)} disabled={pagination.page>=pagination.totalPages-1}>Next</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* LOGINS VIEW */}
                    {activeView === 'logins' && (
                        <div className="content-section">
                            <div className="search-filters">
                                <h3>Bộ lọc Lịch sử Đăng nhập</h3>
                                <div className="filters-grid">
                                    <div className="filter-item"><label>User</label><input type="text" value={loginFilters.username} onChange={e=>setLoginFilters({...loginFilters,username:e.target.value})}/></div>
                                    <div className="filter-item"><label>Status</label><select value={loginFilters.status} onChange={e=>setLoginFilters({...loginFilters,status:e.target.value})}><option value="">All</option><option value="SUCCESS">Success</option><option value="FAILED">Failed</option></select></div>
                                </div>
                                <div className="filter-actions"><button className="btn-search" onClick={()=>fetchLoginHistory(0)}>Tìm</button><button className="btn-clear" onClick={clearLoginFilters}>Clear</button></div>
                            </div>
                            <div className="logs-table">
                                <table>
                                    <thead><tr><th>ID</th><th>Time</th><th>User</th><th>IP</th><th>Status</th></tr></thead>
                                    <tbody>
                                        {loginHistory.map(log => (
                                            <tr key={log.logId}><td>{log.logId}</td><td>{formatDateTime(log.createdAt)}</td><td>{log.username}</td><td>{log.ipAddress}</td><td>{renderStatusBadge(log.status)}</td></tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {loginPagination.totalPages > 1 && <div className="pagination"><button onClick={()=>fetchLoginHistory(loginPagination.page-1)} disabled={loginPagination.page===0}>Prev</button><span>{loginPagination.page+1}</span><button onClick={()=>fetchLoginHistory(loginPagination.page+1)} disabled={loginPagination.page>=loginPagination.totalPages-1}>Next</button></div>}
                        </div>
                    )}

                    {/* FAILED LOGINS VIEW */}
                    {activeView === 'failed' && (
                        <div className="content-section">
                             <div className="section-header">
                                 <h3>Đăng nhập thất bại ({failedPagination.totalElements})</h3>
                                 <div className="filters-inline">
                                     <button className="btn-refresh" onClick={() => fetchFailedLogins(0)}>
                                        <FiRefreshCw /> Tải lại
                                     </button>
                                 </div>
                             </div>
                             <div className="failed-logins-grid">
                                {failedLogins.map((item) => (
                                    <div key={item.logId} className="failed-login-card">
                                        <div className="card-header" style={{borderBottom: '1px solid #fee2e2', paddingBottom: '10px', marginBottom: '10px'}}>
                                            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                                <FiUser className="text-red"/>
                                                <strong>{item.username}</strong>
                                            </div>
                                            <span className="badge badge-danger">{item.statusDisplayName || 'Thất bại'}</span>
                                        </div>
                                        <div className="card-body">
                                            <div className="stat-row">
                                                <span>Lý do:</span>
                                                <strong className="text-red">{item.failureReason}</strong>
                                            </div>
                                            <div className="stat-row">
                                                <span>Thời gian:</span>
                                                <span>{formatDateTime(item.createdAt)}</span>
                                            </div>
                                            <div className="stat-row">
                                                <span>IP:</span>
                                                <code className="ip-tag">{item.ipAddress}</code>
                                            </div>
                                            <div className="stat-row" style={{flexDirection: 'column', alignItems: 'flex-start', gap: '4px', marginTop: '5px'}}>
                                                <span style={{fontSize: '0.8rem', color: '#666'}}>User Agent:</span>
                                                <span style={{fontSize: '0.75rem', color: '#888', wordBreak: 'break-all'}}>
                                                    {item.userAgent}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                             </div>
                             {failedPagination.totalPages > 1 && (
                                <div className="pagination">
                                    <button onClick={() => fetchFailedLogins(failedPagination.page - 1)} disabled={failedPagination.page === 0}>Trước</button>
                                    <span>Trang {failedPagination.page + 1} / {failedPagination.totalPages}</span>
                                    <button onClick={() => fetchFailedLogins(failedPagination.page + 1)} disabled={failedPagination.page >= failedPagination.totalPages - 1}>Sau</button>
                                </div>
                             )}
                             {failedLogins.length === 0 && !loading && (
                                <div className="empty-state-small">
                                    <p>Không có dữ liệu đăng nhập thất bại.</p>
                                </div>
                             )}
                        </div>
                    )}

                    {/* STATISTICS VIEW (UPDATED) */}
                    {activeView === 'statistics' && statistics && (
                        <div className="content-section">
                            <div className="section-header">
                                <h3>Thống kê chi tiết</h3>
                                <div className="filters-inline">
                                    <input type="date" value={statsDateRange.startDate} onChange={(e) => setStatsDateRange({...statsDateRange, startDate: e.target.value})} />
                                    <input type="date" value={statsDateRange.endDate} onChange={(e) => setStatsDateRange({...statsDateRange, endDate: e.target.value})} />
                                    <button className="btn-apply" onClick={fetchStatistics}>Áp dụng</button>
                                </div>
                            </div>

                            {/* 1. Tổng quan số liệu */}
                            <div className="stats-section">
                                <h4>Tổng quan</h4>
                                <div className="stats-grid-small">
                                    <div className="stat-card-small">
                                        <div className="stat-label">Tổng đăng nhập</div>
                                        <div className="stat-value-large">{statistics.todayLoginTotal}</div>
                                    </div>
                                    <div className="stat-card-small success">
                                        <div className="stat-label">Đăng nhập thành công</div>
                                        <div className="stat-value-large text-green">{statistics.todayLoginSuccess}</div>
                                    </div>
                                    <div className="stat-card-small danger">
                                        <div className="stat-label">Đăng nhập thất bại</div>
                                        <div className="stat-value-large text-red">{statistics.todayLoginFailed}</div>
                                    </div>
                                    <div className="stat-card-small info">
                                        <div className="stat-label">Tổng hoạt động</div>
                                        <div className="stat-value-large text-blue">{statistics.todayActivityTotal}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="dashboard-grid" style={{marginTop: '20px'}}>
                                {/* 2. Phân loại Đăng nhập */}
                                {statistics.loginByAction && statistics.loginByAction.length > 0 && (
                                    <div className="dashboard-card">
                                        <h4>Phân loại Đăng nhập</h4>
                                        <div className="bar-chart">
                                            {statistics.loginByAction.map((item, index) => (
                                                <div key={index} className="bar-item">
                                                    <div className="bar-label">
                                                        <span>{item.actionDisplayName || item.action}</span>
                                                        <strong>{item.count}</strong>
                                                    </div>
                                                    <div className="bar-container">
                                                        <div className="bar-fill" style={{ width: `${(item.count / statistics.todayLoginTotal) * 100}%`, background: item.action === 'LOGIN_SUCCESS' ? '#10b981' : '#ef4444' }}></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 3. Phân loại Hoạt động (Action) */}
                                {statistics.activityByAction && statistics.activityByAction.length > 0 && (
                                    <div className="dashboard-card">
                                        <h4>Phân loại Hoạt động</h4>
                                        <div className="bar-chart">
                                            {statistics.activityByAction.map((item, index) => (
                                                <div key={index} className="bar-item">
                                                    <div className="bar-label">
                                                        <span>{item.actionDisplayName || item.action}</span>
                                                        <strong>{item.count}</strong>
                                                    </div>
                                                    <div className="bar-container">
                                                        <div className="bar-fill" style={{ width: `${(item.count / statistics.todayActivityTotal) * 100}%`, background: '#8b5cf6' }}></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 4. Phân loại Module */}
                                {statistics.activityByModule && statistics.activityByModule.length > 0 && (
                                    <div className="dashboard-card">
                                        <h4>Hoạt động theo Module</h4>
                                        <div className="bar-chart">
                                            {statistics.activityByModule.map((item, index) => (
                                                <div key={index} className="bar-item">
                                                    <div className="bar-label">
                                                        <span>{item.moduleDisplayName || item.module}</span>
                                                        <strong>{item.count}</strong>
                                                    </div>
                                                    <div className="bar-container">
                                                        <div className="bar-fill" style={{ width: `${(item.count / statistics.todayActivityTotal) * 100}%`, background: '#3b82f6' }}></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AuditLogsPage;