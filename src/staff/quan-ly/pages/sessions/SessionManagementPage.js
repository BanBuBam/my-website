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
                    setActiveSessions(response.data.activeSessions || []);
                }
            } else if (activeView === 'statistics') {
                const response = await adminSessionAPI.getSessionStatistics();
                if (response && response.data) {
                    setStatistics(response.data);
                }
            }
        } catch (err) {
            console.error('Error fetching session data:', err);
            setError(err.message || 'Không thể tải dữ liệu sessions');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchUser = async () => {
        if (!searchUsername.trim()) {
            alert('Vui lòng nhập username');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await adminSessionAPI.getSessionsByUsername(searchUsername.trim());
            
            if (response && response.data) {
                setUserSessions(response.data);
                if (response.data.length === 0) {
                    alert(`Không tìm thấy session nào cho user: ${searchUsername}`);
                }
            }
        } catch (err) {
            console.error('Error searching user sessions:', err);
            alert(err.message || 'Không thể tìm kiếm sessions');
        } finally {
            setLoading(false);
        }
    };

    const handleTerminateSession = async (sessionId, username) => {
        const confirmMessage = `Bạn có chắc chắn muốn đóng phiên đăng nhập này?\n\nSession ID: ${sessionId}\nUser: ${username}\n\nNgười dùng sẽ bị đăng xuất ngay lập tức!`;
        
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
        const confirmMessage = `Bạn có chắc chắn muốn đóng TẤT CẢ phiên đăng nhập của user "${username}"?\n\nNgười dùng sẽ bị đăng xuất khỏi tất cả thiết bị!`;
        
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
                        <h1>Quản lý Sessions</h1>
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
                    <FiUsers /> Online Users
                </button>
                <button
                    className={`tab ${activeView === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveView('all')}
                >
                    <FiActivity /> All Active Sessions
                </button>
                <button
                    className={`tab ${activeView === 'statistics' ? 'active' : ''}`}
                    onClick={() => setActiveView('statistics')}
                >
                    <FiClock /> Statistics
                </button>
            </div>

            {/* Search User Sessions */}
            <div className="search-section">
                <div className="search-box">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Tìm kiếm sessions theo username..."
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
                        <h3>Sessions của user: {searchUsername}</h3>
                        <button
                            className="btn-terminate-all"
                            onClick={() => handleTerminateAllUserSessions(searchUsername)}
                        >
                            <FiLogOut /> Đóng tất cả sessions
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
                                        <strong>Login:</strong> {formatDateTime(session.loginTime)}
                                    </div>
                                    <div className="info-item">
                                        <strong>Duration:</strong> {formatDuration(session.loginTime)}
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
                        <h3>Users đang Online ({onlineUsers.length})</h3>
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
                            <p>Không có user nào online trong {hoursBack} giờ qua</p>
                        </div>
                    ) : (
                        <div className="users-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>User ID</th>
                                        <th>Username</th>
                                        <th>Tên nhân viên</th>
                                        <th>Session ID</th>
                                        <th>IP Address</th>
                                        <th>Login Time</th>
                                        <th>Duration</th>
                                        <th>Sessions</th>
                                        <th>Status</th>
                                        <th>Actions</th>
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
                                                    title="Đóng session"
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
                        <h3>Tất cả Active Sessions ({activeSessions.length})</h3>
                    </div>

                    {activeSessions.length === 0 ? (
                        <div className="empty-state">
                            <FiActivity />
                            <p>Không có session nào đang active</p>
                        </div>
                    ) : (
                        <div className="users-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>User ID</th>
                                        <th>Employee ID</th>
                                        <th>Username</th>
                                        <th>Session ID</th>
                                        <th>IP Address</th>
                                        <th>Login Time</th>
                                        <th>Duration</th>
                                        <th>Sessions</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeSessions.map((session) => (
                                        <tr key={session.sessionId}>
                                            <td>{session.userId}</td>
                                            <td>{session.employeeId || 'N/A'}</td>
                                            <td className="username">{session.username}</td>
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
                                                    title="Đóng session"
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
                        <h3>Thống kê Sessions</h3>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon blue">
                                <FiUsers />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{statistics.currentOnlineUsers}</div>
                                <div className="stat-label">Users Online hiện tại</div>
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

                        <div className="stat-card">
                            <div className="stat-icon purple">
                                <FiMonitor />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{statistics.peakConcurrentUsers}</div>
                                <div className="stat-label">Peak Concurrent Users</div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon teal">
                                <FiClock />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{statistics.avgSessionDurationMinutes} phút</div>
                                <div className="stat-label">Thời gian session TB</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SessionManagementPage;

