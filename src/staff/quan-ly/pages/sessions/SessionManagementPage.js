import React, { useState, useEffect } from 'react';
import './SessionManagementPage.css';
import {
    FiUsers, FiMonitor, FiRefreshCw, FiAlertCircle,
    FiActivity, FiClock, FiLogOut, FiUser, FiSearch, FiX
} from 'react-icons/fi';
import { adminSessionAPI } from '../../../../services/staff/adminAPI';

const SessionManagementPage = () => {
    const [activeView, setActiveView] = useState('online'); // 'online', 'all', 'statistics'
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [activeSessions, setActiveSessions] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchUsername, setSearchUsername] = useState('');
    const [userSessions, setUserSessions] = useState([]);
    const [hoursBack, setHoursBack] = useState(8);
    const [terminatingSessionId, setTerminatingSessionId] = useState(null);

    useEffect(() => {
        fetchData();
    }, [activeView, hoursBack]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            if (activeView === 'online') {
                const response = await adminSessionAPI.getOnlineUsers(hoursBack);
                if (response && response.data) {
                    setOnlineUsers(response.data);
                }
            } else if (activeView === 'all') {
                const response = await adminSessionAPI.getActiveSessions();
                if (response && response.data) {
                    // API trả về data là array trực tiếp, không phải object có property activeSessions
                    setActiveSessions(Array.isArray(response.data) ? response.data : []);
                }
            } else if (activeView === 'statistics') {
                const response = await adminSessionAPI.getSessionStatistics();
                if (response && response.data) {
                    setStatistics(response.data);
                }
            }
        } catch (err) {
            console.error('Error fetching session data:', err);
            setError(err.message || 'Không thể tải dữ liệu phiên đăng nhập');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchUser = async () => {
        if (!searchUsername.trim()) {
            alert('Vui lòng nhập tên đăng nhập');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await adminSessionAPI.getSessionsByUsername(searchUsername.trim());

            if (response && response.data) {
                setUserSessions(response.data);
                if (response.data.length === 0) {
                    alert(`Không tìm thấy phiên đăng nhập nào cho người dùng: ${searchUsername}`);
                }
            }
        } catch (err) {
            console.error('Error searching user sessions:', err);
            alert(err.message || 'Không thể tìm kiếm phiên đăng nhập');
        } finally {
            setLoading(false);
        }
    };

    const handleTerminateSession = async (sessionId, username) => {
        const confirmMessage = `Bạn có chắc chắn muốn đóng phiên đăng nhập này?\n\nMã phiên: ${sessionId}\nNgười dùng: ${username}\n\nNgười dùng sẽ bị đăng xuất ngay lập tức!`;

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            setTerminatingSessionId(sessionId);
            const response = await adminSessionAPI.terminateSession(sessionId);

            if (response && response.status === 'OK') {
                alert('Đã đóng phiên đăng nhập thành công!');
                fetchData();
                if (userSessions.length > 0) {
                    handleSearchUser();
                }
            }
        } catch (err) {
            console.error('Error terminating session:', err);
            alert(err.message || 'Không thể đóng phiên đăng nhập');
        } finally {
            setTerminatingSessionId(null);
        }
    };

    const handleTerminateAllUserSessions = async (username) => {
        const confirmMessage = `Bạn có chắc chắn muốn đóng TẤT CẢ phiên đăng nhập của người dùng "${username}"?\n\nNgười dùng sẽ bị đăng xuất khỏi tất cả thiết bị!`;

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            setLoading(true);
            const response = await adminSessionAPI.terminateAllUserSessions(username);

            if (response && response.status === 'OK') {
                alert(response.message || 'Đã đóng tất cả phiên đăng nhập!');
                fetchData();
                setUserSessions([]);
                setSearchUsername('');
            }
        } catch (err) {
            console.error('Error terminating all sessions:', err);
            alert(err.message || 'Không thể đóng phiên đăng nhập');
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const formatDuration = (loginTime) => {
        if (!loginTime) return 'N/A';
        const start = new Date(loginTime);
        const now = new Date();
        const diffMs = now - start;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 60) return `${diffMins} phút`;
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return `${hours}h ${mins}m`;
    };

    return (
        <div className="session-management-page">
            {/* Page Header */}
            <div className="page-header">
                <div className="header-left">
                    <FiMonitor className="page-icon" />
                    <div>
                        <h1>Quản lý Phiên đăng nhập</h1>
                        <p>Giám sát và quản lý phiên đăng nhập của người dùng</p>
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
                    className={`tab ${activeView === 'online' ? 'active' : ''}`}
                    onClick={() => setActiveView('online')}
                >
                    <FiUsers /> Người dùng Online
                </button>
                <button
                    className={`tab ${activeView === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveView('all')}
                >
                    <FiActivity /> Tất cả phiên hoạt động
                </button>
                <button
                    className={`tab ${activeView === 'statistics' ? 'active' : ''}`}
                    onClick={() => setActiveView('statistics')}
                >
                    <FiClock /> Thống kê
                </button>
            </div>

            {/* Search User Sessions */}
            <div className="search-section">
                <div className="search-box">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Tìm kiếm phiên đăng nhập theo tên đăng nhập..."
                        value={searchUsername}
                        onChange={(e) => setSearchUsername(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearchUser()}
                    />
                    {searchUsername && (
                        <button
                            className="btn-clear"
                            onClick={() => {
                                setSearchUsername('');
                                setUserSessions([]);
                            }}
                        >
                            <FiX />
                        </button>
                    )}
                </div>
                <button className="btn-search" onClick={handleSearchUser}>
                    <FiSearch /> Tìm kiếm
                </button>
            </div>

            {/* User Sessions Results */}
            {userSessions.length > 0 && (
                <div className="user-sessions-section">
                    <div className="section-header">
                        <h3>Phiên đăng nhập của người dùng: {searchUsername}</h3>
                        <button
                            className="btn-terminate-all"
                            onClick={() => handleTerminateAllUserSessions(searchUsername)}
                        >
                            <FiLogOut /> Đóng tất cả phiên
                        </button>
                    </div>
                    <div className="sessions-grid">
                        {userSessions.map((session) => (
                            <div key={session.sessionId} className="session-card">
                                <div className="session-header">
                                    <span className="session-id">{session.sessionId}</span>
                                    <button
                                        className="btn-terminate-small"
                                        onClick={() => handleTerminateSession(session.sessionId, session.username)}
                                        disabled={terminatingSessionId === session.sessionId}
                                    >
                                        {terminatingSessionId === session.sessionId ? (
                                            <div className="spinner-small"></div>
                                        ) : (
                                            <FiLogOut />
                                        )}
                                    </button>
                                </div>
                                <div className="session-info">
                                    <div className="info-item">
                                        <strong>IP:</strong> {session.ipAddress}
                                    </div>
                                    <div className="info-item">
                                        <strong>Đăng nhập:</strong> {formatDateTime(session.loginTime)}
                                    </div>
                                    <div className="info-item">
                                        <strong>Thời lượng:</strong> {formatDuration(session.loginTime)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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

            {/* Online Users View */}
            {!loading && !error && activeView === 'online' && (
                <div className="content-section">
                    <div className="section-header">
                        <h3>Người dùng đang Online ({onlineUsers.length})</h3>
                        <div className="hours-filter">
                            <label>Xem trong:</label>
                            <select value={hoursBack} onChange={(e) => setHoursBack(Number(e.target.value))}>
                                <option value={1}>1 giờ qua</option>
                                <option value={4}>4 giờ qua</option>
                                <option value={8}>8 giờ qua</option>
                                <option value={24}>24 giờ qua</option>
                            </select>
                        </div>
                    </div>

                    {onlineUsers.length === 0 ? (
                        <div className="empty-state">
                            <FiUsers />
                            <p>Không có người dùng nào online trong {hoursBack} giờ qua</p>
                        </div>
                    ) : (
                        <div className="users-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Mã người dùng</th>
                                        <th>Tên đăng nhập</th>
                                        <th>Tên nhân viên</th>
                                        <th>Mã phiên</th>
                                        <th>Địa chỉ IP</th>
                                        <th>Thời gian đăng nhập</th>
                                        <th>Thời lượng</th>
                                        <th>Số phiên</th>
                                        <th>Trạng thái</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {onlineUsers.map((user) => (
                                        <tr key={user.sessionId}>
                                            <td>{user.userId}</td>
                                            <td className="username">{user.username}</td>
                                            <td>{user.employeeName || 'N/A'}</td>
                                            <td className="session-id">{user.sessionId}</td>
                                            <td>{user.ipAddress}</td>
                                            <td>{formatDateTime(user.loginTime)}</td>
                                            <td>{formatDuration(user.loginTime)}</td>
                                            <td>
                                                <span className="badge badge-info">
                                                    {user.activeSessionCount}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge badge-${user.accountStatus === 'ACTIVE' ? 'success' : 'danger'}`}>
                                                    {user.accountStatus}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn-terminate"
                                                    onClick={() => handleTerminateSession(user.sessionId, user.username)}
                                                    disabled={terminatingSessionId === user.sessionId}
                                                    title="Đóng phiên"
                                                >
                                                    {terminatingSessionId === user.sessionId ? (
                                                        <div className="spinner-small"></div>
                                                    ) : (
                                                        <FiLogOut />
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* All Active Sessions View */}
            {!loading && !error && activeView === 'all' && (
                <div className="content-section">
                    <div className="section-header">
                        <h3>Tất cả phiên hoạt động ({activeSessions.length})</h3>
                    </div>

                    {activeSessions.length === 0 ? (
                        <div className="empty-state">
                            <FiActivity />
                            <p>Không có phiên nào đang hoạt động</p>
                        </div>
                    ) : (
                        <div className="users-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Mã người dùng</th>
                                        <th>Mã nhân viên</th>
                                        <th>Tên đăng nhập</th>
                                        <th>Tên nhân viên</th>
                                        <th>Mã phiên</th>
                                        <th>Địa chỉ IP</th>
                                        <th>Thời gian đăng nhập</th>
                                        <th>Thời lượng</th>
                                        <th>Số phiên</th>
                                        <th>Trạng thái</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeSessions.map((session) => (
                                        <tr key={session.sessionId}>
                                            <td>{session.userId}</td>
                                            <td>{session.employeeId || 'N/A'}</td>
                                            <td className="username">{session.username}</td>
                                            <td>{session.employeeName || 'N/A'}</td>
                                            <td className="session-id">{session.sessionId}</td>
                                            <td>{session.ipAddress}</td>
                                            <td>{formatDateTime(session.loginTime)}</td>
                                            <td>{formatDuration(session.loginTime)}</td>
                                            <td>
                                                <span className="badge badge-info">
                                                    {session.activeSessionCount}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge badge-${session.accountStatus === 'ACTIVE' ? 'success' : 'danger'}`}>
                                                    {session.accountStatus}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn-terminate"
                                                    onClick={() => handleTerminateSession(session.sessionId, session.username)}
                                                    disabled={terminatingSessionId === session.sessionId}
                                                    title="Đóng phiên"
                                                >
                                                    {terminatingSessionId === session.sessionId ? (
                                                        <div className="spinner-small"></div>
                                                    ) : (
                                                        <FiLogOut />
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Statistics View */}
            {!loading && !error && activeView === 'statistics' && statistics && (
                <div className="content-section">
                    <div className="section-header">
                        <h3>Thống kê Phiên đăng nhập</h3>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon blue">
                                <FiUsers />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{statistics.currentOnlineUsers}</div>
                                <div className="stat-label">Người dùng Online hiện tại</div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon green">
                                <FiActivity />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{statistics.todayLogins}</div>
                                <div className="stat-label">Đăng nhập hôm nay</div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon orange">
                                <FiLogOut />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{statistics.todayLogouts}</div>
                                <div className="stat-label">Đăng xuất hôm nay</div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon red">
                                <FiAlertCircle />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{statistics.todayFailedLogins}</div>
                                <div className="stat-label">Đăng nhập thất bại</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SessionManagementPage;

